import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { config } from "../utils/config";
import { prisma } from "../utils/prisma";

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  static async verifyPassword(
    hash: string,
    password: string,
  ): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  static generateToken(userId: string): string {
    return jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: "1d" });
  }

  static verifyToken(token: string): jwt.JwtPayload | string {
    return jwt.verify(token, config.jwtSecret);
  }

  static async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  static async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }
}
