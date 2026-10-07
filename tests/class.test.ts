import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

const users = new Map<string, any>();
const profiles = new Map<string, any>();
const classes = new Map<string, any>();

vi.mock("@prisma/client", () => {
  return {
    PrismaClient: class {
      user = {
        deleteMany: vi.fn().mockImplementation(async () => {
          users.clear();
          profiles.clear();
          classes.clear();
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
              const id = "user-uuid-" + Math.random().toString(36).substring(7);
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
              const id = "profile-uuid-" + Math.random().toString(36).substring(7);
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
              const id = "class-uuid-" + Math.random().toString(36).substring(7);
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
    },
  };
});

describe("Class Management Foundation API", () => {
  let app: any;
  let request: any;
  let teacherACookie: string;
  let teacherBCookie: string;

  beforeAll(async () => {
    const supertest = await import("supertest");
    request = supertest.default;
    const serverModule = await import("../apps/api/src/index");
    app = serverModule.default;

    // Signup Teacher A
    const resA = await request(app)
      .post("/api/v1/auth/signup")
      .send({ email: "teacher.a@school.edu", password: "Password123" });
    teacherACookie = resA.headers["set-cookie"][0].split(";")[0];

    // Signup Teacher B
    const resB = await request(app)
      .post("/api/v1/auth/signup")
      .send({ email: "teacher.b@school.edu", password: "Password123" });
    teacherBCookie = resB.headers["set-cookie"][0].split(";")[0];
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("should reject unauthenticated class requests with 401", async () => {
    const resList = await request(app).get("/api/v1/classes");
    expect(resList.status).toBe(401);

    const resCreate = await request(app)
      .post("/api/v1/classes")
      .send({ name: "Class 4 Math", grade: "4" });
    expect(resCreate.status).toBe(401);
  });

  it("should reject invalid class creation input with 400", async () => {
    // Missing grade
    const resNoGrade = await request(app)
      .post("/api/v1/classes")
      .set("Cookie", teacherACookie)
      .send({ name: "Class 4 Math" });
    expect(resNoGrade.status).toBe(400);

    // Empty name
    const resEmptyName = await request(app)
      .post("/api/v1/classes")
      .set("Cookie", teacherACookie)
      .send({ name: "", grade: "4" });
    expect(resEmptyName.status).toBe(400);
  });

  let createdClassId: string;

  it("should create a class successfully for Teacher A", async () => {
    const res = await request(app)
      .post("/api/v1/classes")
      .set("Cookie", teacherACookie)
      .send({
        name: "Class 4 Mathematics",
        grade: "4",
        section: "A",
        curriculumBoard: "CBSE",
        academicYear: "2026-27",
      });

    expect(res.status).toBe(201);
    expect(res.body.class).toBeDefined();
    expect(res.body.class.name).toBe("Class 4 Mathematics");
    expect(res.body.class.grade).toBe("4");
    expect(res.body.class.section).toBe("A");
    expect(res.body.class.curriculumBoard).toBe("CBSE");
    expect(res.body.class.academicYear).toBe("2026-27");
    expect(res.body.class.archivedAt).toBeNull();

    createdClassId = res.body.class.id;
  });

  it("should list active classes for Teacher A", async () => {
    const res = await request(app)
      .get("/api/v1/classes")
      .set("Cookie", teacherACookie);

    expect(res.status).toBe(200);
    expect(res.body.classes).toBeDefined();
    expect(res.body.classes.length).toBe(1);
    expect(res.body.classes[0].id).toBe(createdClassId);
  });

  it("should get class details by id for Teacher A", async () => {
    const res = await request(app)
      .get(`/api/v1/classes/${createdClassId}`)
      .set("Cookie", teacherACookie);

    expect(res.status).toBe(200);
    expect(res.body.class.id).toBe(createdClassId);
    expect(res.body.class.name).toBe("Class 4 Mathematics");
  });

  it("should prevent Teacher B from accessing Teacher A's class (ownership check)", async () => {
    // Teacher B list should be empty
    const resBList = await request(app)
      .get("/api/v1/classes")
      .set("Cookie", teacherBCookie);
    expect(resBList.status).toBe(200);
    expect(resBList.body.classes.length).toBe(0);

    // Teacher B attempting GET on Teacher A's classId -> 404 Not Found
    const resBGet = await request(app)
      .get(`/api/v1/classes/${createdClassId}`)
      .set("Cookie", teacherBCookie);
    expect(resBGet.status).toBe(404);
    expect(resBGet.body.error).toBe("Class not found");

    // Teacher B attempting PATCH on Teacher A's classId -> 404 Not Found
    const resBPatch = await request(app)
      .patch(`/api/v1/classes/${createdClassId}`)
      .set("Cookie", teacherBCookie)
      .send({ name: "Hacked Class" });
    expect(resBPatch.status).toBe(404);

    // Teacher B attempting Archive on Teacher A's classId -> 404 Not Found
    const resBArchive = await request(app)
      .post(`/api/v1/classes/${createdClassId}/archive`)
      .set("Cookie", teacherBCookie);
    expect(resBArchive.status).toBe(404);
  });

  it("should update class fields for Teacher A via PATCH", async () => {
    const res = await request(app)
      .patch(`/api/v1/classes/${createdClassId}`)
      .set("Cookie", teacherACookie)
      .send({
        name: "Class 4 Advanced Math",
        section: "B",
      });

    expect(res.status).toBe(200);
    expect(res.body.class.name).toBe("Class 4 Advanced Math");
    expect(res.body.class.section).toBe("B");
    expect(res.body.class.grade).toBe("4");
  });

  it("should archive a class and exclude it from the active list", async () => {
    const resArchive = await request(app)
      .post(`/api/v1/classes/${createdClassId}/archive`)
      .set("Cookie", teacherACookie);

    expect(resArchive.status).toBe(200);
    expect(resArchive.body.class.archivedAt).not.toBeNull();

    // Active classes list should now be empty
    const resListAfter = await request(app)
      .get("/api/v1/classes")
      .set("Cookie", teacherACookie);

    expect(resListAfter.status).toBe(200);
    expect(resListAfter.body.classes.length).toBe(0);
  });
});
