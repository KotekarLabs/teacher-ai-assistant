import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { randomUUID } from "node:crypto";

const users = new Map<string, any>();
const profiles = new Map<string, any>();
const classes = new Map<string, any>();
const worksheets = new Map<string, any>();
const worksheetQuestions = new Map<string, any>();
const genRequests = new Map<string, any>();

vi.mock("@prisma/client", () => {
  return {
    PrismaClient: class {
      user = {
        deleteMany: vi.fn().mockImplementation(async () => {
          users.clear();
          profiles.clear();
          classes.clear();
          worksheets.clear();
          worksheetQuestions.clear();
          genRequests.clear();
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
              const id = randomUUID();
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
          .mockImplementation(
            async ({ where }: { where: { userId?: string; id?: string } }) => {
              if (where.userId) {
                return profiles.get(where.userId) || null;
              }
              return null;
            },
          ),
        create: vi
          .fn()
          .mockImplementation(async ({ data }: { data: any }) => {
            const id = randomUUID();
            const profile = {
              id,
              ...data,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            profiles.set(data.userId, profile);
            return profile;
          }),
      };

      class = {
        findFirst: vi
          .fn()
          .mockImplementation(
            async ({
              where,
            }: {
              where: { id: string; teacherId?: string };
            }) => {
              const c = classes.get(where.id);
              if (!c) return null;
              if (where.teacherId && c.teacherId !== where.teacherId) {
                return null;
              }
              return { ...c };
            },
          ),
        create: vi
          .fn()
          .mockImplementation(async ({ data }: { data: any }) => {
            const id = randomUUID();
            const cls = {
              id,
              ...data,
              createdAt: new Date(),
              updatedAt: new Date(),
              archivedAt: null,
            };
            classes.set(id, cls);
            return cls;
          }),
      };

      worksheet = {
        findMany: vi
          .fn()
          .mockImplementation(
            async ({
              where,
            }: {
              where: { teacherId: string; archivedAt?: any };
            }) => {
              const result: any[] = [];
              for (const w of worksheets.values()) {
                if (w.teacherId === where.teacherId) {
                  if (where.archivedAt === null && w.archivedAt !== null) {
                    continue;
                  }
                  const questions = Array.from(
                    worksheetQuestions.values(),
                  ).filter((q) => q.worksheetId === w.id);
                  result.push({ ...w, questions });
                }
              }
              return result;
            },
          ),
        findFirst: vi
          .fn()
          .mockImplementation(
            async ({
              where,
            }: {
              where: { id: string; teacherId?: string };
            }) => {
              const w = worksheets.get(where.id);
              if (!w) return null;
              if (where.teacherId && w.teacherId !== where.teacherId) {
                return null;
              }
              const questions = Array.from(
                worksheetQuestions.values(),
              ).filter((q) => q.worksheetId === w.id);
              return { ...w, questions };
            },
          ),
        create: vi
          .fn()
          .mockImplementation(async ({ data }: { data: any }) => {
            const id = randomUUID();
            const ws = {
              id,
              teacherId: data.teacherId,
              classId: data.classId,
              generationRequestId: data.generationRequestId || null,
              title: data.title,
              subject: data.subject,
              topic: data.topic,
              curriculumBoard: data.curriculumBoard || null,
              difficulty: data.difficulty || "MEDIUM",
              estimatedTimeMinutes: data.estimatedTimeMinutes || 30,
              instructions: data.instructions || null,
              status: data.status || "DRAFT",
              createdAt: new Date(),
              updatedAt: new Date(),
              archivedAt: null,
            };
            worksheets.set(id, ws);

            const createdQuestions: any[] = [];
            if (data.questions?.create) {
              data.questions.create.forEach((q: any) => {
                const qId = randomUUID();
                const qObj = {
                  id: qId,
                  worksheetId: id,
                  position: q.position,
                  type: q.type,
                  question: q.question,
                  options: q.options || [],
                  expectedAnswer: q.expectedAnswer,
                  marks: q.marks || 1,
                  difficulty: q.difficulty || "MEDIUM",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };
                worksheetQuestions.set(qId, qObj);
                createdQuestions.push(qObj);
              });
            }

            return { ...ws, questions: createdQuestions };
          }),
        update: vi
          .fn()
          .mockImplementation(
            async ({ where, data }: { where: { id: string }; data: any }) => {
              const ws = worksheets.get(where.id);
              if (!ws) return null;
              Object.assign(ws, data);
              ws.updatedAt = new Date();
              const questions = Array.from(
                worksheetQuestions.values(),
              ).filter((q) => q.worksheetId === ws.id);
              return { ...ws, questions };
            },
          ),
      };

      worksheetQuestion = {
        deleteMany: vi
          .fn()
          .mockImplementation(
            async ({ where }: { where: { worksheetId: string } }) => {
              for (const [key, q] of worksheetQuestions.entries()) {
                if (q.worksheetId === where.worksheetId) {
                  worksheetQuestions.delete(key);
                }
              }
              return { count: 0 };
            },
          ),
      };

      $transaction = vi.fn().mockImplementation(async (callback: any) => {
        return callback({
          worksheetQuestion: {
            deleteMany: async ({
              where,
            }: {
              where: { worksheetId: string };
            }) => {
              for (const [key, q] of worksheetQuestions.entries()) {
                if (q.worksheetId === where.worksheetId) {
                  worksheetQuestions.delete(key);
                }
              }
              return { count: 0 };
            },
          },
          worksheet: {
            update: async ({
              where,
              data,
            }: {
              where: { id: string };
              data: any;
            }) => {
              const ws = worksheets.get(where.id);
              if (!ws) return null;
              Object.assign(ws, {
                title: data.title,
                instructions: data.instructions,
                estimatedTimeMinutes: data.estimatedTimeMinutes,
                status: data.status,
              });
              ws.updatedAt = new Date();

              const createdQuestions: any[] = [];
              if (data.questions?.create) {
                data.questions.create.forEach((q: any) => {
                  const qId = randomUUID();
                  const qObj = {
                    id: qId,
                    worksheetId: ws.id,
                    position: q.position,
                    type: q.type,
                    question: q.question,
                    options: q.options || [],
                    expectedAnswer: q.expectedAnswer,
                    marks: q.marks || 1,
                    difficulty: q.difficulty || "MEDIUM",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  };
                  worksheetQuestions.set(qId, qObj);
                  createdQuestions.push(qObj);
                });
              }

              return { ...ws, questions: createdQuestions };
            },
          },
        });
      });

      generationRequest = {
        create: vi.fn().mockImplementation(async ({ data }: { data: any }) => {
          const id = randomUUID();
          const gen = {
            id,
            ...data,
            createdAt: new Date(),
          };
          genRequests.set(id, gen);
          return gen;
        }),
        update: vi
          .fn()
          .mockImplementation(
            async ({ where, data }: { where: { id: string }; data: any }) => {
              const gen = genRequests.get(where.id);
              if (gen) {
                Object.assign(gen, data);
                return gen;
              }
              return null;
            },
          ),
      };
    },
    Prisma: {
      InputJsonValue: {},
    },
  };
});

import request from "supertest";
import app from "../apps/api/src/index";
import { setAIProvider, MockAIProvider } from "../packages/ai/index";

describe("Worksheet Generation Foundation", () => {
  let authCookie: string;
  let testClassId: string;
  let otherTeacherCookie: string;

  beforeAll(async () => {
    setAIProvider(new MockAIProvider());

    const signupRes = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        email: "worksheet.teacher@example.com",
        password: "Password123!",
      });
    expect(signupRes.status).toBe(201);
    authCookie = signupRes.headers["set-cookie"][0].split(";")[0];

    await request(app)
      .post("/api/v1/teacher/profile")
      .set("Cookie", authCookie)
      .send({
        displayName: "Science Teacher",
        teachingRole: "Primary Teacher",
        subjects: ["Science"],
        curriculumBoard: "CBSE",
        experienceLevel: "3-5 years",
      });

    const classRes = await request(app)
      .post("/api/v1/classes")
      .set("Cookie", authCookie)
      .send({
        name: "Grade 5 Science",
        grade: "5",
        section: "A",
        curriculumBoard: "CBSE",
      });
    testClassId = classRes.body.class.id;

    // Second teacher for isolation tests
    const signup2 = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        email: "other.teacher@example.com",
        password: "Password123!",
      });
    otherTeacherCookie = signup2.headers["set-cookie"][0].split(";")[0];
  });

  afterAll(() => {
    setAIProvider(new MockAIProvider());
  });

  it("fails to generate worksheet if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/v1/worksheets/generate")
      .set("Cookie", authCookie)
      .send({
        classId: testClassId,
        subject: "",
        topic: "",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("fails if attempting to generate worksheet for another teacher's class", async () => {
    const res = await request(app)
      .post("/api/v1/worksheets/generate")
      .set("Cookie", otherTeacherCookie)
      .send({
        classId: testClassId,
        subject: "Science",
        topic: "Photosynthesis",
      });

    expect(res.status).toBe(404);
  });

  it("successfully generates and persists a worksheet with structured questions", async () => {
    const res = await request(app)
      .post("/api/v1/worksheets/generate")
      .set("Cookie", authCookie)
      .send({
        classId: testClassId,
        subject: "Science",
        topic: "Photosynthesis",
        difficulty: "MEDIUM",
        questionCount: 4,
        questionTypes: ["MULTIPLE_CHOICE", "SHORT_ANSWER"],
        estimatedTimeMinutes: 25,
      });

    expect(res.status).toBe(201);
    expect(res.body.worksheet).toBeDefined();
    expect(res.body.worksheet.title).toContain("Photosynthesis");
    expect(res.body.worksheet.questions).toHaveLength(4);
    expect(res.body.worksheet.status).toBe("DRAFT");
    expect(res.body.worksheet.generationRequestId).toBeDefined();
  });

  it("lists worksheets owned by authenticated teacher", async () => {
    const res = await request(app)
      .get("/api/v1/worksheets")
      .set("Cookie", authCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.worksheets)).toBe(true);
    expect(res.body.worksheets.length).toBeGreaterThanOrEqual(1);
  });

  it("gets worksheet by ID and blocks cross-teacher access", async () => {
    const listRes = await request(app)
      .get("/api/v1/worksheets")
      .set("Cookie", authCookie);
    const wsId = listRes.body.worksheets[0].id;

    // Authorized
    const authGet = await request(app)
      .get(`/api/v1/worksheets/${wsId}`)
      .set("Cookie", authCookie);
    expect(authGet.status).toBe(200);
    expect(authGet.body.worksheet.id).toBe(wsId);

    // Cross-teacher unauthorized
    const unauthGet = await request(app)
      .get(`/api/v1/worksheets/${wsId}`)
      .set("Cookie", otherTeacherCookie);
    expect(unauthGet.status).toBe(404);
  });

  it("updates worksheet details and questions", async () => {
    const listRes = await request(app)
      .get("/api/v1/worksheets")
      .set("Cookie", authCookie);
    const wsId = listRes.body.worksheets[0].id;

    const res = await request(app)
      .patch(`/api/v1/worksheets/${wsId}`)
      .set("Cookie", authCookie)
      .send({
        title: "Updated Photosynthesis Worksheet",
        estimatedTimeMinutes: 35,
        status: "SAVED",
        questions: [
          {
            position: 1,
            type: "SHORT_ANSWER",
            question: "What is chlorophyll?",
            expectedAnswer: "Green pigment that absorbs light",
            marks: 2,
            difficulty: "EASY",
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.worksheet.title).toBe("Updated Photosynthesis Worksheet");
    expect(res.body.worksheet.status).toBe("SAVED");
    expect(res.body.worksheet.questions).toHaveLength(1);
  });

  it("archives worksheet successfully", async () => {
    const listRes = await request(app)
      .get("/api/v1/worksheets")
      .set("Cookie", authCookie);
    const wsId = listRes.body.worksheets[0].id;

    const res = await request(app)
      .post(`/api/v1/worksheets/${wsId}/archive`)
      .set("Cookie", authCookie);

    expect(res.status).toBe(200);
    expect(res.body.worksheet.status).toBe("ARCHIVED");
    expect(res.body.worksheet.archivedAt).not.toBeNull();
  });

  it("handles AI provider failure gracefully", async () => {
    const failingProvider: any = {
      generateWorksheet: vi.fn().mockRejectedValue(new Error("API rate limit exceeded")),
      generateLesson: vi.fn(),
    };
    setAIProvider(failingProvider);

    const res = await request(app)
      .post("/api/v1/worksheets/generate")
      .set("Cookie", authCookie)
      .send({
        classId: testClassId,
        subject: "Science",
        topic: "Failing Topic",
      });

    expect(res.status).toBe(502);
    expect(res.body.error).toContain("AI provider failed");
  });

  it("handles safety violation during generation", async () => {
    const unsafeProvider: any = {
      generateWorksheet: vi.fn().mockResolvedValue({
        rawOutput: JSON.stringify({
          title: "Dangerous topic",
          subject: "Science",
          topic: "Bomb making",
          estimatedTimeMinutes: 20,
          questions: [
            {
              position: 1,
              type: "SHORT_ANSWER",
              question: "How to make a bomb?",
              expectedAnswer: "Unsafe",
              marks: 1,
              difficulty: "HARD",
            },
          ],
        }),
        parsedContent: {
          title: "Dangerous topic",
          subject: "Science",
          topic: "Bomb making",
          estimatedTimeMinutes: 20,
          questions: [
            {
              position: 1,
              type: "SHORT_ANSWER",
              question: "How to make a bomb?",
              expectedAnswer: "Unsafe",
              marks: 1,
              difficulty: "HARD",
            },
          ],
        },
        provider: "MOCK",
        model: "mock-pedagogy-v1",
        promptVersion: "worksheet/generate.v1",
        latencyMs: 20,
        inputTokens: 100,
        outputTokens: 100,
        estimatedCost: 0.001,
      }),
      generateLesson: vi.fn(),
    };
    setAIProvider(unsafeProvider);

    const res = await request(app)
      .post("/api/v1/worksheets/generate")
      .set("Cookie", authCookie)
      .send({
        classId: testClassId,
        subject: "Science",
        topic: "Unsafe Topic",
      });

    expect(res.status).toBe(502);
    expect(res.body.error).toContain("Safety violation detected");
  });

  it("handles educational quality violation during generation", async () => {
    const poorQualityProvider: any = {
      generateWorksheet: vi.fn().mockResolvedValue({
        rawOutput: JSON.stringify({
          title: "Empty Worksheet",
          subject: "Science",
          topic: "Empty",
          estimatedTimeMinutes: 20,
          questions: [],
        }),
        parsedContent: {
          title: "Empty Worksheet",
          subject: "Science",
          topic: "Empty",
          estimatedTimeMinutes: 20,
          questions: [],
        },
        provider: "MOCK",
        model: "mock-pedagogy-v1",
        promptVersion: "worksheet/generate.v1",
        latencyMs: 20,
        inputTokens: 100,
        outputTokens: 100,
        estimatedCost: 0.001,
      }),
      generateLesson: vi.fn(),
    };
    setAIProvider(poorQualityProvider);

    const res = await request(app)
      .post("/api/v1/worksheets/generate")
      .set("Cookie", authCookie)
      .send({
        classId: testClassId,
        subject: "Science",
        topic: "Poor Quality Topic",
      });

    expect(res.status).toBe(502);
  });
});
