import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

const users = new Map<string, any>();
const profiles = new Map<string, any>();

vi.mock("@prisma/client", () => {
  return {
    PrismaClient: class {
      user = {
        deleteMany: vi.fn().mockImplementation(async () => {
          users.clear();
          profiles.clear();
          return { count: 0 };
        }),
        findUnique: vi
          .fn()
          .mockImplementation(
            async ({ where }: { where: { email?: string; id?: string } }) => {
              let user: any = null;
              if (where.email) {
                for (const u of users.values()) {
                  if (u.email === where.email) {
                    user = { ...u };
                    break;
                  }
                }
              } else if (where.id) {
                const u = users.get(where.id);
                if (u) user = { ...u };
              }
              if (user) {
                user.profile = profiles.get(user.id) || null;
              }
              return user;
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
              const id = "teacher-uuid-" + Math.random().toString(36).substring(7);
              const user = {
                id,
                email: data.email,
                passwordHash: data.passwordHash,
                emailVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastLoginAt: null,
                profile: null,
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
      teacherProfile = {
        findUnique: vi
          .fn()
          .mockImplementation(async ({ where }: { where: { userId?: string; id?: string } }) => {
            if (where.userId) {
              return profiles.get(where.userId) || null;
            }
            if (where.id) {
              for (const p of profiles.values()) {
                if (p.id === where.id) return p;
              }
            }
            return null;
          }),
        create: vi
          .fn()
          .mockImplementation(async ({ data }: { data: any }) => {
            const id = "profile-uuid-" + Math.random().toString(36).substring(7);
            const profile = {
              id,
              userId: data.userId,
              displayName: data.displayName,
              teachingRole: data.teachingRole,
              subjects: data.subjects,
              preferredLanguage: data.preferredLanguage || "English",
              curriculumBoard: data.curriculumBoard,
              experienceLevel: data.experienceLevel,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            profiles.set(data.userId, profile);
            return profile;
          }),
        update: vi
          .fn()
          .mockImplementation(async ({ where, data }: { where: { userId: string }; data: any }) => {
            const profile = profiles.get(where.userId);
            if (profile) {
              Object.assign(profile, data, { updatedAt: new Date() });
              return profile;
            }
            return null;
          }),
      };
      $disconnect = vi.fn().mockResolvedValue(undefined);
    },
  };
});

import request from "supertest";
import app from "../apps/api/src/index";

describe("Teacher Profile & Onboarding API", () => {
  beforeAll(async () => {
    users.clear();
    profiles.clear();
  });

  afterAll(async () => {
    users.clear();
    profiles.clear();
  });

  const testUser = {
    email: "teacher@example.com",
    password: "Password123",
  };

  let authCookie: string;

  beforeAll(async () => {
    const signupRes = await request(app).post("/api/v1/auth/signup").send(testUser);
    authCookie = signupRes.headers["set-cookie"][0];
  });

  it("should reject unauthenticated profile requests with 401", async () => {
    const getRes = await request(app).get("/api/v1/teacher/profile");
    expect(getRes.status).toBe(401);

    const postRes = await request(app).post("/api/v1/teacher/profile").send({});
    expect(postRes.status).toBe(401);

    const patchRes = await request(app).patch("/api/v1/teacher/profile").send({});
    expect(patchRes.status).toBe(401);
  });

  it("should return 404 when profile does not exist yet", async () => {
    const res = await request(app)
      .get("/api/v1/teacher/profile")
      .set("Cookie", authCookie);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Teacher profile not found");
  });

  it("should reject invalid profile creation inputs with 400", async () => {
    const invalidInputs = [
      { displayName: "" }, // missing required fields
      {
        displayName: "A", // too short
        teachingRole: "Primary",
        subjects: [],
        curriculumBoard: "CBSE",
        experienceLevel: "3-5 years",
      },
    ];

    for (const input of invalidInputs) {
      const res = await request(app)
        .post("/api/v1/teacher/profile")
        .set("Cookie", authCookie)
        .send(input);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid input");
    }
  });

  it("should create a teacher profile successfully", async () => {
    const validProfile = {
      displayName: "Ms. Anita Sharma",
      teachingRole: "Primary School Teacher",
      subjects: ["Mathematics", "Science"],
      curriculumBoard: "CBSE",
      experienceLevel: "3-5 years",
      preferredLanguage: "English",
    };

    const res = await request(app)
      .post("/api/v1/teacher/profile")
      .set("Cookie", authCookie)
      .send(validProfile);

    expect(res.status).toBe(201);
    expect(res.body.profile).toBeDefined();
    expect(res.body.profile.displayName).toBe("Ms. Anita Sharma");
    expect(res.body.profile.subjects).toEqual(["Mathematics", "Science"]);
    expect(res.body.profile.curriculumBoard).toBe("CBSE");
  });

  it("should reject duplicate profile creation with 409 Conflict", async () => {
    const duplicateProfile = {
      displayName: "Ms. Anita Sharma Duplicate",
      teachingRole: "Primary School Teacher",
      subjects: ["English"],
      curriculumBoard: "ICSE",
      experienceLevel: "0-2 years",
    };

    const res = await request(app)
      .post("/api/v1/teacher/profile")
      .set("Cookie", authCookie)
      .send(duplicateProfile);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Teacher profile already exists");
  });

  it("should retrieve the created profile successfully", async () => {
    const res = await request(app)
      .get("/api/v1/teacher/profile")
      .set("Cookie", authCookie);

    expect(res.status).toBe(200);
    expect(res.body.profile.displayName).toBe("Ms. Anita Sharma");
    expect(res.body.profile.teachingRole).toBe("Primary School Teacher");
  });

  it("should update profile fields with PATCH", async () => {
    const updates = {
      displayName: "Dr. Anita Sharma",
      experienceLevel: "6-10 years",
    };

    const res = await request(app)
      .patch("/api/v1/teacher/profile")
      .set("Cookie", authCookie)
      .send(updates);

    expect(res.status).toBe(200);
    expect(res.body.profile.displayName).toBe("Dr. Anita Sharma");
    expect(res.body.profile.experienceLevel).toBe("6-10 years");
    expect(res.body.profile.teachingRole).toBe("Primary School Teacher"); // unchanged
  });

  it("should show hasCompletedOnboarding: true on /auth/me after profile creation", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", authCookie);

    expect(res.status).toBe(200);
    expect(res.body.hasCompletedOnboarding).toBe(true);
    expect(res.body.profile.displayName).toBe("Dr. Anita Sharma");
  });
});
