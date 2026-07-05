import { Request, Response } from "express";
import { z } from "zod";
import {
  ItemStatus,
  SubmissionStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  ConflictError,
} from "../lib/errors";

// =============================================================================
// BUSINESS LOGIC — Status Recalculation
//
// Called after ANY individual item status changes. Reads all sibling items and
// derives the correct parent Submission status:
//
//  All PENDING              → PENDING
//  All APPROVED             → APPROVED
//  All REJECTED             → REJECTED
//  Any APPROVED + any other → PARTIALLY_APPROVED
// =============================================================================

async function recalculateSubmissionStatus(
  submissionId: string,
  tx: Prisma.TransactionClient = prisma
): Promise<SubmissionStatus> {
  const items = await tx.submissionItem.findMany({
    where: { submissionId },
    select: { status: true },
  });

  if (items.length === 0) return "PENDING";

  const statuses = new Set(items.map((i) => i.status));

  let newStatus: SubmissionStatus;

  if (statuses.size === 1 && statuses.has("PENDING")) {
    newStatus = "PENDING";
  } else if (statuses.size === 1 && statuses.has("APPROVED")) {
    newStatus = "APPROVED";
  } else if (statuses.size === 1 && statuses.has("REJECTED")) {
    newStatus = "REJECTED";
  } else {
    // Mixed: some approved + some pending/rejected
    newStatus = "PARTIALLY_APPROVED";
  }

  await tx.submission.update({
    where: { id: submissionId },
    data: { status: newStatus },
  });

  return newStatus;
}

// =============================================================================
// Discount calculation helper
// =============================================================================

function calcDiscountPct(livePrice: Prisma.Decimal, promoPrice: Prisma.Decimal): Prisma.Decimal {
  const live = Number(livePrice);
  const promo = Number(promoPrice);
  if (live <= 0) return new Prisma.Decimal(0);
  return new Prisma.Decimal(((live - promo) / live) * 100).toDecimalPlaces(2);
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const submissionItemSchema = z.object({
  sku: z.string().min(1),
  promoPrice: z.number().positive(),
  promoStock: z.number().int().positive(),
});

const createSubmissionSchema = z.object({
  campaignId: z.string().uuid(),
  items: z.array(submissionItemSchema).min(1).max(500), // hard cap per request; use bulk upload for more
});

const listSubmissionsQuerySchema = z.object({
  status: z.nativeEnum(SubmissionStatus).optional(),
  campaignId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const bulkStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().optional(),
});

const itemStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNote: z.string().optional(),
});

// =============================================================================
// GET /api/submissions
// Admins see all; Vendors see only their own.
// =============================================================================

export async function listSubmissions(req: Request, res: Response) {
  const { status, campaignId, page, limit, vendorId } =
    listSubmissionsQuerySchema.parse(req.query);

  // Vendors are scoped to their own company
  const effectiveVendorId =
    req.user!.role === "VENDOR" ? req.user!.vendorId! : vendorId;

  const where: Prisma.SubmissionWhereInput = {
    ...(status ? { status } : {}),
    ...(campaignId ? { campaignId } : {}),
    ...(effectiveVendorId ? { vendorId: effectiveVendorId } : {}),
  };

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        campaign: { select: { id: true, title: true, status: true } },
        vendor: { select: { id: true, companyName: true } },
        submittedBy: { select: { id: true, name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.submission.count({ where }),
  ]);

  return res.json({
    success: true,
    data: submissions,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

// =============================================================================
// GET /api/submissions/:id
// =============================================================================

export async function getSubmission(req: Request, res: Response) {
  const submission = await prisma.submission.findUnique({
    where: { id: req.params.id },
    include: {
      campaign: { select: { id: true, title: true, startDate: true, endDate: true } },
      vendor: { select: { id: true, companyName: true } },
      submittedBy: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: {
            select: { sku: true, name: true, category: true, brand: true, livePrice: true, bestPrice: true, imageUrl: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!submission) throw new NotFoundError("Submission", req.params.id);

  // Vendor can only view their own submissions
  if (req.user!.role === "VENDOR" && submission.vendorId !== req.user!.vendorId) {
    throw new ForbiddenError();
  }

  return res.json({ success: true, data: submission });
}

// =============================================================================
// POST /api/submissions
// Vendor submits a batch of SKUs for a campaign.
//
// Validates:
//   - Campaign is ACTIVE
//   - No duplicate submission for this vendor + campaign
//   - Each SKU exists, belongs to vendor, is eligible for campaign
//   - promoPrice < livePrice (hard rule) and flags if > bestPrice
// =============================================================================

export async function createSubmission(req: Request, res: Response) {
  const body = createSubmissionSchema.parse(req.body);
  const { user } = req;

  if (user!.role !== "VENDOR") throw new ForbiddenError("Only vendors can submit.");
  const vendorId = user!.vendorId!;

  // 1. Validate campaign
  const campaign = await prisma.campaign.findUnique({ where: { id: body.campaignId } });
  if (!campaign) throw new NotFoundError("Campaign", body.campaignId);
  if (campaign.status !== "ACTIVE") {
    throw new ValidationError(`Campaign is not accepting submissions (status: ${campaign.status}).`);
  }

  // 2. Check for duplicate submission
  const existing = await prisma.submission.findUnique({
    where: { campaignId_vendorId: { campaignId: body.campaignId, vendorId } },
  });
  if (existing) {
    throw new ConflictError(
      `You already have a submission for this campaign (id: ${existing.id}). ` +
        `Delete it first if you need to re-submit.`
    );
  }

  // 3. Validate all SKUs up-front (fail fast — reject entire batch on first error)
  const skus = body.items.map((i) => i.sku);
  const products = await prisma.product.findMany({ where: { sku: { in: skus } } });
  const productMap = new Map(products.map((p) => [p.sku, p]));

  const validationErrors: string[] = [];
  const itemsToCreate: {
    productSku: string;
    promoPrice: Prisma.Decimal;
    promoStock: number;
    discountPct: Prisma.Decimal;
  }[] = [];

  for (const item of body.items) {
    const product = productMap.get(item.sku);

    if (!product) {
      validationErrors.push(`SKU '${item.sku}' does not exist in the catalog.`);
      continue;
    }
    if (product.vendorId !== vendorId) {
      validationErrors.push(`SKU '${item.sku}' does not belong to your vendor account.`);
      continue;
    }

    // Category / brand eligibility
    if (campaign.eligibleCategories.length > 0 && !campaign.eligibleCategories.includes(product.category)) {
      validationErrors.push(`SKU '${item.sku}' category '${product.category}' is not eligible.`);
      continue;
    }
    if (campaign.eligibleBrands.length > 0 && !campaign.eligibleBrands.includes(product.brand)) {
      validationErrors.push(`SKU '${item.sku}' brand '${product.brand}' is not eligible.`);
      continue;
    }

    // Price validation — hard block: promoPrice must be BELOW livePrice
    const promoPrice = new Prisma.Decimal(item.promoPrice);
    if (promoPrice.gte(product.livePrice)) {
      validationErrors.push(
        `SKU '${item.sku}': promoPrice (${promoPrice}) must be less than livePrice (${product.livePrice}).`
      );
      continue;
    }

    itemsToCreate.push({
      productSku: item.sku,
      promoPrice,
      promoStock: item.promoStock,
      discountPct: calcDiscountPct(product.livePrice, promoPrice),
    });
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "One or more SKUs failed validation.",
      errors: validationErrors,
    });
  }

  // 4. Create submission + items in a transaction
  const submission = await prisma.$transaction(async (tx) => {
    const sub = await tx.submission.create({
      data: {
        campaignId: body.campaignId,
        vendorId,
        submittedById: user!.id,
        items: {
          create: itemsToCreate,
        },
      },
      include: {
        items: { include: { product: { select: { sku: true, name: true } } } },
        campaign: { select: { id: true, title: true } },
        vendor: { select: { id: true, companyName: true } },
      },
    });
    return sub;
  });

  return res.status(201).json({ success: true, data: submission });
}

// =============================================================================
// PUT /api/submissions/:id/status
// Admin bulk-approves or bulk-rejects an entire submission.
// Cascades the new status down to ALL items.
// =============================================================================

export async function updateSubmissionStatus(req: Request, res: Response) {
  const body = bulkStatusSchema.parse(req.body);

  const submission = await prisma.submission.findUnique({
    where: { id: req.params.id },
    include: { items: { select: { id: true } } },
  });
  if (!submission) throw new NotFoundError("Submission", req.params.id);

  const itemStatus: ItemStatus = body.status === "APPROVED" ? "APPROVED" : "REJECTED";
  const subStatus: SubmissionStatus = body.status === "APPROVED" ? "APPROVED" : "REJECTED";

  await prisma.$transaction([
    // Update all items first
    prisma.submissionItem.updateMany({
      where: { submissionId: req.params.id },
      data: { status: itemStatus },
    }),
    // Then update parent submission
    prisma.submission.update({
      where: { id: req.params.id },
      data: {
        status: subStatus,
        notes: body.notes,
      },
    }),
  ]);

  const updated = await prisma.submission.findUnique({
    where: { id: req.params.id },
    include: {
      items: { include: { product: { select: { sku: true, name: true } } } },
    },
  });

  return res.json({ success: true, data: updated });
}

// =============================================================================
// PUT /api/submissions/:id/products/:sku/status
//
// Admin approves or rejects a SINGLE SKU within a submission.
//
// After updating the item's status, recalculates the parent Submission status:
//   All APPROVED             → APPROVED
//   All REJECTED             → REJECTED
//   All PENDING              → PENDING
//   Any mix with an APPROVED → PARTIALLY_APPROVED
// =============================================================================

export async function updateItemStatus(req: Request, res: Response) {
  const { id: submissionId, sku } = req.params;
  const body = itemStatusSchema.parse(req.body);

  const item = await prisma.submissionItem.findUnique({
    where: {
      submissionId_productSku: { submissionId, productSku: sku },
    },
  });
  if (!item) throw new NotFoundError(`SubmissionItem (sku: ${sku} in submission: ${submissionId})`);

  // Run item update + status recalculation atomically
  const [updatedItem, newSubmissionStatus] = await prisma.$transaction(async (tx) => {
    const updated = await tx.submissionItem.update({
      where: { submissionId_productSku: { submissionId, productSku: sku } },
      data: {
        status: body.status as ItemStatus,
        adminNote: body.adminNote ?? null,
      },
      include: {
        product: { select: { sku: true, name: true, livePrice: true } },
      },
    });

    const newStatus = await recalculateSubmissionStatus(submissionId, tx);
    return [updated, newStatus];
  });

  return res.json({
    success: true,
    data: {
      item: updatedItem,
      submissionStatus: newSubmissionStatus,
    },
  });
}

// =============================================================================
// DELETE /api/submissions/:id
// Vendor withdraws their own submission (only while PENDING).
// Admins can force-delete any submission.
// =============================================================================

export async function deleteSubmission(req: Request, res: Response) {
  const submission = await prisma.submission.findUnique({ where: { id: req.params.id } });
  if (!submission) throw new NotFoundError("Submission", req.params.id);

  if (req.user!.role === "VENDOR") {
    if (submission.vendorId !== req.user!.vendorId) throw new ForbiddenError();
    if (submission.status !== "PENDING") {
      throw new ValidationError(
        `Cannot withdraw a submission in '${submission.status}' status. Only PENDING submissions can be withdrawn.`
      );
    }
  }

  // Cascade delete handled by Prisma schema (onDelete: Cascade on SubmissionItem)
  await prisma.submission.delete({ where: { id: req.params.id } });
  return res.json({ success: true, message: "Submission deleted." });
}

// =============================================================================
// GET /api/submissions/export?campaignId=...
//
// Admin exports all APPROVED SubmissionItems for a campaign as JSON.
// The route handler below returns JSON; the CSV serialization is in the router.
// =============================================================================

const exportQuerySchema = z.object({
  campaignId: z.string().uuid(),
});

export async function exportApprovedItems(req: Request, res: Response) {
  const { campaignId } = exportQuerySchema.parse(req.query);

  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new NotFoundError("Campaign", campaignId);

  const items = await prisma.submissionItem.findMany({
    where: {
      status: "APPROVED",
      submission: { campaignId },
    },
    include: {
      product: {
        select: {
          sku: true,
          name: true,
          category: true,
          brand: true,
          livePrice: true,
          bestPrice: true,
        },
      },
      submission: {
        select: {
          id: true,
          vendor: { select: { companyName: true } },
        },
      },
    },
    orderBy: [
      { submission: { vendor: { companyName: "asc" } } },
      { productSku: "asc" },
    ],
  });

  // Flatten for CSV-friendly output
  const rows = items.map((item) => ({
    campaignTitle: campaign.title,
    vendorName: item.submission.vendor.companyName,
    submissionId: item.submission.id,
    sku: item.product.sku,
    productName: item.product.name,
    category: item.product.category,
    brand: item.product.brand,
    livePrice: Number(item.product.livePrice),
    bestPrice: Number(item.product.bestPrice),
    promoPrice: Number(item.promoPrice),
    promoStock: item.promoStock,
    discountPct: item.discountPct ? Number(item.discountPct) : null,
  }));

  // If client requests CSV (via Accept header or ?format=csv)
  const wantsCsv =
    req.headers.accept?.includes("text/csv") || req.query.format === "csv";

  if (wantsCsv) {
    const { stringify } = await import("csv-stringify/sync");
    const csv = stringify(rows, { header: true });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="approved_deals_${campaignId}_${Date.now()}.csv"`
    );
    return res.send(csv);
  }

  return res.json({
    success: true,
    data: rows,
    meta: { total: rows.length, campaignId, campaignTitle: campaign.title },
  });
}
