import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      res.status(401).json({ error: "Unauthorized: No token provided" });
      return;
    }

    const payload = AuthService.verifyToken(token);
    if (!payload.sub) {
      res.status(401).json({ error: "Unauthorized: Invalid token payload" });
      return;
    }

    const user = await AuthService.findUserById(payload.sub as string);
    if (!user) {
      res.status(401).json({ error: "Unauthorized: User not found" });
      return;
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
};
