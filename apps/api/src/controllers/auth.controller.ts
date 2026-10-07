import { Response, RequestHandler } from "express";
import { AuthService } from "../services/auth.service";
import { SignupSchema, LoginSchema } from "@teacher-ai/contracts";
import { PrismaClient } from "@prisma/client";
import { config } from "../utils/config";

const prisma = new PrismaClient();

const setCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
};

export const signup: RequestHandler = async (req, res, next) => {
  try {
    const parsed = SignupSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.issues });
      return;
    }
    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await AuthService.findUserByEmail(normalizedEmail);
    if (existing) {
      res.status(400).json({ error: "Email already in use" });
      return;
    }

    const passwordHash = await AuthService.hashPassword(password);
    const user = await prisma.user.create({
      data: { email: normalizedEmail, passwordHash },
    });

    const token = AuthService.generateToken(user.id);
    setCookie(res, token);

    res.status(201).json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await AuthService.findUserByEmail(normalizedEmail);
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isValid = await AuthService.verifyPassword(
      user.passwordHash,
      password,
    );
    if (!isValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = AuthService.generateToken(user.id);
    setCookie(res, token);

    res.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
};

export const me: RequestHandler = (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({ user: { id: req.user.id, email: req.user.email } });
};
