import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

// Middleware factory — validate req.body against a Zod schema
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body); // throws ZodError on failure → caught by errorHandler
    next();
  };
}

// Validate query string params
export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.query = schema.parse(req.query);
    next();
  };
}
