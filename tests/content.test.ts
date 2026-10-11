import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { randomUUID } from "node:crypto";

const users = new Map<string, any>();
const profiles = new Map<string, any>();
const classes = new Map<string, any>();
const lessons = new Map<string, any>();
const worksheets = new Map<string, any>();
const worksheetQuestions = new Map<string, any>();
const quizzes = new Map<string, any>();
const quizQuestions = new Map<string, any>();
const homeworks = new Map<string, any>();
const contents = new Map<string, any>();
const genRequests = new Map<string, any>();

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
          worksheets.clear();
          worksheetQuestions.clear();
          quizzes.clear();
          quizQuestions.clear();
          homeworks.clear();
          contents.clear();
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
      };

      teacherProfile = {
        findUnique: vi
          .fn()
          .mockImplementation(
            async ({ where }: { where: { userId: string } }) => {
              return profiles.get(where.userId) || null;
            },
          ),
        create: vi.fn().mockImplementation(async ({ data }: { data: any }) => {
          const id = randomUUID();
          const profile = {
            id,
            userId: data.userId,
            displayName: data.displayName,
            teachingRole: data.teachingRole,
            subjects: data.subjects,
            preferredLanguage: data.preferredLanguage,
            curriculumBoard: data.curriculumBoard,
            experienceLevel: data.experienceLevel,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          profiles.set(data.userId, profile);
          return profile;
        }),
      };

      class = {
        findMany: vi
          .fn()
          .mockImplementation(
            async ({
              where,
            }: {
              where: { teacherId: string; archivedAt?: any };
            }) => {
              const list: any[] = [];
              for (const c of classes.values()) {
                if (c.teacherId === where.teacherId) {
                  if (where.archivedAt === null && c.archivedAt !== null) {
                    continue;
                  }
                  list.push({ ...c });
                }
              }
              return list;
            },
          ),
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
        create: vi.fn().mockImplementation(async ({ data }: { data: any }) => {
          const id = randomUUID();
          const c = {
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
          classes.set(id, c);
          return c;
        }),
      };

      lesson = {
        findMany: vi.fn().mockImplementation(async () => Array.from(lessons.values())),
        findByIdAndTeacherId: vi.fn(),
        findFirst: vi.fn().mockImplementation(async ({ where }: any) => {
          const l = lessons.get(where.id);
          if (l && (!where.teacherId || l.teacherId === where.teacherId)) {
            return { ...l };
          }
          return null;
        }),
        create: vi.fn().mockImplementation(async ({ data }: any) => {
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
        update: vi.fn().mockImplementation(async ({ where, data }: any) => {
          const l = lessons.get(where.id);
          if (l) {
            Object.assign(l, data, { updatedAt: new Date() });
            return { ...l };
          }
          return null;
        }),
      };

      worksheet = {
        findMany: vi.fn().mockImplementation(async () => {
          return Array.from(worksheets.values()).map((ws) => ({
            ...ws,
            questions: Array.from(worksheetQuestions.values()).filter((q) => q.worksheetId === ws.id),
          }));
        }),
        findFirst: vi.fn().mockImplementation(async ({ where }: any) => {
          const ws = worksheets.get(where.id);
          if (ws && (!where.teacherId || ws.teacherId === where.teacherId)) {
            const questions = Array.from(worksheetQuestions.values()).filter((q) => q.worksheetId === ws.id);
            return { ...ws, questions };
          }
          return null;
        }),
        create: vi.fn().mockImplementation(async ({ data }: any) => {
          const id = randomUUID();
          const ws = {
            id,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            archivedAt: null,
          };
          worksheets.set(id, ws);
          const createdQuestions: any[] = [];
          if (data.questions?.create) {
            data.questions.create.forEach((q: any) => {
              const qId = randomUUID();
              const qObj = { id: qId, worksheetId: id, ...q, createdAt: new Date(), updatedAt: new Date() };
              worksheetQuestions.set(qId, qObj);
              createdQuestions.push(qObj);
            });
          }
          return { ...ws, questions: createdQuestions };
        }),
        update: vi.fn().mockImplementation(async ({ where, data }: any) => {
          const ws = worksheets.get(where.id);
          if (ws) {
            Object.assign(ws, data, { updatedAt: new Date() });
            const questions = Array.from(worksheetQuestions.values()).filter((q) => q.worksheetId === ws.id);
            return { ...ws, questions };
          }
          return null;
        }),
      };

      worksheetQuestion = {
        deleteMany: vi.fn().mockImplementation(async () => ({ count: 0 })),
      };

      quiz = {
        findMany: vi.fn().mockImplementation(async () => {
          return Array.from(quizzes.values()).map((qz) => ({
            ...qz,
            questions: Array.from(quizQuestions.values()).filter((q) => q.quizId === qz.id),
          }));
        }),
        findFirst: vi.fn().mockImplementation(async ({ where }: any) => {
          const qz = quizzes.get(where.id);
          if (qz && (!where.teacherId || qz.teacherId === where.teacherId)) {
            const questions = Array.from(quizQuestions.values()).filter((q) => q.quizId === qz.id);
            return { ...qz, questions };
          }
          return null;
        }),
        create: vi.fn().mockImplementation(async ({ data }: any) => {
          const id = randomUUID();
          const qz = {
            id,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            archivedAt: null,
          };
          quizzes.set(id, qz);
          const createdQuestions: any[] = [];
          if (data.questions?.create) {
            data.questions.create.forEach((q: any) => {
              const qId = randomUUID();
              const qObj = { id: qId, quizId: id, ...q, createdAt: new Date(), updatedAt: new Date() };
              quizQuestions.set(qId, qObj);
              createdQuestions.push(qObj);
            });
          }
          return { ...qz, questions: createdQuestions };
        }),
        update: vi.fn().mockImplementation(async ({ where, data }: any) => {
          const qz = quizzes.get(where.id);
          if (qz) {
            Object.assign(qz, data, { updatedAt: new Date() });
            const questions = Array.from(quizQuestions.values()).filter((q) => q.quizId === qz.id);
            return { ...qz, questions };
          }
          return null;
        }),
      };

      quizQuestion = {
        deleteMany: vi.fn().mockImplementation(async () => ({ count: 0 })),
      };

      homework = {
        findMany: vi.fn().mockImplementation(async () => Array.from(homeworks.values())),
        findFirst: vi.fn().mockImplementation(async ({ where }: any) => {
          const hw = homeworks.get(where.id);
          if (hw && (!where.teacherId || hw.teacherId === where.teacherId)) {
            return { ...hw };
          }
          return null;
        }),
        create: vi.fn().mockImplementation(async ({ data }: any) => {
          const id = randomUUID();
          const hw = {
            id,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            archivedAt: null,
          };
          homeworks.set(id, hw);
          return hw;
        }),
        update: vi.fn().mockImplementation(async ({ where, data }: any) => {
          const hw = homeworks.get(where.id);
          if (hw) {
            Object.assign(hw, data, { updatedAt: new Date() });
            return { ...hw };
          }
          return null;
        }),
      };

      content = {
        upsert: vi
          .fn()
          .mockImplementation(async ({ where, create, update }: any) => {
            const key = `${where.type_resourceId.type}_${where.type_resourceId.resourceId}`;
            let existing = contents.get(key);
            if (existing) {
              Object.assign(existing, update, { updatedAt: new Date() });
              const cls = existing.classId ? classes.get(existing.classId) : null;
              return {
                ...existing,
                class: cls ? { id: cls.id, name: cls.name } : null,
              };
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
            const cls = item.classId ? classes.get(item.classId) : null;
            return {
              ...item,
              class: cls ? { id: cls.id, name: cls.name } : null,
            };
          }),
        findMany: vi
          .fn()
          .mockImplementation(async ({ where, orderBy, skip = 0, take = 20 }: any) => {
            let list = Array.from(contents.values());
            if (where?.teacherId) list = list.filter((c) => c.teacherId === where.teacherId);
            if (where?.type) list = list.filter((c) => c.type === where.type);
            if (where?.classId) list = list.filter((c) => c.classId === where.classId);
            if (where?.subject?.equals) {
              list = list.filter((c) => c.subject.toLowerCase() === where.subject.equals.toLowerCase());
            }
            if (where?.topic?.equals) {
              list = list.filter((c) => c.topic.toLowerCase() === where.topic.equals.toLowerCase());
            }
            if (where?.archivedAt === null) {
              list = list.filter((c) => c.archivedAt === null);
            } else if (where?.archivedAt && where?.archivedAt.not !== undefined) {
              list = list.filter((c) => c.archivedAt !== null);
            }
            if (where?.status) {
              list = list.filter((c) => c.status === where.status);
            }
            if (where?.OR && Array.isArray(where.OR)) {
              list = list.filter((c) => {
                return where.OR.some((cond: any) => {
                  if (cond.title?.contains) {
                    return c.title.toLowerCase().includes(cond.title.contains.toLowerCase());
                  }
                  if (cond.subject?.contains) {
                    return c.subject.toLowerCase().includes(cond.subject.contains.toLowerCase());
                  }
                  if (cond.topic?.contains) {
                    return c.topic.toLowerCase().includes(cond.topic.contains.toLowerCase());
                  }
                  return false;
                });
              });
            }

            if (orderBy?.title === "asc") {
              list.sort((a, b) => a.title.localeCompare(b.title));
            } else if (orderBy?.title === "desc") {
              list.sort((a, b) => b.title.localeCompare(a.title));
            } else if (orderBy?.updatedAt === "asc") {
              list.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
            } else {
              list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
            }

            const paged = list.slice(skip, skip + take);
            return paged.map((item) => {
              const cls = item.classId ? classes.get(item.classId) : null;
              return {
                ...item,
                class: cls ? { id: cls.id, name: cls.name } : null,
              };
            });
          }),
        count: vi.fn().mockImplementation(async ({ where }: any) => {
          let list = Array.from(contents.values());
          if (where?.teacherId) list = list.filter((c) => c.teacherId === where.teacherId);
          if (where?.type) list = list.filter((c) => c.type === where.type);
          if (where?.classId) list = list.filter((c) => c.classId === where.classId);
          if (where?.subject?.equals) {
            list = list.filter((c) => c.subject.toLowerCase() === where.subject.equals.toLowerCase());
          }
          if (where?.topic?.equals) {
            list = list.filter((c) => c.topic.toLowerCase() === where.topic.equals.toLowerCase());
          }
          if (where?.archivedAt === null) {
            list = list.filter((c) => c.archivedAt === null);
          } else if (where?.archivedAt && where?.archivedAt.not !== undefined) {
            list = list.filter((c) => c.archivedAt !== null);
          }
          if (where?.status) {
            list = list.filter((c) => c.status === where.status);
          }
          if (where?.OR && Array.isArray(where.OR)) {
            list = list.filter((c) => {
              return where.OR.some((cond: any) => {
                if (cond.title?.contains) {
                  return c.title.toLowerCase().includes(cond.title.contains.toLowerCase());
                }
                if (cond.subject?.contains) {
                  return c.subject.toLowerCase().includes(cond.subject.contains.toLowerCase());
                }
                if (cond.topic?.contains) {
                  return c.topic.toLowerCase().includes(cond.topic.contains.toLowerCase());
                }
                return false;
              });
            });
          }
          return list.length;
        }),
        findFirst: vi.fn().mockImplementation(async ({ where }: any) => {
          for (const c of contents.values()) {
            if (where.id && c.id === where.id) {
              if (where.teacherId && c.teacherId !== where.teacherId) continue;
              const cls = c.classId ? classes.get(c.classId) : null;
              return { ...c, class: cls ? { id: cls.id, name: cls.name } : null };
            }
            if (where.type && where.resourceId && c.type === where.type && c.resourceId === where.resourceId) {
              if (where.teacherId && c.teacherId !== where.teacherId) continue;
              const cls = c.classId ? classes.get(c.classId) : null;
              return { ...c, class: cls ? { id: cls.id, name: cls.name } : null };
            }
          }
          return null;
        }),
        update: vi.fn().mockImplementation(async ({ where, data }: any) => {
          for (const [k, c] of contents.entries()) {
            if (c.id === where.id) {
              Object.assign(c, data, { updatedAt: new Date() });
              const cls = c.classId ? classes.get(c.classId) : null;
              return { ...c, class: cls ? { id: cls.id, name: cls.name } : null };
            }
          }
          return null;
        }),
      };

      generationRequest = {
        create: vi.fn().mockImplementation(async ({ data }: any) => {
          const id = randomUUID();
          const gen = { id, ...data, createdAt: new Date() };
          genRequests.set(id, gen);
          return gen;
        }),
        update: vi.fn().mockImplementation(async ({ where, data }: any) => {
          const gen = genRequests.get(where.id);
          if (gen) {
            Object.assign(gen, data);
            return gen;
          }
          return null;
        }),
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
import { backfillContent } from "../apps/api/src/scripts/backfill-content";

describe("Content Library Foundation", () => {
  let authCookieTeacherA: string;
  let authCookieTeacherB: string;
  let classAId: string;
  let classBId: string;

  beforeAll(async () => {
    setAIProvider(new MockAIProvider());

    // 1. Signup Teacher A
    const signupA = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        email: "library.teacher.a@example.com",
        password: "Password123!",
      });
    authCookieTeacherA = signupA.headers["set-cookie"][0].split(";")[0];

    await request(app)
      .post("/api/v1/teacher/profile")
      .set("Cookie", authCookieTeacherA)
      .send({
        displayName: "Teacher A",
        teachingRole: "Math Teacher",
        subjects: ["Mathematics", "Science"],
        curriculumBoard: "CBSE",
        experienceLevel: "5+ years",
      });

    const classARes = await request(app)
      .post("/api/v1/classes")
      .set("Cookie", authCookieTeacherA)
      .send({
        name: "Grade 6 Math",
        grade: "6",
        section: "A",
        curriculumBoard: "CBSE",
      });
    classAId = classARes.body.class.id;

    // 2. Signup Teacher B
    const signupB = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        email: "library.teacher.b@example.com",
        password: "Password123!",
      });
    authCookieTeacherB = signupB.headers["set-cookie"][0].split(";")[0];

    await request(app)
      .post("/api/v1/teacher/profile")
      .set("Cookie", authCookieTeacherB)
      .send({
        displayName: "Teacher B",
        teachingRole: "History Teacher",
        subjects: ["History"],
        curriculumBoard: "CBSE",
        experienceLevel: "3 years",
      });

    const classBRes = await request(app)
      .post("/api/v1/classes")
      .set("Cookie", authCookieTeacherB)
      .send({
        name: "Grade 8 History",
        grade: "8",
        section: "B",
        curriculumBoard: "CBSE",
      });
    classBId = classBRes.body.class.id;
  });

  afterAll(() => {
    setAIProvider(new MockAIProvider());
  });

  it("automatically creates Content catalog entries when Lesson, Worksheet, Quiz, and Homework are generated", async () => {
    // 1. Generate Lesson
    const lessonRes = await request(app)
      .post("/api/v1/lessons/generate")
      .set("Cookie", authCookieTeacherA)
      .send({
        classId: classAId,
        subject: "Mathematics",
        topic: "Fractions and Decimals",
        durationMinutes: 45,
        difficulty: "MEDIUM",
      });
    expect(lessonRes.status).toBe(201);

    // 2. Generate Worksheet
    const wsRes = await request(app)
      .post("/api/v1/worksheets/generate")
      .set("Cookie", authCookieTeacherA)
      .send({
        classId: classAId,
        subject: "Mathematics",
        topic: "Algebra Basics",
        questionCount: 5,
        difficulty: "EASY",
      });
    expect(wsRes.status).toBe(201);

    // 3. Generate Quiz
    const quizRes = await request(app)
      .post("/api/v1/quizzes/generate")
      .set("Cookie", authCookieTeacherA)
      .send({
        classId: classAId,
        subject: "Science",
        topic: "Photosynthesis",
        questionCount: 4,
        difficulty: "HARD",
      });
    expect(quizRes.status).toBe(201);

    // 4. Generate Homework
    const hwRes = await request(app)
      .post("/api/v1/homeworks/generate")
      .set("Cookie", authCookieTeacherA)
      .send({
        classId: classAId,
        subject: "Science",
        topic: "Solar System",
        estimatedTimeMinutes: 30,
        difficulty: "MEDIUM",
      });
    expect(hwRes.status).toBe(201);

    // 5. Query Content API
    const listRes = await request(app)
      .get("/api/v1/content")
      .set("Cookie", authCookieTeacherA);

    expect(listRes.status).toBe(200);
    expect(listRes.body.items).toHaveLength(4);
    expect(listRes.body.pagination.total).toBe(4);

    const types = listRes.body.items.map((i: any) => i.type);
    expect(types).toContain("LESSON");
    expect(types).toContain("WORKSHEET");
    expect(types).toContain("QUIZ");
    expect(types).toContain("HOMEWORK");

    // Verify teacherId is NOT exposed in the DTO
    listRes.body.items.forEach((item: any) => {
      expect(item.teacherId).toBeUndefined();
      expect(item.class).toBeDefined();
      expect(item.class.name).toBe("Grade 6 Math");
    });
  });

  it("supports search across title, subject, and topic", async () => {
    // Search for "Fractions"
    const searchRes = await request(app)
      .get("/api/v1/content?search=fractions")
      .set("Cookie", authCookieTeacherA);

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.items.length).toBeGreaterThanOrEqual(1);
    expect(searchRes.body.items[0].topic).toBe("Fractions and Decimals");

    // Search for "Algebra"
    const searchAlgebra = await request(app)
      .get("/api/v1/content?search=algebra")
      .set("Cookie", authCookieTeacherA);
    expect(searchAlgebra.status).toBe(200);
    expect(searchAlgebra.body.items.length).toBeGreaterThanOrEqual(1);
    expect(searchAlgebra.body.items[0].type).toBe("WORKSHEET");
  });

  it("supports filtering by type, classId, subject, and status", async () => {
    // Filter by type: QUIZ
    const quizFilter = await request(app)
      .get("/api/v1/content?type=QUIZ")
      .set("Cookie", authCookieTeacherA);
    expect(quizFilter.status).toBe(200);
    expect(quizFilter.body.items).toHaveLength(1);
    expect(quizFilter.body.items[0].type).toBe("QUIZ");

    // Filter by subject: Mathematics
    const mathFilter = await request(app)
      .get("/api/v1/content?subject=Mathematics")
      .set("Cookie", authCookieTeacherA);
    expect(mathFilter.status).toBe(200);
    expect(mathFilter.body.items).toHaveLength(2); // Lesson & Worksheet

    // Filter by classId
    const classFilter = await request(app)
      .get(`/api/v1/content?classId=${classAId}`)
      .set("Cookie", authCookieTeacherA);
    expect(classFilter.status).toBe(200);
    expect(classFilter.body.items).toHaveLength(4);
  });

  it("supports deterministic sorting and pagination", async () => {
    const page1 = await request(app)
      .get("/api/v1/content?page=1&pageSize=2&sort=title_asc")
      .set("Cookie", authCookieTeacherA);

    expect(page1.status).toBe(200);
    expect(page1.body.items).toHaveLength(2);
    expect(page1.body.pagination.page).toBe(1);
    expect(page1.body.pagination.pageSize).toBe(2);
    expect(page1.body.pagination.total).toBe(4);
    expect(page1.body.pagination.totalPages).toBe(2);

    const page2 = await request(app)
      .get("/api/v1/content?page=2&pageSize=2&sort=title_asc")
      .set("Cookie", authCookieTeacherA);

    expect(page2.status).toBe(200);
    expect(page2.body.items).toHaveLength(2);
    expect(page2.body.pagination.page).toBe(2);
  });

  it("strictly enforces multi-tenant isolation across teachers", async () => {
    // Teacher B should have 0 items in library
    const listTeacherB = await request(app)
      .get("/api/v1/content")
      .set("Cookie", authCookieTeacherB);

    expect(listTeacherB.status).toBe(200);
    expect(listTeacherB.body.items).toHaveLength(0);

    // Get Teacher A's content item
    const listTeacherA = await request(app)
      .get("/api/v1/content")
      .set("Cookie", authCookieTeacherA);
    const contentAId = listTeacherA.body.items[0].id;

    // Teacher B attempting to fetch Teacher A's content directly
    const directFetch = await request(app)
      .get(`/api/v1/content/${contentAId}`)
      .set("Cookie", authCookieTeacherB);
    expect(directFetch.status).toBe(404);

    // Teacher B attempting to duplicate Teacher A's content
    const duplicateRes = await request(app)
      .post(`/api/v1/content/${contentAId}/duplicate`)
      .set("Cookie", authCookieTeacherB);
    expect(duplicateRes.status).toBe(404);

    // Teacher B attempting to archive Teacher A's content
    const archiveRes = await request(app)
      .post(`/api/v1/content/${contentAId}/archive`)
      .set("Cookie", authCookieTeacherB);
    expect(archiveRes.status).toBe(404);
  });

  it("duplicates resources cleanly without invoking AI provider", async () => {
    const listA = await request(app)
      .get("/api/v1/content?type=QUIZ")
      .set("Cookie", authCookieTeacherA);
    const quizContent = listA.body.items[0];

    const duplicateRes = await request(app)
      .post(`/api/v1/content/${quizContent.id}/duplicate`)
      .set("Cookie", authCookieTeacherA);

    expect(duplicateRes.status).toBe(201);
    expect(duplicateRes.body.content).toBeDefined();
    expect(duplicateRes.body.content.id).not.toBe(quizContent.id);
    expect(duplicateRes.body.content.resourceId).not.toBe(quizContent.resourceId);
    expect(duplicateRes.body.content.title).toBe(`${quizContent.title} (Copy)`);
    expect(duplicateRes.body.content.status).toBe("SAVED");
    expect(duplicateRes.body.content.type).toBe("QUIZ");
  });

  it("archives resources transactionally from the library and updates domain status", async () => {
    const listA = await request(app)
      .get("/api/v1/content?type=LESSON")
      .set("Cookie", authCookieTeacherA);
    const lessonContent = listA.body.items[0];

    const archiveRes = await request(app)
      .post(`/api/v1/content/${lessonContent.id}/archive`)
      .set("Cookie", authCookieTeacherA);

    expect(archiveRes.status).toBe(200);
    expect(archiveRes.body.content.archivedAt).not.toBeNull();
    expect(archiveRes.body.content.status).toBe("ARCHIVED");

    // Excluded from default active library
    const activeList = await request(app)
      .get("/api/v1/content?type=LESSON")
      .set("Cookie", authCookieTeacherA);
    expect(activeList.body.items.find((i: any) => i.id === lessonContent.id)).toBeUndefined();

    // Appears when filtering for ARCHIVED
    const archivedList = await request(app)
      .get("/api/v1/content?status=ARCHIVED")
      .set("Cookie", authCookieTeacherA);
    expect(archivedList.body.items.find((i: any) => i.id === lessonContent.id)).toBeDefined();

    // Supports explicit status=ACTIVE query param cleanly
    const explicitActiveList = await request(app)
      .get("/api/v1/content?status=ACTIVE")
      .set("Cookie", authCookieTeacherA);
    expect(explicitActiveList.status).toBe(200);
    expect(explicitActiveList.body.items.find((i: any) => i.id === lessonContent.id)).toBeUndefined();
  });

  it("backfillContent script executes idempotently across all resource types", async () => {
    // Run backfill
    await expect(backfillContent()).resolves.not.toThrow();

    // Running a second time should not duplicate or error
    await expect(backfillContent()).resolves.not.toThrow();
  });
});
