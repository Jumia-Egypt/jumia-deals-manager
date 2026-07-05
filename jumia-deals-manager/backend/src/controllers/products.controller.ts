import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { NotFoundError, ValidationError, ForbiddenError } from "../lib/errors";

// =============================================================================
// GET /api/products/validate-sku?sku=...&campaignId=...
//
// Core validation endpoint called by the frontend when a vendor enters a SKU.
// Rules enforced:
//   1. SKU exists in the master catalog
//   2. SKU belongs to the requesting vendor
//   3. Campaign exists and is ACTIVE
//   4. SKU's category/brand matches campaign eligibility filters
// =============================================================================

const validateSkuQuerySchema = z.object({
  sku: z.string().min(1),
  campaignId: z.string().uuid(),
});

export async function validateSku(req: Request, res: Response) {
  const { sku, campaignId } = validateSkuQuerySchema.parse(req.query);

  // 1. Fetch product
  const product = await prisma.product.findUnique({ where: { sku } });
  if (!product) throw new NotFoundError("Product/SKU", sku);

  // 2. Ownership check — a vendor can only submit their own SKUs
  if (req.user!.role === "VENDOR") {
    if (product.vendorId !== req.user!.vendorId) {
      throw new ForbiddenError("This SKU does not belong to your vendor account.");
    }
  }

  // 3. Campaign must be ACTIVE
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new NotFoundError("Campaign", campaignId);
  if (campaign.status !== "ACTIVE") {
    throw new ValidationError(`Campaign is not active (current status: ${campaign.status}).`);
  }

  // 4. Category / brand eligibility
  const categoryOk =
    campaign.eligibleCategories.length === 0 ||
    campaign.eligibleCategories.includes(product.category);

  const brandOk =
    campaign.eligibleBrands.length === 0 ||
    campaign.eligibleBrands.includes(product.brand);

  if (!categoryOk) {
    throw new ValidationError(
      `Product category '${product.category}' is not eligible for this campaign. ` +
        `Eligible categories: ${campaign.eligibleCategories.join(", ")}.`
    );
  }
  if (!brandOk) {
    throw new ValidationError(
      `Product brand '${product.brand}' is not eligible for this campaign. ` +
        `Eligible brands: ${campaign.eligibleBrands.join(", ")}.`
    );
  }

  // 5. Return enriched product data for the frontend form
  return res.json({
    success: true,
    data: {
      sku: product.sku,
      name: product.name,
      category: product.category,
      brand: product.brand,
      livePrice: product.livePrice,
      bestPrice: product.bestPrice,
      imageUrl: product.imageUrl,
      eligible: true,
    },
  });
}

// =============================================================================
// GET /api/products (Admin — browse full catalog)
// =============================================================================

const listProductsQuerySchema = z.object({
  vendorId: z.string().uuid().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function listProducts(req: Request, res: Response) {
  const { vendorId, category, brand, search, page, limit } =
    listProductsQuerySchema.parse(req.query);

  // Vendors can only see their own products
  const effectiveVendorId =
    req.user!.role === "VENDOR" ? req.user!.vendorId! : vendorId;

  const where = {
    ...(effectiveVendorId ? { vendorId: effectiveVendorId } : {}),
    ...(category ? { category } : {}),
    ...(brand ? { brand } : {}),
    ...(search
      ? {
          OR: [
            { sku: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return res.json({
    success: true,
    data: products,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

// =============================================================================
// GET /api/products/:sku — single product lookup
// =============================================================================

export async function getProduct(req: Request, res: Response) {
  const product = await prisma.product.findUnique({ where: { sku: req.params.sku } });
  if (!product) throw new NotFoundError("Product", req.params.sku);

  // Vendor can only view their own products
  if (req.user!.role === "VENDOR" && product.vendorId !== req.user!.vendorId) {
    throw new ForbiddenError("This SKU does not belong to your vendor account.");
  }

  return res.json({ success: true, data: product });
}
