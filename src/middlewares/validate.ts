import type { ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err: any) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.errors?.map((e: any) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
    }
  };
