import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { randomUUID } from "node:crypto";

const users = new Map<string, any>();
const profiles = new Map<string, any>();
const classes = new Map<string, any>();
const lessons = new Map<string, any>();
const genRequests = new Map<string, any>();
const contents = new Map<string, any>();
const aiLogs = new Map<string, any>();

vi.mock("@prisma/client", () => {
  return {
    PrismaClient: class {
      $transaction = vi.fn().mockImplementation(async (callback: any) => {
        if (typeof callback === "function") {
          return callback(this);
        }
        return callback;
      });

      user = {
        deleteMany: vi.fn().mockImplementation(async () => {
          users.clear();
          profiles.clear();
          classes.clear();
          lessons.clear();
          genRequests.clear();
          contents.clear();
          aiLogs.clear();
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
      };

      teacherProfile = {
        findUnique: vi
          .fn()
          .mockImplementation(
            async ({ where }: { where: { userId: string } }) => {
              return profiles.get(where.userId) || null;
            },
          ),
        create: vi
          .fn()
          .mockImplementation(
            async ({ data }: { data: any }) => {
              const id = randomUUID();
              const profile = {
                id,
                userId: data.userId,
                displayName: data.displayName,
                teachingRole: data.teachingRole,
                subjects: data.subjects || [],
                preferredLanguage: data.preferredLanguage,
                curriculumBoard: data.curriculumBoard,
                experienceLevel: data.experienceLevel,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              profiles.set(data.userId, profile);
              return profile;
            },
          ),
      };

      class = {
        findFirst: vi
          .fn()
          .mockImplementation(
            async ({
              where,
            }: {
              where: { id: string; teacherId: string };
            }) => {
              const c = classes.get(where.id);
              if (c && c.teacherId === where.teacherId) {
                return { ...c };
              }
              return null;
            },
          ),
        create: vi
          .fn()
          .mockImplementation(
            async ({ data }: { data: any }) => {
              const id = randomUUID();
              const classItem = {
                id,
                teacherId: data.teacherId,
                name: data.name,
                grade: data.grade,
                section: data.section || null,
                curriculumBoard: data.curriculumBoard || null,
                academicYear: data.academicYear || null,
                createdAt: new Date(),
                updatedAt: new Date(),
                archivedAt: null,
              };
              classes.set(id, classItem);
              return classItem;
            },
          ),
      };

      generationRequest = {
        create: vi.fn().mockImplementation(async ({ data }: { data: any }) => {
          const id = randomUUID();
          const req = {
            id,
            ...data,
            createdAt: new Date(),
            completedAt: null,
          };
          genRequests.set(id, req);
          return req;
        }),
        update: vi
          .fn()
          .mockImplementation(
            async ({ where, data }: { where: { id: string }; data: any }) => {
              const req = genRequests.get(where.id);
              if (req) {
                Object.assign(req, data);
                return req;
              }
              return null;
            },
          ),
      };

      lesson = {
        findFirst: vi
          .fn()
          .mockImplementation(
            async ({
              where,
            }: {
              where: { id: string; teacherId: string };
            }) => {
              const l = lessons.get(where.id);
              if (l && l.teacherId === where.teacherId) {
                return { ...l };
              }
              return null;
            },
          ),
        create: vi.fn().mockImplementation(async ({ data }: { data: any }) => {
          const id = randomUUID();
          const l = {
            id,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            archivedAt: null,
          };
          lessons.set(id, l);
          return l;
        }),
      };

      content = {
        upsert: vi
          .fn()
          .mockImplementation(async ({ where, create, update }: any) => {
            const key = `${where.type_resourceId.type}_${where.type_resourceId.resourceId}`;
            const existing = contents.get(key);
            if (existing) {
              Object.assign(existing, update, { updatedAt: new Date() });
              return { ...existing };
            }
            const id = randomUUID();
            const item = {
              id,
              ...create,
              createdAt: new Date(),
              updatedAt: new Date(),
              archivedAt: create.archivedAt || null,
            };
            contents.set(key, item);
            return { ...item };
          }),
      };

      aiGenerationLog = {
        create: vi.fn().mockImplementation(async ({ data }: { data: any }) => {
          const id = randomUUID();
          const log = { id, ...data, createdAt: new Date() };
          aiLogs.set(id, log);
          return log;
        }),
      };
    },
    Prisma: {
      InputJsonValue: {} as any,
    },
  };
});

describe("Stage 2 Visual Lesson PDF Export API Integration Suite", () => {
  let app: any;
  let request: any;

  let teacherACookie: string;
  let teacherBCookie: string;
  let teacherAClassId: string;

  let visualLessonId: string;
  let ordinaryLessonId: string;

  beforeAll(async () => {
    const supertest = await import("supertest");
    request = supertest.default;
    const serverModule = await import("../apps/api/src/index");
    app = serverModule.default;

    // 1. Teacher A setup
    const resA = await request(app)
      .post("/api/v1/auth/signup")
      .send({ email: "teacher.pdf.a@school.edu", password: "Password123" });
    teacherACookie = resA.headers["set-cookie"][0].split(";")[0];

    await request(app)
      .post("/api/v1/teacher/profile")
      .set("Cookie", teacherACookie)
      .send({
        displayName: "Teacher A",
        teachingRole: "Primary Teacher",
        subjects: ["Mathematics"],
        preferredLanguage: "kannada",
        curriculumBoard: "Karnataka State Board",
        experienceLevel: "SENIOR",
      });

    const classResA = await request(app)
      .post("/api/v1/classes")
      .set("Cookie", teacherACookie)
      .send({ name: "Grade 1 Math", grade: "1", curriculumBoard: "Karnataka State Board" });
    teacherAClassId = classResA.body.class.id;

    // 2. Teacher B setup (Cross-tenant actor)
    const resB = await request(app)
      .post("/api/v1/auth/signup")
      .send({ email: "teacher.pdf.b@school.edu", password: "Password123" });
    teacherBCookie = resB.headers["set-cookie"][0].split(";")[0];

    // 3. Generate Visual Lesson for Teacher A
    const visGenRes = await request(app)
      .post("/api/v1/lessons/generate")
      .set("Cookie", teacherACookie)
      .send({
        classId: teacherAClassId,
        subject: "Mathematics",
        topic: "What is Long? What is Round?",
        curriculumTopicId: "JOYFUL_MATH_C1_CH2_V1",
      });
    expect(visGenRes.status).toBe(201);
    visualLessonId = visGenRes.body.lesson.id;

    // 4. Generate Ordinary Lesson for Teacher A
    const ordGenRes = await request(app)
      .post("/api/v1/lessons/generate")
      .set("Cookie", teacherACookie)
      .send({
        classId: teacherAClassId,
        subject: "Mathematics",
        topic: "Counting Numbers 1 to 10",
      });
    expect(ordGenRes.status).toBe(201);
    ordinaryLessonId = ordGenRes.body.lesson.id;
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("exports visual lesson PDF with HTTP 200, PDF headers, and valid binary buffer", async () => {
    const res = await request(app)
      .get(`/api/v1/lessons/${visualLessonId}/export/pdf`)
      .set("Cookie", teacherACookie)
      .responseType("blob");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
    expect(res.headers["content-disposition"]).toContain("attachment; filename=");
    expect(res.headers["content-disposition"]).toContain(".pdf");

    const buffer = Buffer.from(res.body);
    expect(buffer.length).toBeGreaterThan(20000);
    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
  });

  it("enforces tenant isolation: Teacher B cannot export Teacher A's visual lesson (HTTP 404)", async () => {
    const res = await request(app)
      .get(`/api/v1/lessons/${visualLessonId}/export/pdf`)
      .set("Cookie", teacherBCookie);

    expect(res.status).toBe(404);
  });

  it("rejects unauthenticated PDF export with HTTP 401", async () => {
    const res = await request(app)
      .get(`/api/v1/lessons/${visualLessonId}/export/pdf`);

    expect(res.status).toBe(401);
  });

  it("preserves ordinary lesson PDF export functionality without regression", async () => {
    const res = await request(app)
      .get(`/api/v1/lessons/${ordinaryLessonId}/export/pdf`)
      .set("Cookie", teacherACookie)
      .responseType("blob");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
    const buffer = Buffer.from(res.body);
    expect(buffer.length).toBeGreaterThan(1000);
    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
  });
});
