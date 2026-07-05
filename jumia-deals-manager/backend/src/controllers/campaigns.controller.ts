import { Request, Response } from "express";
import { z } from "zod";
import { CampaignStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { NotFoundError, ForbiddenError } from "../lib/errors";

// ── Validation schemas ────────────────────────────────────────────────────────

const createCampaignSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.nativeEnum(CampaignStatus).default("DRAFT"),
  eligibleCategories: z.array(z.string()).default([]),
  eligibleBrands: z.array(z.string()).default([]),
});

const updateCampaignSchema = createCampaignSchema.partial();

const listCampaignsQuerySchema = z.object({
  status: z.nativeEnum(CampaignStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ── GET /api/campaigns ────────────────────────────────────────────────────────
export async function listCampaigns(req: Request, res: Response) {
  const { status, page, limit } = listCampaignsQuerySchema.parse(req.query);

  const where = status ? { status } : {};

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      orderBy: { startDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { submissions: true } },
      },
    }),
    prisma.campaign.count({ where }),
  ]);

  return res.json({
    success: true,
    data: campaigns,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

// ── GET /api/campaigns/:id ────────────────────────────────────────────────────
export async function getCampaign(req: Request, res: Response) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: {
      _count: { select: { submissions: true } },
    },
  });
  if (!campaign) throw new NotFoundError("Campaign", req.params.id);
  return res.json({ success: true, data: campaign });
}

// ── POST /api/campaigns (Admin only) ─────────────────────────────────────────
export async function createCampaign(req: Request, res: Response) {
  const body = createCampaignSchema.parse(req.body);

  if (body.endDate <= body.startDate) {
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "endDate must be after startDate.",
    });
  }

  const campaign = await prisma.campaign.create({ data: body });
  return res.status(201).json({ success: true, data: campaign });
}

// ── PUT /api/campaigns/:id (Admin only) ──────────────────────────────────────
export async function updateCampaign(req: Request, res: Response) {
  const existing = await prisma.campaign.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new NotFoundError("Campaign", req.params.id);

  const body = updateCampaignSchema.parse(req.body);
  const campaign = await prisma.campaign.update({
    where: { id: req.params.id },
    data: body,
  });
  return res.json({ success: true, data: campaign });
}

// ── DELETE /api/campaigns/:id (Admin only) ────────────────────────────────────
export async function deleteCampaign(req: Request, res: Response) {
  const existing = await prisma.campaign.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new NotFoundError("Campaign", req.params.id);

  // Prevent deletion if there are any submissions already made
  const subCount = await prisma.submission.count({ where: { campaignId: req.params.id } });
  if (subCount > 0) {
    throw new ForbiddenError(
      `Cannot delete a campaign with ${subCount} existing submission(s). Set status to CANCELLED instead.`
    );
  }

  await prisma.campaign.delete({ where: { id: req.params.id } });
  return res.json({ success: true, message: "Campaign deleted." });
}
