import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { randomUUID } from "node:crypto";

const users = new Map<string, any>();
const profiles = new Map<string, any>();
const classes = new Map<string, any>();
const homeworks = new Map<string, any>();
const genRequests = new Map<string, any>();

vi.mock("@prisma/client", () => {
  return {
    PrismaClient: class {
      user = {
        deleteMany: vi.fn().mockImplementation(async () => {
          users.clear();
          profiles.clear();
          classes.clear();
          homeworks.clear();
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

      homework = {
        findMany: vi
          .fn()
          .mockImplementation(
            async ({
              where,
            }: {
              where: { teacherId: string; archivedAt?: any };
            }) => {
              const result: any[] = [];
              for (const hw of homeworks.values()) {
                if (hw.teacherId === where.teacherId) {
                  if (where.archivedAt === null && hw.archivedAt !== null) {
                    continue;
                  }
                  result.push({ ...hw });
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
              const hw = homeworks.get(where.id);
              if (!hw) return null;
              if (where.teacherId && hw.teacherId !== where.teacherId) {
                return null;
              }
              return { ...hw };
            },
          ),
        create: vi
          .fn()
          .mockImplementation(async ({ data }: { data: any }) => {
            const id = randomUUID();
            const hw = {
              id,
              teacherId: data.teacherId,
              classId: data.classId,
              generationRequestId: data.generationRequestId || null,
              title: data.title,
              subject: data.subject,
              topic: data.topic,
              difficulty: data.difficulty || "MEDIUM",
              estimatedTimeMinutes: data.estimatedTimeMinutes || 30,
              instructions: data.instructions || "",
              status: data.status || "DRAFT",
              tasks: data.tasks || [],
              createdAt: new Date(),
              updatedAt: new Date(),
              archivedAt: null,
            };
            homeworks.set(id, hw);
            return hw;
          }),
        update: vi
          .fn()
          .mockImplementation(
            async ({ where, data }: { where: { id: string }; data: any }) => {
              const hw = homeworks.get(where.id);
              if (!hw) return null;
              Object.assign(hw, data);
              hw.updatedAt = new Date();
              return { ...hw };
            },
          ),
      };

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
import { HomeworkOutputValidator } from "../packages/ai/src/validation/homeworkOutputValidator";

describe("Homework Generation Foundation", () => {
  let authCookie: string;
  let testClassId: string;
  let otherTeacherCookie: string;

  beforeAll(async () => {
    setAIProvider(new MockAIProvider());

    const signupRes = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        email: "homework.teacher@example.com",
        password: "Password123!",
      });
    expect(signupRes.status).toBe(201);
    authCookie = signupRes.headers["set-cookie"][0].split(";")[0];

    await request(app)
      .post("/api/v1/teacher/profile")
      .set("Cookie", authCookie)
      .send({
        displayName: "Middle School Science Teacher",
        teachingRole: "Science Teacher",
        subjects: ["Science"],
        curriculumBoard: "CBSE",
        experienceLevel: "5+ years",
      });

    const classRes = await request(app)
      .post("/api/v1/classes")
      .set("Cookie", authCookie)
      .send({
        name: "Grade 7 Science",
        grade: "7",
        section: "A",
        curriculumBoard: "CBSE",
      });
    testClassId = classRes.body.class.id;

    // Second teacher for cross-user authorization tests
    const signup2 = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        email: "other.homework.teacher@example.com",
        password: "Password123!",
      });
    otherTeacherCookie = signup2.headers["set-cookie"][0].split(";")[0];
  });

  afterAll(() => {
    setAIProvider(new MockAIProvider());
  });

  it("fails to generate homework if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/v1/homeworks/generate")
      .set("Cookie", authCookie)
      .send({
        classId: testClassId,
        subject: "",
        topic: "",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("enforces task count bounds (1-20)", async () => {
    const resUnder = await request(app)
      .post("/api/v1/homeworks/generate")
      .set("Cookie", authCookie)
      .send({
        classId: testClassId,
        subject: "Science",
        topic: "Water Cycle",
        taskCount: 0,
      });
    expect(resUnder.status).toBe(400);

    const resOver = await request(app)
      .post("/api/v1/homeworks/generate")
      .set("Cookie", authCookie)
      .send({
        classId: testClassId,
        subject: "Science",
        topic: "Water Cycle",
        taskCount: 21,
      });
    expect(resOver.status).toBe(400);
  });

  it("enforces estimated time bounds (5-180 minutes)", async () => {
    const resUnder = await request(app)
      .post("/api/v1/homeworks/generate")
      .set("Cookie", authCookie)
      .send({
        classId: testClassId,
        subject: "Science",
        topic: "Water Cycle",
        estimatedTimeMinutes: 4,
      });
    expect(resUnder.status).toBe(400);

    const resOver = await request(app)
      .post("/api/v1/homeworks/generate")
      .set("Cookie", authCookie)
      .send({
        classId: testClassId,
        subject: "Science",
        topic: "Water Cycle",
        estimatedTimeMinutes: 181,
      });
    expect(resOver.status).toBe(400);
  });

  it("fails if attempting to generate homework for another teacher's class", async () => {
    const res = await request(app)
      .post("/api/v1/homeworks/generate")
      .set("Cookie", otherTeacherCookie)
      .send({
        classId: testClassId,
        subject: "Science",
        topic: "Water Cycle",
      });

    expect(res.status).toBe(404);
  });

  it("successfully generates and persists homework with structured tasks and metadata", async () => {
    const res = await request(app)
      .post("/api/v1/homeworks/generate")
      .set("Cookie", authCookie)
      .send({
        classId: testClassId,
        subject: "Science",
        topic: "Water Cycle",
        difficulty: "MEDIUM",
        taskCount: 3,
        taskPreferences: ["PRACTICE", "ACTIVITY", "SHORT_ANSWER"],
        estimatedTimeMinutes: 30,
      });

    expect(res.status).toBe(201);
    expect(res.body.homework).toBeDefined();
    expect(res.body.homework.title).toContain("Water Cycle");
    expect(res.body.homework.tasks).toHaveLength(3);
    expect(res.body.homework.estimatedTimeMinutes).toBe(30);
    expect(res.body.homework.status).toBe("DRAFT");
    expect(res.body.homework.generationRequestId).toBeDefined();

    // Verify task structure
    const tasks = res.body.homework.tasks;
    tasks.forEach((t: any, idx: number) => {
      expect(t.position).toBe(idx + 1);
      expect(t.title).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(["PRACTICE", "WRITTEN", "ACTIVITY", "CREATIVE", "SHORT_ANSWER"]).toContain(t.type);
    });
  });

  it("lists homeworks owned by authenticated teacher", async () => {
    const res = await request(app)
      .get("/api/v1/homeworks")
      .set("Cookie", authCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.homeworks)).toBe(true);
    expect(res.body.homeworks.length).toBeGreaterThanOrEqual(1);
  });

  it("gets homework by ID and blocks cross-teacher access", async () => {
    const listRes = await request(app)
      .get("/api/v1/homeworks")
      .set("Cookie", authCookie);
    const homeworkId = listRes.body.homeworks[0].id;

    // Authorized
    const authGet = await request(app)
      .get(`/api/v1/homeworks/${homeworkId}`)
      .set("Cookie", authCookie);
    expect(authGet.status).toBe(200);
    expect(authGet.body.homework.id).toBe(homeworkId);

    // Cross-teacher unauthorized
    const unauthGet = await request(app)
      .get(`/api/v1/homeworks/${homeworkId}`)
      .set("Cookie", otherTeacherCookie);
    expect(unauthGet.status).toBe(404);
  });

  it("updates homework details, instructions, estimated time, and tasks", async () => {
    const listRes = await request(app)
      .get("/api/v1/homeworks")
      .set("Cookie", authCookie);
    const homeworkId = listRes.body.homeworks[0].id;

    const res = await request(app)
      .patch(`/api/v1/homeworks/${homeworkId}`)
      .set("Cookie", authCookie)
      .send({
        title: "Updated Water Cycle Assignment",
        instructions: "Complete all sections neatly.",
        estimatedTimeMinutes: 45,
        status: "SAVED",
        tasks: [
          {
            position: 1,
            title: "Diagram Drawing",
            description: "Draw and label precipitation, evaporation, and condensation.",
            type: "CREATIVE",
          },
          {
            position: 2,
            title: "Analysis Question",
            description: "Why is groundwater important?",
            type: "SHORT_ANSWER",
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.homework.title).toBe("Updated Water Cycle Assignment");
    expect(res.body.homework.instructions).toBe("Complete all sections neatly.");
    expect(res.body.homework.estimatedTimeMinutes).toBe(45);
    expect(res.body.homework.status).toBe("SAVED");
    expect(res.body.homework.tasks).toHaveLength(2);
  });

  it("prevents another teacher from updating or archiving homework", async () => {
    const listRes = await request(app)
      .get("/api/v1/homeworks")
      .set("Cookie", authCookie);
    const homeworkId = listRes.body.homeworks[0].id;

    const patchRes = await request(app)
      .patch(`/api/v1/homeworks/${homeworkId}`)
      .set("Cookie", otherTeacherCookie)
      .send({ title: "Hacked title" });
    expect(patchRes.status).toBe(404);

    const archiveRes = await request(app)
      .post(`/api/v1/homeworks/${homeworkId}/archive`)
      .set("Cookie", otherTeacherCookie);
    expect(archiveRes.status).toBe(404);
  });

  it("archives homework successfully", async () => {
    const listRes = await request(app)
      .get("/api/v1/homeworks")
      .set("Cookie", authCookie);
    const homeworkId = listRes.body.homeworks[0].id;

    const res = await request(app)
      .post(`/api/v1/homeworks/${homeworkId}/archive`)
      .set("Cookie", authCookie);

    expect(res.status).toBe(200);
    expect(res.body.homework.status).toBe("ARCHIVED");
    expect(res.body.homework.archivedAt).not.toBeNull();
  });

  it("validates workload and safety in HomeworkOutputValidator", () => {
    // Valid content
    const valid = HomeworkOutputValidator.checkWorkload({
      title: "Sample HW",
      subject: "Science",
      topic: "Topic",
      difficulty: "MEDIUM",
      estimatedTimeMinutes: 30,
      instructions: "Do all tasks",
      tasks: [
        {
          position: 1,
          title: "Task 1",
          description: "Read page 12.",
          type: "PRACTICE",
        },
      ],
    });
    expect(valid.isAcceptable).toBe(true);

    // Overloaded: > 10 tasks in <= 10 minutes
    const overloaded = HomeworkOutputValidator.checkWorkload({
      title: "Sample HW",
      subject: "Science",
      topic: "Topic",
      difficulty: "MEDIUM",
      estimatedTimeMinutes: 10,
      instructions: "Do all tasks",
      tasks: Array.from({ length: 11 }, (_, i) => ({
        position: i + 1,
        title: `Task ${i + 1}`,
        description: "Complex exercise",
        type: "ACTIVITY",
      })),
    });
    expect(overloaded.isAcceptable).toBe(false);
    expect(overloaded.reason).toContain("Workload mismatch");

    // Unsafe content
    const unsafe = HomeworkOutputValidator.checkSafety({
      title: "Sample HW",
      subject: "Science",
      topic: "Topic",
      difficulty: "MEDIUM",
      estimatedTimeMinutes: 20,
      instructions: "Mix toxic chemicals and make bomb at home",
      tasks: [
        {
          position: 1,
          title: "Harmful task",
          description: "Ignite gasoline without supervision",
          type: "ACTIVITY",
        },
      ],
    });
    expect(unsafe.isSafe).toBe(false);
  });
});
