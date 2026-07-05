import { Request, Response } from "express";
import Papa from "papaparse";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ValidationError, ForbiddenError, NotFoundError, ConflictError } from "../lib/errors";

// =============================================================================
// POST /api/submissions/bulk-upload
//
// Accepts a CSV file upload with columns:
//   sku, promoPrice, promoStock
//
// Architecture:
//   - Streaming CSV parse with PapaParse
//   - Single-pass bulk validation (fetches all products in one DB query)
//   - Transactional write (all-or-nothing per request)
//   - Returns a detailed error report per failed row so vendor can fix and re-upload
//
// For production scale (5,000+ SKUs), see ARCHITECTURE.md for the
// async queue-based pattern that offloads this to a background worker.
// =============================================================================

const MAX_ROWS = parseInt(process.env.MAX_CSV_ROWS ?? "5000", 10);

interface CsvRow {
  sku: string;
  promoPrice: string;
  promoStock: string;
}

interface RowError {
  row: number;
  sku: string;
  reason: string;
}

export async function bulkUploadSubmission(req: Request, res: Response) {
  if (req.user!.role !== "VENDOR") throw new ForbiddenError("Only vendors can submit.");
  const vendorId = req.user!.vendorId!;

  const { campaignId } = req.body as { campaignId?: string };
  if (!campaignId) throw new ValidationError("campaignId is required in the form body.");

  if (!req.file) throw new ValidationError("No CSV file uploaded. Field name must be 'file'.");

  // 1. Parse CSV from buffer
  const csvText = req.file.buffer.toString("utf-8");
  const { data, errors: parseErrors } = Papa.parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (parseErrors.length > 0) {
    throw new ValidationError(`CSV parse errors: ${parseErrors.map((e) => e.message).join("; ")}`);
  }

  if (data.length === 0) throw new ValidationError("CSV file contains no data rows.");
  if (data.length > MAX_ROWS) {
    throw new ValidationError(
      `CSV exceeds maximum row limit of ${MAX_ROWS}. Split into smaller files.`
    );
  }

  // 2. Validate campaign
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new NotFoundError("Campaign", campaignId);
  if (campaign.status !== "ACTIVE") {
    throw new ValidationError(`Campaign is not active (status: ${campaign.status}).`);
  }

  // 3. Check for duplicate submission
  const existingSub = await prisma.submission.findUnique({
    where: { campaignId_vendorId: { campaignId, vendorId } },
  });
  if (existingSub) {
    throw new ConflictError(
      `Submission already exists for this campaign (id: ${existingSub.id}).`
    );
  }

  // 4. Bulk-fetch all referenced SKUs in ONE query
  const allSkus = [...new Set(data.map((r) => r.sku?.trim()).filter(Boolean))];
  const products = await prisma.product.findMany({ where: { sku: { in: allSkus } } });
  const productMap = new Map(products.map((p) => [p.sku, p]));

  // 5. Validate all rows; collect errors
  const rowErrors: RowError[] = [];
  const validItems: {
    productSku: string;
    promoPrice: Prisma.Decimal;
    promoStock: number;
    discountPct: Prisma.Decimal;
  }[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 2; // +2 = 1-indexed + header row
    const sku = row.sku?.trim();

    if (!sku) {
      rowErrors.push({ row: rowNum, sku: "", reason: "Missing SKU." });
      continue;
    }

    const promoPriceRaw = parseFloat(row.promoPrice);
    const promoStockRaw = parseInt(row.promoStock, 10);

    if (isNaN(promoPriceRaw) || promoPriceRaw <= 0) {
      rowErrors.push({ row: rowNum, sku, reason: `Invalid promoPrice: '${row.promoPrice}'.` });
      continue;
    }
    if (isNaN(promoStockRaw) || promoStockRaw <= 0) {
      rowErrors.push({ row: rowNum, sku, reason: `Invalid promoStock: '${row.promoStock}'.` });
      continue;
    }

    const product = productMap.get(sku);
    if (!product) {
      rowErrors.push({ row: rowNum, sku, reason: "SKU not found in catalog." });
      continue;
    }
    if (product.vendorId !== vendorId) {
      rowErrors.push({ row: rowNum, sku, reason: "SKU does not belong to your vendor account." });
      continue;
    }
    if (
      campaign.eligibleCategories.length > 0 &&
      !campaign.eligibleCategories.includes(product.category)
    ) {
      rowErrors.push({ row: rowNum, sku, reason: `Category '${product.category}' not eligible.` });
      continue;
    }
    if (
      campaign.eligibleBrands.length > 0 &&
      !campaign.eligibleBrands.includes(product.brand)
    ) {
      rowErrors.push({ row: rowNum, sku, reason: `Brand '${product.brand}' not eligible.` });
      continue;
    }

    const promoPrice = new Prisma.Decimal(promoPriceRaw);
    if (promoPrice.gte(product.livePrice)) {
      rowErrors.push({
        row: rowNum,
        sku,
        reason: `promoPrice (${promoPrice}) must be less than livePrice (${product.livePrice}).`,
      });
      continue;
    }

    const discountPct = new Prisma.Decimal(
      ((Number(product.livePrice) - promoPriceRaw) / Number(product.livePrice)) * 100
    ).toDecimalPlaces(2);

    validItems.push({ productSku: sku, promoPrice, promoStock: promoStockRaw, discountPct });
  }

  // If any rows failed, return errors — don't partially save
  if (rowErrors.length > 0) {
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: `${rowErrors.length} row(s) failed validation. No submission was created.`,
      errors: rowErrors,
      validCount: validItems.length,
    });
  }

  // 6. All rows valid — create submission + items in one transaction
  const submission = await prisma.$transaction(async (tx) => {
    return tx.submission.create({
      data: {
        campaignId,
        vendorId,
        submittedById: req.user!.id,
        items: { create: validItems },
      },
      include: {
        _count: { select: { items: true } },
        campaign: { select: { id: true, title: true } },
        vendor: { select: { id: true, companyName: true } },
      },
    });
  });

  return res.status(201).json({
    success: true,
    message: `Successfully created submission with ${validItems.length} SKU(s).`,
    data: submission,
  });
}
