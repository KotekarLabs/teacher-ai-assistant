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
        update: vi
          .fn()
          .mockImplementation(
            async ({ where, data }: { where: { userId: string }; data: any }) => {
              const profile = profiles.get(where.userId);
              if (profile) {
                Object.assign(profile, data);
                return profile;
              }
              return null;
            },
          ),
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
        update: vi
          .fn()
          .mockImplementation(
            async ({ where, data }: { where: { id: string }; data: any }) => {
              const c = classes.get(where.id);
              if (c) {
                Object.assign(c, data);
                return c;
              }
              return null;
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
        findUnique: vi
          .fn()
          .mockImplementation(async ({ where }: { where: { id: string } }) => {
            return genRequests.get(where.id) || null;
          }),
      };

      lesson = {
        findMany: vi
          .fn()
          .mockImplementation(
            async ({
              where,
            }: {
              where: { teacherId: string; archivedAt?: any };
            }) => {
              const list: any[] = [];
              for (const l of lessons.values()) {
                if (l.teacherId === where.teacherId) {
                  if (where.archivedAt === null && l.archivedAt !== null) {
                    continue;
                  }
                  list.push({ ...l });
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
        update: vi
          .fn()
          .mockImplementation(
            async ({ where, data }: { where: { id: string }; data: any }) => {
              const l = lessons.get(where.id);
              if (l) {
                Object.assign(l, data);
                return l;
              }
              return null;
            },
          ),
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

describe("Stage 1 Visual Lesson API Integration Suite", () => {
  let app: any;
  let request: any;

  let teacherACookie: string;
  let teacherBCookie: string;
  let teacherCCookie: string;

  let teacherAClass1Id: string;
  let teacherAClass2Id: string;
  let teacherBClass1Id: string;
  let teacherCClass1Id: string;

  let generatedVisualLessonId: string;

  beforeAll(async () => {
    const supertest = await import("supertest");
    request = supertest.default;
    const serverModule = await import("../apps/api/src/index");
    app = serverModule.default;

    // 1. Teacher A setup (teaches Mathematics, Grade 1 & Grade 2 classes)
    const resA = await request(app)
      .post("/api/v1/auth/signup")
      .send({ email: "teacher.vis.a@school.edu", password: "Password123" });
    teacherACookie = resA.headers["set-cookie"][0].split(";")[0];

    await request(app)
      .post("/api/v1/teacher/profile")
      .set("Cookie", teacherACookie)
      .send({
        displayName: "Teacher A (Math)",
        teachingRole: "Primary Teacher",
        subjects: ["Mathematics"],
        preferredLanguage: "kannada",
        curriculumBoard: "Karnataka State Board",
        experienceLevel: "SENIOR",
      });

    const classResA1 = await request(app)
      .post("/api/v1/classes")
      .set("Cookie", teacherACookie)
      .send({ name: "Grade 1 Section A", grade: "1", curriculumBoard: "Karnataka State Board" });
    teacherAClass1Id = classResA1.body.class.id;

    const classResA2 = await request(app)
      .post("/api/v1/classes")
      .set("Cookie", teacherACookie)
      .send({ name: "Grade 2 Section A", grade: "2", curriculumBoard: "Karnataka State Board" });
    teacherAClass2Id = classResA2.body.class.id;

    // 2. Teacher B setup (different tenant, Grade 1 Math class)
    const resB = await request(app)
      .post("/api/v1/auth/signup")
      .send({ email: "teacher.vis.b@school.edu", password: "Password123" });
    teacherBCookie = resB.headers["set-cookie"][0].split(";")[0];

    await request(app)
      .post("/api/v1/teacher/profile")
      .set("Cookie", teacherBCookie)
      .send({
        displayName: "Teacher B",
        teachingRole: "Primary Teacher",
        subjects: ["Mathematics"],
        preferredLanguage: "kannada",
        curriculumBoard: "Karnataka State Board",
        experienceLevel: "BEGINNER",
      });

    const classResB1 = await request(app)
      .post("/api/v1/classes")
      .set("Cookie", teacherBCookie)
      .send({ name: "Grade 1 Section B", grade: "1", curriculumBoard: "Karnataka State Board" });
    teacherBClass1Id = classResB1.body.class.id;

    // 3. Teacher C setup (teaches English only, no Mathematics)
    const resC = await request(app)
      .post("/api/v1/auth/signup")
      .send({ email: "teacher.vis.c@school.edu", password: "Password123" });
    teacherCCookie = resC.headers["set-cookie"][0].split(";")[0];

    await request(app)
      .post("/api/v1/teacher/profile")
      .set("Cookie", teacherCCookie)
      .send({
        displayName: "Teacher C (English)",
        teachingRole: "Language Teacher",
        subjects: ["English"],
        preferredLanguage: "english",
        curriculumBoard: "Karnataka State Board",
        experienceLevel: "INTERMEDIATE",
      });

    const classResC1 = await request(app)
      .post("/api/v1/classes")
      .set("Cookie", teacherCCookie)
      .send({ name: "Grade 1 Section C", grade: "1", curriculumBoard: "Karnataka State Board" });
    teacherCClass1Id = classResC1.body.class.id;
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  /* -------------------------------------------------------------------------- */
  /* 1. VISUAL LESSON GENERATION WITH SERVER PROVENANCE & CANONICAL CATALOG     */
  /* -------------------------------------------------------------------------- */
  it("generates a visual lesson with hydrated canonical catalogue & server-owned provenance", async () => {
    const res = await request(app)
      .post("/api/v1/lessons/generate")
      .set("Cookie", teacherACookie)
      .send({
        classId: teacherAClass1Id,
        subject: "Mathematics",
        topic: "What is Long? What is Round?",
        curriculumTopicId: "JOYFUL_MATH_C1_CH2_V1",
      });

    expect(res.status).toBe(201);
    expect(res.body.lesson).toBeDefined();
    generatedVisualLessonId = res.body.lesson.id;

    const content = res.body.lesson.content;
    expect(content.visualExplanation).toBeDefined();
    expect(content.visualExplanation.format).toBe("SORTING_DIAGRAM");

    // Check server-owned provenance
    const provenance = content.visualExplanation.provenance;
    expect(provenance.curriculumBoard).toBe("Karnataka State Board");
    expect(provenance.textbook).toBe("Joyful Mathematics, Class 1, Part 1, English and Kannada Bilingual");
    expect(provenance.edition).toBe("Revised 2026–27");
    expect(provenance.chapter).toBe("Chapter 2: What is Long? What is Round?");
    expect(provenance.printedPages).toBe("13–14");

    // Check 8 hydrated items
    const items = content.visualExplanation.sortingActivity.items;
    expect(items.length).toBe(8);

    const bat = items.find((i: any) => i.id === "bat");
    expect(bat).toBeDefined();
    expect(bat.nameEnglish).toBe("Cricket Bat");
    expect(bat.nameKannada).toBe("ಬ್ಯಾಟ್ (ಬ್ಯಾಟು)");
    expect(bat.shapeCategory).toBe("LONG");
    expect(bat.rolls).toBe(false);
    expect(bat.slides).toBe(true);

    const ball = items.find((i: any) => i.id === "ball");
    expect(ball).toBeDefined();
    expect(ball.nameEnglish).toBe("Ball");
    expect(ball.nameKannada).toBe("ಚೆಂಡು");
    expect(ball.shapeCategory).toBe("ROUND");
    expect(ball.rolls).toBe(true);
    expect(ball.slides).toBe(false);
  });

  /* -------------------------------------------------------------------------- */
  /* 2. TENANT ISOLATION                                                        */
  /* -------------------------------------------------------------------------- */
  it("prevents Teacher B from retrieving Teacher A's visual lesson (HTTP 404)", async () => {
    const res = await request(app)
      .get(`/api/v1/lessons/${generatedVisualLessonId}`)
      .set("Cookie", teacherBCookie);

    expect(res.status).toBe(404);
  });

  it("prevents Teacher B from updating Teacher A's visual lesson (HTTP 404)", async () => {
    const res = await request(app)
      .put(`/api/v1/lessons/${generatedVisualLessonId}`)
      .set("Cookie", teacherBCookie)
      .send({
        title: "Malicious Cross-Tenant Overwrite",
      });

    expect(res.status).toBe(404);
  });

  it("prevents Teacher A from generating a lesson for Teacher B's class (HTTP 404)", async () => {
    const res = await request(app)
      .post("/api/v1/lessons/generate")
      .set("Cookie", teacherACookie)
      .send({
        classId: teacherBClass1Id,
        subject: "Mathematics",
        topic: "What is Long? What is Round?",
        curriculumTopicId: "JOYFUL_MATH_C1_CH2_V1",
      });

    expect(res.status).toBe(404);
  });

  /* -------------------------------------------------------------------------- */
  /* 3. CURRICULUM TOPIC & CLASS ELIGIBILITY VALIDATION                         */
  /* -------------------------------------------------------------------------- */
  it("rejects invalid curriculumTopicId with HTTP 400", async () => {
    const res = await request(app)
      .post("/api/v1/lessons/generate")
      .set("Cookie", teacherACookie)
      .send({
        classId: teacherAClass1Id,
        subject: "Mathematics",
        topic: "What is Long? What is Round?",
        curriculumTopicId: "INVALID_UNKNOWN_TOPIC",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid curriculumTopicId");
  });

  it("rejects grade mismatch (Class 2 requested for Class 1 topic) with HTTP 400", async () => {
    const res = await request(app)
      .post("/api/v1/lessons/generate")
      .set("Cookie", teacherACookie)
      .send({
        classId: teacherAClass2Id,
        subject: "Mathematics",
        topic: "What is Long? What is Round?",
        curriculumTopicId: "JOYFUL_MATH_C1_CH2_V1",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Target class grade '2' does not match verified topic grade 'Class 1'");
  });

  it("rejects subject mismatch (Science requested for Mathematics topic) with HTTP 400", async () => {
    const res = await request(app)
      .post("/api/v1/lessons/generate")
      .set("Cookie", teacherACookie)
      .send({
        classId: teacherAClass1Id,
        subject: "Science",
        topic: "What is Long? What is Round?",
        curriculumTopicId: "JOYFUL_MATH_C1_CH2_V1",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Subject 'Science' does not match verified topic subject 'Mathematics'");
  });

  it("rejects educator profile lacking Mathematics with HTTP 400", async () => {
    const res = await request(app)
      .post("/api/v1/lessons/generate")
      .set("Cookie", teacherCCookie)
      .send({
        classId: teacherCClass1Id,
        subject: "Mathematics",
        topic: "What is Long? What is Round?",
        curriculumTopicId: "JOYFUL_MATH_C1_CH2_V1",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Educator profile subjects (English) do not list 'Mathematics'");
  });

  /* -------------------------------------------------------------------------- */
  /* 4. SERVER-OWNED PROVENANCE TAMPER-PROOFING & SAFE MERGE                    */
  /* -------------------------------------------------------------------------- */
  it("preserves server provenance when client attempts to inject forged provenance in PUT", async () => {
    const updateRes = await request(app)
      .put(`/api/v1/lessons/${generatedVisualLessonId}`)
      .set("Cookie", teacherACookie)
      .send({
        content: {
          title: "Updated Title By Teacher A",
          visualExplanation: {
            teacherGuidance: "Updated teacher guidance for outdoor activity.",
            // Client attempts to tamper with provenance
            provenance: {
              curriculumBoard: "Forged State Board",
              status: "OFFICIALLY_ENDORSED",
            },
          },
        },
      });

    expect(updateRes.status).toBe(200);
    const content = updateRes.body.lesson.content;
    expect(content.title).toBe("Updated Title By Teacher A");
    expect(content.visualExplanation.teacherGuidance).toBe("Updated teacher guidance for outdoor activity.");

    // Server-owned provenance remains untampered
    const prov = content.visualExplanation.provenance;
    expect(prov.curriculumBoard).toBe("Karnataka State Board");
    expect(prov.textbook).toBe("Joyful Mathematics, Class 1, Part 1, English and Kannada Bilingual");
    expect(prov.status).not.toBe("OFFICIALLY_ENDORSED");
    expect(prov.curriculumBoard).not.toBe("Forged State Board");
  });

  /* -------------------------------------------------------------------------- */
  /* 5. ORDINARY LESSON REGRESSION                                              */
  /* -------------------------------------------------------------------------- */
  it("generates an ordinary lesson when topic matches keywords but no curriculumTopicId is given", async () => {
    const res = await request(app)
      .post("/api/v1/lessons/generate")
      .set("Cookie", teacherACookie)
      .send({
        classId: teacherAClass1Id,
        subject: "Mathematics",
        topic: "What is Long? What is Round? Everyday Exploration",
        // Notice curriculumTopicId is deliberately omitted
      });

    expect(res.status).toBe(201);
    expect(res.body.lesson).toBeDefined();
    expect(res.body.lesson.content.title).toBeTruthy();
    expect(res.body.lesson.content.visualExplanation).toBeUndefined();
  });
});
