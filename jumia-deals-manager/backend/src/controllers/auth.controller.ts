import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { NotFoundError, ValidationError } from "../lib/errors";

// ── Validation schemas ────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "VENDOR"]).default("VENDOR"),
  vendorId: z.string().uuid().optional(), // Required when role === VENDOR
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function signToken(user: { id: string; email: string; role: string; vendorId?: string | null }) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      vendorId: user.vendorId ?? null,
    },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "7d" }
  );
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
export async function register(req: Request, res: Response) {
  const body = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) throw new ValidationError("Email already in use.");

  if (body.role === "VENDOR" && !body.vendorId) {
    throw new ValidationError("vendorId is required for VENDOR role.");
  }

  const passwordHash = await bcrypt.hash(body.password, 12);

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash,
      role: body.role,
      vendorId: body.role === "VENDOR" ? body.vendorId : null,
    },
    select: { id: true, name: true, email: true, role: true, vendorId: true },
  });

  const token = signToken(user);
  return res.status(201).json({ success: true, data: { user, token } });
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export async function login(req: Request, res: Response) {
  const body = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) throw new NotFoundError("User");

  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) throw new ValidationError("Invalid credentials.");

  const token = signToken(user);
  return res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorId: user.vendorId,
      },
      token,
    },
  });
}

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      vendorId: true,
      vendor: { select: { id: true, companyName: true } },
    },
  });
  if (!user) throw new NotFoundError("User");
  return res.json({ success: true, data: user });
}
