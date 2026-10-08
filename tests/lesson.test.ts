import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { randomUUID } from "node:crypto";

const users = new Map<string, any>();
const profiles = new Map<string, any>();
const classes = new Map<string, any>();
const lessons = new Map<string, any>();
const genRequests = new Map<string, any>();
const contents = new Map<string, any>();

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
                subjects: data.subjects,
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
                const cleanData = Object.fromEntries(
                  Object.entries(data).filter(([_, v]) => v !== undefined),
                );
                Object.assign(c, cleanData, { updatedAt: new Date() });
                return { ...c };
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
                const cleanData = Object.fromEntries(
                  Object.entries(data).filter(([_, v]) => v !== undefined),
                );
                Object.assign(l, cleanData, { updatedAt: new Date() });
                return { ...l };
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
            let existing = contents.get(key);
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
    },
  };
});


describe("Lesson Generation Foundation API", () => {
  let app: any;
  let request: any;
  let teacherACookie: string;
  let teacherBCookie: string;
  let teacherAClassId: string;
  let teacherBClassId: string;

  beforeAll(async () => {
    const supertest = await import("supertest");
    request = supertest.default;
    const serverModule = await import("../apps/api/src/index");
    app = serverModule.default;

    // Signup Teacher A & create class
    const resA = await request(app)
      .post("/api/v1/auth/signup")
      .send({ email: "teacher.lesson.a@school.edu", password: "Password123" });
    teacherACookie = resA.headers["set-cookie"][0].split(";")[0];

    const classResA = await request(app)
      .post("/api/v1/classes")
      .set("Cookie", teacherACookie)
      .send({ name: "Grade 4 Science A", grade: "4", curriculumBoard: "CBSE" });
    teacherAClassId = classResA.body.class.id;

    // Signup Teacher B & create class
    const resB = await request(app)
      .post("/api/v1/auth/signup")
      .send({ email: "teacher.lesson.b@school.edu", password: "Password123" });
    teacherBCookie = resB.headers["set-cookie"][0].split(";")[0];

    const classResB = await request(app)
      .post("/api/v1/classes")
      .set("Cookie", teacherBCookie)
      .send({ name: "Grade 5 Math B", grade: "5", curriculumBoard: "ICSE" });
    teacherBClassId = classResB.body.class.id;
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("should reject unauthenticated generation requests with 401", async () => {
    const res = await request(app)
      .post("/api/v1/lessons/generate")
      .send({
        classId: teacherAClassId,
        subject: "Science",
        topic: "The Water Cycle",
      });
    expect(res.status).toBe(401);
  });

  it("should reject invalid generation input (missing required fields) with 400", async () => {
    const res = await request(app)
      .post("/api/v1/lessons/generate")
      .set("Cookie", teacherACookie)
      .send({
        classId: teacherAClassId,
        // missing subject & topic
      });
    expect(res.status).toBe(400);
  });

  it("should enforce class ownership: Teacher A cannot generate for Teacher B's class", async () => {
    const res = await request(app)
      .post("/api/v1/lessons/generate")
      .set("Cookie", teacherACookie)
      .send({
        classId: teacherBClassId,
        subject: "Science",
        topic: "The Water Cycle",
        durationMinutes: 40,
        difficulty: "MEDIUM",
      });
    expect(res.status).toBe(404);
  });

  let createdLessonId: string;

  it("should generate a structured lesson for Teacher A and persist it as DRAFT", async () => {
    const res = await request(app)
      .post("/api/v1/lessons/generate")
      .set("Cookie", teacherACookie)
      .send({
        classId: teacherAClassId,
        subject: "Science",
        topic: "Photosynthesis and Plant Energy",
        durationMinutes: 40,
        difficulty: "MEDIUM",
        teacherInstructions: "Focus on sunlight and chlorophyll.",
      });

    expect(res.status).toBe(201);
    expect(res.body.lesson).toBeDefined();
    expect(res.body.lesson.status).toBe("DRAFT");
    expect(res.body.lesson.subject).toBe("Science");
    expect(res.body.lesson.topic).toBe("Photosynthesis and Plant Energy");

    const content = res.body.lesson.content;
    expect(content.title).toBeDefined();
    expect(content.overview).toBeDefined();
    expect(Array.isArray(content.learningObjectives)).toBe(true);
    expect(content.learningObjectives.length).toBeGreaterThan(0);
    expect(content.classroomActivity).toBeDefined();
    expect(content.classroomActivity.title).toBeDefined();
    expect(content.classroomActivity.durationMinutes).toBeLessThanOrEqual(40);
    expect(Array.isArray(content.examples)).toBe(true);
    expect(content.teacherScript).toBeDefined();

    createdLessonId = res.body.lesson.id;
  });

  it("should list active lessons for Teacher A", async () => {
    const res = await request(app)
      .get("/api/v1/lessons")
      .set("Cookie", teacherACookie);

    expect(res.status).toBe(200);
    expect(res.body.lessons.length).toBe(1);
    expect(res.body.lessons[0].id).toBe(createdLessonId);
  });

  it("should get lesson details by id for Teacher A", async () => {
    const res = await request(app)
      .get(`/api/v1/lessons/${createdLessonId}`)
      .set("Cookie", teacherACookie);

    expect(res.status).toBe(200);
    expect(res.body.lesson.id).toBe(createdLessonId);
  });

  it("should prevent Teacher B from accessing Teacher A's lesson (ownership check)", async () => {
    // Teacher B GET -> 404
    const resGet = await request(app)
      .get(`/api/v1/lessons/${createdLessonId}`)
      .set("Cookie", teacherBCookie);
    expect(resGet.status).toBe(404);

    // Teacher B PATCH -> 404
    const resPatch = await request(app)
      .patch(`/api/v1/lessons/${createdLessonId}`)
      .set("Cookie", teacherBCookie)
      .send({ title: "Hacked Lesson" });
    expect(resPatch.status).toBe(404);

    // Teacher B Archive -> 404
    const resArchive = await request(app)
      .post(`/api/v1/lessons/${createdLessonId}/archive`)
      .set("Cookie", teacherBCookie);
    expect(resArchive.status).toBe(404);
  });

  it("should update a lesson's structured content and status to SAVED", async () => {
    const getRes = await request(app)
      .get(`/api/v1/lessons/${createdLessonId}`)
      .set("Cookie", teacherACookie);

    const updatedContent = {
      ...getRes.body.lesson.content,
      title: "Updated Title: Photosynthesis in Depth",
      teacherScript: "Good morning young scientists! Look at that green leaf...",
    };

    const res = await request(app)
      .patch(`/api/v1/lessons/${createdLessonId}`)
      .set("Cookie", teacherACookie)
      .send({
        content: updatedContent,
        status: "SAVED",
      });

    expect(res.status).toBe(200);
    expect(res.body.lesson.title).toBe("Updated Title: Photosynthesis in Depth");
    expect(res.body.lesson.status).toBe("SAVED");
    expect(res.body.lesson.content.teacherScript).toBe(
      "Good morning young scientists! Look at that green leaf...",
    );
  });

  it("should regenerate a lesson candidate cleanly and update the record", async () => {
    const res = await request(app)
      .post(`/api/v1/lessons/${createdLessonId}/regenerate`)
      .set("Cookie", teacherACookie)
      .send({
        teacherInstructions: "Add more emphasis on plant glucose production.",
      });

    expect(res.status).toBe(200);
    expect(res.body.lesson.id).toBe(createdLessonId);
    expect(res.body.lesson.status).toBe("DRAFT");
    expect(res.body.lesson.content).toBeDefined();
  });

  it("should archive a lesson and exclude it from the active list", async () => {
    const res = await request(app)
      .post(`/api/v1/lessons/${createdLessonId}/archive`)
      .set("Cookie", teacherACookie);

    expect(res.status).toBe(200);
    expect(res.body.lesson.archivedAt).not.toBeNull();

    // Active list should be empty
    const listRes = await request(app)
      .get("/api/v1/lessons")
      .set("Cookie", teacherACookie);
    expect(listRes.status).toBe(200);
    expect(listRes.body.lessons.length).toBe(0);
  });
});
