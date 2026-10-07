import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

const users = new Map<string, any>();

vi.mock("@prisma/client", () => {
  return {
    PrismaClient: class {
      user = {
        deleteMany: vi.fn().mockImplementation(async () => {
          users.clear();
          return { count: 0 };
        }),
        findUnique: vi
          .fn()
          .mockImplementation(
            async ({ where }: { where: { email?: string; id?: string } }) => {
              if (where.email) {
                for (const u of users.values()) {
                  if (u.email === where.email) return u;
                }
                return null;
              }
              if (where.id) {
                return users.get(where.id) || null;
              }
              return null;
            },
          ),
        create: vi
          .fn()
          .mockImplementation(
            async ({
              data,
            }: {
              data: { email: string; passwordHash: string };
            }) => {
              const id = "test-uuid-" + Math.random().toString(36).substring(7);
              const user = {
                id,
                email: data.email,
                passwordHash: data.passwordHash,
                emailVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastLoginAt: null,
              };
              users.set(id, user);
              return user;
            },
          ),
        update: vi
          .fn()
          .mockImplementation(
            async ({ where, data }: { where: { id: string }; data: any }) => {
              const user = users.get(where.id);
              if (user) {
                Object.assign(user, data);
                return user;
              }
              return null;
            },
          ),
      };
      $disconnect = vi.fn().mockResolvedValue(undefined);
    },
  };
});

import request from "supertest";
import app from "../apps/api/src/index";

describe("Authentication Foundation", () => {
  beforeAll(async () => {
    users.clear();
  });

  afterAll(async () => {
    users.clear();
  });

  const testUser = {
    email: "test@example.com",
    password: "Password123",
  };

  it("should successfully signup a user and not return password hash", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user).not.toHaveProperty("passwordHash");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should reject duplicate email signup safely", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email already in use");
  });

  it("should login successfully with correct credentials", async () => {
    const res = await request(app).post("/api/v1/auth/login").send(testUser);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user).not.toHaveProperty("passwordHash");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should return 401 for generic invalid credentials", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testUser.email, password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });

  it("should return 401 for unauthenticated protected route", async () => {
    const res = await request(app).get("/api/v1/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it("should allow access to protected route with token", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send(testUser);

    const cookie = loginRes.headers["set-cookie"][0];

    const res = await request(app).get("/api/v1/auth/me").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
  });

  it("should logout and clear cookie", async () => {
    const res = await request(app).post("/api/v1/auth/logout");

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"][0]).toContain("token=;");
  });
});
