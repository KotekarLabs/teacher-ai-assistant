import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { randomUUID } from "node:crypto";

const users = new Map<string, any>();
const profiles = new Map<string, any>();
const classes = new Map<string, any>();
const quizzes = new Map<string, any>();
const quizQuestions = new Map<string, any>();
const genRequests = new Map<string, any>();

vi.mock("@prisma/client", () => {
  return {
    PrismaClient: class {
      user = {
        deleteMany: vi.fn().mockImplementation(async () => {
          users.clear();
          profiles.clear();
          classes.clear();
          quizzes.clear();
          quizQuestions.clear();
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

      quiz = {
        findMany: vi
          .fn()
          .mockImplementation(
            async ({
              where,
            }: {
              where: { teacherId: string; archivedAt?: any };
            }) => {
              const result: any[] = [];
              for (const qz of quizzes.values()) {
                if (qz.teacherId === where.teacherId) {
                  if (where.archivedAt === null && qz.archivedAt !== null) {
                    continue;
                  }
                  const questions = Array.from(
                    quizQuestions.values(),
                  ).filter((q) => q.quizId === qz.id);
                  result.push({ ...qz, questions });
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
              const qz = quizzes.get(where.id);
              if (!qz) return null;
              if (where.teacherId && qz.teacherId !== where.teacherId) {
                return null;
              }
              const questions = Array.from(
                quizQuestions.values(),
              ).filter((q) => q.quizId === qz.id);
              return { ...qz, questions };
            },
          ),
        create: vi
          .fn()
          .mockImplementation(async ({ data }: { data: any }) => {
            const id = randomUUID();
            const qz = {
              id,
              teacherId: data.teacherId,
              classId: data.classId,
              generationRequestId: data.generationRequestId || null,
              title: data.title,
              subject: data.subject,
              topic: data.topic,
              curriculumBoard: data.curriculumBoard || null,
              difficulty: data.difficulty || "MEDIUM",
              durationMinutes: data.durationMinutes || 20,
              totalMarks: data.totalMarks || 0,
              instructions: data.instructions || null,
              status: data.status || "DRAFT",
              createdAt: new Date(),
              updatedAt: new Date(),
              archivedAt: null,
            };
            quizzes.set(id, qz);

            const createdQuestions: any[] = [];
            if (data.questions?.create) {
              data.questions.create.forEach((q: any) => {
                const qId = randomUUID();
                const qObj = {
                  id: qId,
                  quizId: id,
                  position: q.position,
                  type: q.type,
                  question: q.question,
                  options: q.options || [],
                  correctAnswer: q.correctAnswer,
                  explanation: q.explanation || null,
                  marks: q.marks || 1,
                  difficulty: q.difficulty || "MEDIUM",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };
                quizQuestions.set(qId, qObj);
                createdQuestions.push(qObj);
              });
            }

            return { ...qz, questions: createdQuestions };
          }),
        update: vi
          .fn()
          .mockImplementation(
            async ({ where, data }: { where: { id: string }; data: any }) => {
              const qz = quizzes.get(where.id);
              if (!qz) return null;
              Object.assign(qz, data);
              qz.updatedAt = new Date();
              const questions = Array.from(
                quizQuestions.values(),
              ).filter((q) => q.quizId === qz.id);
              return { ...qz, questions };
            },
          ),
      };

      quizQuestion = {
        deleteMany: vi
          .fn()
          .mockImplementation(
            async ({ where }: { where: { quizId: string } }) => {
              for (const [key, q] of quizQuestions.entries()) {
                if (q.quizId === where.quizId) {
                  quizQuestions.delete(key);
                }
              }
              return { count: 0 };
            },
          ),
      };

      $transaction = vi.fn().mockImplementation(async (callback: any) => {
        return callback({
          quizQuestion: {
            deleteMany: async ({
              where,
            }: {
              where: { quizId: string };
            }) => {
              for (const [key, q] of quizQuestions.entries()) {
                if (q.quizId === where.quizId) {
                  quizQuestions.delete(key);
                }
              }
              return { count: 0 };
            },
          },
          quiz: {
            update: async ({
              where,
              data,
            }: {
              where: { id: string };
              data: any;
            }) => {
              const qz = quizzes.get(where.id);
              if (!qz) return null;
              Object.assign(qz, {
                title: data.title,
                instructions: data.instructions,
                durationMinutes: data.durationMinutes,
                totalMarks: data.totalMarks,
                status: data.status,
              });
              qz.updatedAt = new Date();

              const createdQuestions: any[] = [];
              if (data.questions?.create) {
                data.questions.create.forEach((q: any) => {
                  const qId = randomUUID();
                  const qObj = {
                    id: qId,
                    quizId: qz.id,
                    position: q.position,
                    type: q.type,
                    question: q.question,
                    options: q.options || [],
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation || null,
                    marks: q.marks || 1,
                    difficulty: q.difficulty || "MEDIUM",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  };
                  quizQuestions.set(qId, qObj);
                  createdQuestions.push(qObj);
                });
              }

              return { ...qz, questions: createdQuestions };
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
import { QuizOutputValidator } from "../packages/ai/src/validation/quizOutputValidator";

describe("Quiz Generation Foundation", () => {
  let authCookie: string;
  let testClassId: string;
  let otherTeacherCookie: string;

  beforeAll(async () => {
    setAIProvider(new MockAIProvider());

    const signupRes = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        email: "quiz.teacher@example.com",
        password: "Password123!",
      });
    expect(signupRes.status).toBe(201);
    authCookie = signupRes.headers["set-cookie"][0].split(";")[0];

    await request(app)
      .post("/api/v1/teacher/profile")
      .set("Cookie", authCookie)
      .send({
        displayName: "Math & Science Teacher",
        teachingRole: "Middle School Teacher",
        subjects: ["Science", "Mathematics"],
        curriculumBoard: "CBSE",
        experienceLevel: "5+ years",
      });

    const classRes = await request(app)
      .post("/api/v1/classes")
      .set("Cookie", authCookie)
      .send({
        name: "Grade 8 Science",
        grade: "8",
        section: "B",
        curriculumBoard: "CBSE",
      });
    testClassId = classRes.body.class.id;

    // Second teacher for isolation tests
    const signup2 = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        email: "other.quiz.teacher@example.com",
        password: "Password123!",
      });
    otherTeacherCookie = signup2.headers["set-cookie"][0].split(";")[0];
  });

  afterAll(() => {
    setAIProvider(new MockAIProvider());
  });

  it("fails to generate quiz if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/v1/quizzes/generate")
      .set("Cookie", authCookie)
      .send({
        classId: testClassId,
        subject: "",
        topic: "",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("enforces question count bounds (1-30)", async () => {
    const resUnder = await request(app)
      .post("/api/v1/quizzes/generate")
      .set("Cookie", authCookie)
      .send({
        classId: testClassId,
        subject: "Science",
        topic: "Cells",
        questionCount: 0,
      });
    expect(resUnder.status).toBe(400);

    const resOver = await request(app)
      .post("/api/v1/quizzes/generate")
      .set("Cookie", authCookie)
      .send({
        classId: testClassId,
        subject: "Science",
        topic: "Cells",
        questionCount: 31,
      });
    expect(resOver.status).toBe(400);
  });

  it("fails if attempting to generate quiz for another teacher's class", async () => {
    const res = await request(app)
      .post("/api/v1/quizzes/generate")
      .set("Cookie", otherTeacherCookie)
      .send({
        classId: testClassId,
        subject: "Science",
        topic: "Cells",
      });

    expect(res.status).toBe(404);
  });

  it("successfully generates and persists a quiz with structured questions and authoritative marks", async () => {
    const res = await request(app)
      .post("/api/v1/quizzes/generate")
      .set("Cookie", authCookie)
      .send({
        classId: testClassId,
        subject: "Science",
        topic: "Cell Structure",
        difficulty: "MEDIUM",
        questionCount: 4,
        questionTypes: ["MULTIPLE_CHOICE", "TRUE_FALSE", "FILL_IN_THE_BLANK", "SHORT_ANSWER"],
        durationMinutes: 25,
      });

    expect(res.status).toBe(201);
    expect(res.body.quiz).toBeDefined();
    expect(res.body.quiz.title).toContain("Cell Structure");
    expect(res.body.quiz.questions).toHaveLength(4);
    expect(res.body.quiz.durationMinutes).toBe(25);
    expect(res.body.quiz.totalMarks).toBe(5); // 1 (MCQ) + 1 (TF) + 1 (FITB) + 2 (ShortAnswer) = 5
    expect(res.body.quiz.status).toBe("DRAFT");
    expect(res.body.quiz.generationRequestId).toBeDefined();

    // Verify questions format
    const mcq = res.body.quiz.questions.find((q: any) => q.type === "MULTIPLE_CHOICE");
    expect(mcq).toBeDefined();
    expect(mcq.options).toHaveLength(4);
    expect(mcq.options).toContain(mcq.correctAnswer);
    expect(mcq.explanation).toBeTruthy();

    const tf = res.body.quiz.questions.find((q: any) => q.type === "TRUE_FALSE");
    expect(tf).toBeDefined();
    expect(["True", "False"]).toContain(tf.correctAnswer);
  });

  it("strictly enforces server-authoritative scoring when AI returns incorrect totalMarks", async () => {
    // Provider hallucinating totalMarks = 100 while questions sum to 4
    const hallucinatingProvider: any = {
      generateQuiz: vi.fn().mockResolvedValue({
        rawOutput: JSON.stringify({
          title: "Hallucinated Total Quiz",
          subject: "Science",
          topic: "Optics",
          difficulty: "MEDIUM",
          durationMinutes: 20,
          totalMarks: 100, // HALLUCINATED!
          questions: [
            {
              position: 1,
              type: "MULTIPLE_CHOICE",
              question: "What is light reflection?",
              options: ["Bouncing back", "Passing through", "Absorption", "Diffraction"],
              correctAnswer: "Bouncing back",
              explanation: "Reflection is the bouncing back of light.",
              marks: 1,
              difficulty: "EASY",
            },
            {
              position: 2,
              type: "SHORT_ANSWER",
              question: "Explain Snell's law briefly.",
              options: [],
              correctAnswer: "Ratio of sines of incidence and refraction angles is constant.",
              explanation: "Fundamental refraction law.",
              marks: 2,
              difficulty: "HARD",
            },
            {
              position: 3,
              type: "TRUE_FALSE",
              question: "Light travels in a straight line.",
              options: ["True", "False"],
              correctAnswer: "True",
              explanation: "Rectilinear propagation of light.",
              marks: 1,
              difficulty: "EASY",
            },
          ],
        }),
        parsedContent: {
          title: "Hallucinated Total Quiz",
          subject: "Science",
          topic: "Optics",
          difficulty: "MEDIUM",
          durationMinutes: 20,
          totalMarks: 100, // HALLUCINATED!
          questions: [
            {
              position: 1,
              type: "MULTIPLE_CHOICE",
              question: "What is light reflection?",
              options: ["Bouncing back", "Passing through", "Absorption", "Diffraction"],
              correctAnswer: "Bouncing back",
              explanation: "Reflection is the bouncing back of light.",
              marks: 1,
              difficulty: "EASY",
            },
            {
              position: 2,
              type: "SHORT_ANSWER",
              question: "Explain Snell's law briefly.",
              options: [],
              correctAnswer: "Ratio of sines of incidence and refraction angles is constant.",
              explanation: "Fundamental refraction law.",
              marks: 2,
              difficulty: "HARD",
            },
            {
              position: 3,
              type: "TRUE_FALSE",
              question: "Light travels in a straight line.",
              options: ["True", "False"],
              correctAnswer: "True",
              explanation: "Rectilinear propagation of light.",
              marks: 1,
              difficulty: "EASY",
            },
          ],
        },
        provider: "MOCK",
        model: "mock-pedagogy-v1",
        promptVersion: "quiz/generate.v1",
        latencyMs: 25,
        inputTokens: 200,
        outputTokens: 300,
        estimatedCost: 0.001,
      }),
    };
    setAIProvider(hallucinatingProvider);

    const res = await request(app)
      .post("/api/v1/quizzes/generate")
      .set("Cookie", authCookie)
      .send({
        classId: testClassId,
        subject: "Science",
        topic: "Optics",
      });

    expect(res.status).toBe(201);
    // Persisted totalMarks MUST BE 1 + 2 + 1 = 4, NOT 100!
    expect(res.body.quiz.totalMarks).toBe(4);

    // Reset back to normal mock provider
    setAIProvider(new MockAIProvider());
  });

  it("lists quizzes owned by authenticated teacher", async () => {
    const res = await request(app)
      .get("/api/v1/quizzes")
      .set("Cookie", authCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.quizzes)).toBe(true);
    expect(res.body.quizzes.length).toBeGreaterThanOrEqual(1);
  });

  it("gets quiz by ID and blocks cross-teacher access", async () => {
    const listRes = await request(app)
      .get("/api/v1/quizzes")
      .set("Cookie", authCookie);
    const quizId = listRes.body.quizzes[0].id;

    // Authorized
    const authGet = await request(app)
      .get(`/api/v1/quizzes/${quizId}`)
      .set("Cookie", authCookie);
    expect(authGet.status).toBe(200);
    expect(authGet.body.quiz.id).toBe(quizId);

    // Cross-teacher unauthorized
    const unauthGet = await request(app)
      .get(`/api/v1/quizzes/${quizId}`)
      .set("Cookie", otherTeacherCookie);
    expect(unauthGet.status).toBe(404);
  });

  it("updates quiz details, questions, and recalculates total marks", async () => {
    const listRes = await request(app)
      .get("/api/v1/quizzes")
      .set("Cookie", authCookie);
    const quizId = listRes.body.quizzes[0].id;

    const res = await request(app)
      .patch(`/api/v1/quizzes/${quizId}`)
      .set("Cookie", authCookie)
      .send({
        title: "Updated Optics Quiz",
        durationMinutes: 30,
        status: "SAVED",
        questions: [
          {
            position: 1,
            type: "SHORT_ANSWER",
            question: "State the law of reflection.",
            options: [],
            correctAnswer: "Angle of incidence equals angle of reflection.",
            explanation: "i = r",
            marks: 3,
            difficulty: "MEDIUM",
          },
          {
            position: 2,
            type: "TRUE_FALSE",
            question: "Virtual images can be caught on screen.",
            options: ["True", "False"],
            correctAnswer: "False",
            explanation: "Only real images can be projected on a screen.",
            marks: 2,
            difficulty: "EASY",
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.quiz.title).toBe("Updated Optics Quiz");
    expect(res.body.quiz.status).toBe("SAVED");
    expect(res.body.quiz.durationMinutes).toBe(30);
    expect(res.body.quiz.questions).toHaveLength(2);
    // Recalculated totalMarks = 3 + 2 = 5
    expect(res.body.quiz.totalMarks).toBe(5);
  });

  it("prevents another teacher from updating or archiving a quiz", async () => {
    const listRes = await request(app)
      .get("/api/v1/quizzes")
      .set("Cookie", authCookie);
    const quizId = listRes.body.quizzes[0].id;

    const patchRes = await request(app)
      .patch(`/api/v1/quizzes/${quizId}`)
      .set("Cookie", otherTeacherCookie)
      .send({ title: "Hacked title" });
    expect(patchRes.status).toBe(404);

    const archiveRes = await request(app)
      .post(`/api/v1/quizzes/${quizId}/archive`)
      .set("Cookie", otherTeacherCookie);
    expect(archiveRes.status).toBe(404);
  });

  it("archives quiz successfully", async () => {
    const listRes = await request(app)
      .get("/api/v1/quizzes")
      .set("Cookie", authCookie);
    const quizId = listRes.body.quizzes[0].id;

    const res = await request(app)
      .post(`/api/v1/quizzes/${quizId}/archive`)
      .set("Cookie", authCookie);

    expect(res.status).toBe(200);
    expect(res.body.quiz.status).toBe("ARCHIVED");
    expect(res.body.quiz.archivedAt).not.toBeNull();
  });

  it("validates answer consistency in QuizOutputValidator", () => {
    // Valid content
    const valid = QuizOutputValidator.checkAnswerConsistency({
      title: "Sample",
      subject: "Science",
      topic: "Topic",
      difficulty: "MEDIUM",
      durationMinutes: 20,
      totalMarks: 2,
      questions: [
        {
          position: 1,
          type: "MULTIPLE_CHOICE",
          question: "Question 1",
          options: ["A", "B", "C", "D"],
          correctAnswer: "B",
          marks: 1,
          difficulty: "MEDIUM",
        },
        {
          position: 2,
          type: "TRUE_FALSE",
          question: "Question 2",
          options: ["True", "False"],
          correctAnswer: "True",
          marks: 1,
          difficulty: "EASY",
        },
      ],
    });
    expect(valid.isValid).toBe(true);

    // Invalid MCQ answer not in options
    const invalidMCQ = QuizOutputValidator.checkAnswerConsistency({
      title: "Sample",
      subject: "Science",
      topic: "Topic",
      difficulty: "MEDIUM",
      durationMinutes: 20,
      totalMarks: 1,
      questions: [
        {
          position: 1,
          type: "MULTIPLE_CHOICE",
          question: "Question 1",
          options: ["Apple", "Banana", "Cherry", "Date"],
          correctAnswer: "Grape", // NOT IN OPTIONS!
          marks: 1,
          difficulty: "MEDIUM",
        },
      ],
    });
    expect(invalidMCQ.isValid).toBe(false);
    expect(invalidMCQ.errors[0]).toContain("not present in options");

    // Invalid True/False answer
    const invalidTF = QuizOutputValidator.checkAnswerConsistency({
      title: "Sample",
      subject: "Science",
      topic: "Topic",
      difficulty: "MEDIUM",
      durationMinutes: 20,
      totalMarks: 1,
      questions: [
        {
          position: 1,
          type: "TRUE_FALSE",
          question: "Question 1",
          options: ["True", "False"],
          correctAnswer: "Maybe",
          marks: 1,
          difficulty: "EASY",
        },
      ],
    });
    expect(invalidTF.isValid).toBe(false);
    expect(invalidTF.errors[0]).toContain("must be \"True\" or \"False\"");
  });

  it("handles AI provider failure gracefully", async () => {
    const failingProvider: any = {
      generateQuiz: vi.fn().mockRejectedValue(new Error("Network timeout from AI")),
      generateLesson: vi.fn(),
      generateWorksheet: vi.fn(),
    };
    setAIProvider(failingProvider);

    const res = await request(app)
      .post("/api/v1/quizzes/generate")
      .set("Cookie", authCookie)
      .send({
        classId: testClassId,
        subject: "Science",
        topic: "Failing Quiz Topic",
      });

    expect(res.status).toBe(502);
    expect(res.body.error).toContain("AI provider failed");
  });

  it("handles safety violation during generation", async () => {
    const unsafeProvider: any = {
      generateQuiz: vi.fn().mockResolvedValue({
        rawOutput: JSON.stringify({
          title: "Dangerous Quiz",
          subject: "Science",
          topic: "Explosive weapons",
          difficulty: "HARD",
          durationMinutes: 20,
          totalMarks: 2,
          questions: [
            {
              position: 1,
              type: "SHORT_ANSWER",
              question: "How to assemble a bomb weapon?",
              options: [],
              correctAnswer: "Explosive components",
              explanation: "Unsafe",
              marks: 2,
              difficulty: "HARD",
            },
          ],
        }),
        parsedContent: {
          title: "Dangerous Quiz",
          subject: "Science",
          topic: "Explosive weapons",
          difficulty: "HARD",
          durationMinutes: 20,
          totalMarks: 2,
          questions: [
            {
              position: 1,
              type: "SHORT_ANSWER",
              question: "How to assemble a bomb weapon?",
              options: [],
              correctAnswer: "Explosive components",
              explanation: "Unsafe",
              marks: 2,
              difficulty: "HARD",
            },
          ],
        },
        provider: "MOCK",
        model: "mock-pedagogy-v1",
        promptVersion: "quiz/generate.v1",
        latencyMs: 20,
        inputTokens: 100,
        outputTokens: 100,
        estimatedCost: 0.001,
      }),
      generateLesson: vi.fn(),
      generateWorksheet: vi.fn(),
    };
    setAIProvider(unsafeProvider);

    const res = await request(app)
      .post("/api/v1/quizzes/generate")
      .set("Cookie", authCookie)
      .send({
        classId: testClassId,
        subject: "Science",
        topic: "Explosive weapons",
      });

    expect(res.status).toBe(502);
    expect(res.body.error).toContain("Safety violation detected");
  });

  it("handles educational quality violation during quiz generation", async () => {
    const poorQualityProvider: any = {
      generateQuiz: vi.fn().mockResolvedValue({
        rawOutput: JSON.stringify({
          title: "Empty Quiz",
          subject: "Science",
          topic: "Empty",
          difficulty: "EASY",
          durationMinutes: 20,
          totalMarks: 0,
          questions: [],
        }),
        parsedContent: {
          title: "Empty Quiz",
          subject: "Science",
          topic: "Empty",
          difficulty: "EASY",
          durationMinutes: 20,
          totalMarks: 0,
          questions: [],
        },
        provider: "MOCK",
        model: "mock-pedagogy-v1",
        promptVersion: "quiz/generate.v1",
        latencyMs: 20,
        inputTokens: 100,
        outputTokens: 100,
        estimatedCost: 0.001,
      }),
      generateLesson: vi.fn(),
      generateWorksheet: vi.fn(),
    };
    setAIProvider(poorQualityProvider);

    const res = await request(app)
      .post("/api/v1/quizzes/generate")
      .set("Cookie", authCookie)
      .send({
        classId: testClassId,
        subject: "Science",
        topic: "Poor Quality Topic",
      });

    expect(res.status).toBe(502);
  });
});
