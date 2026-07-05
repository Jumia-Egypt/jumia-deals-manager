import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { UnauthorizedError, ForbiddenError } from "../lib/errors";

// Extend Express Request to carry the decoded JWT payload
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        vendorId?: string | null;
      };
    }
  }
}

interface JwtPayload {
  sub: string;        // user id
  email: string;
  role: Role;
  vendorId?: string | null;
}

// ── Verify JWT and attach user to req ────────────────────────────────────────
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("No token provided.");
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      vendorId: payload.vendorId,
    };
    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired token.");
  }
}

// ── Role-based access guard factory ──────────────────────────────────────────
export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError();
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Access denied. Required role(s): ${roles.join(", ")}.`
      );
    }
    next();
  };
}
