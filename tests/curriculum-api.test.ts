import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../apps/api/src/index";
import { AuthService } from "../apps/api/src/services/auth.service";

describe("Curriculum Presets API Integration Suite", () => {
  const mockTeacher = {
    id: "teacher-curriculum-uuid-1",
    email: "curriculum.teacher@school.edu",
  };

  it("should reject unauthenticated requests with 401", async () => {
    const res = await request(app).get("/api/v1/curriculum/presets");
    console.log("=== ACTUAL UNAUTHENTICATED HTTP RESPONSE ===");
    console.log("HTTP Status:", res.status);
    console.log("Body:", JSON.stringify(res.body, null, 2));
    expect(res.status).toBe(401);
  });

  it("should return verified presets list when authenticated", async () => {
    const validToken = AuthService.generateToken(mockTeacher.id);
    vi.spyOn(AuthService, "findUserById").mockResolvedValue(mockTeacher as any);

    const res = await request(app)
      .get("/api/v1/curriculum/presets")
      .set("Cookie", `token=${validToken}`);

    console.log("\n=== ACTUAL AUTHENTICATED HTTP RESPONSE ===");
    console.log("HTTP Status:", res.status);
    console.log("Body:", JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("presets");
    expect(Array.isArray(res.body.presets)).toBe(true);

    const joyfulMath = res.body.presets.find(
      (p: any) => p.id === "JOYFUL_MATH_C1_CH2_V1",
    );
    expect(joyfulMath).toBeDefined();
    expect(joyfulMath.curriculumBoard).toBe("Karnataka State Board");
    expect(joyfulMath.grade).toBe("1");
    expect(joyfulMath.subject).toBe("Mathematics");
    expect(joyfulMath.topicName).toBe("What is Long? What is Round?");
    expect(joyfulMath.kannadaTopicName).toBe("ಯಾವುದು ಉದ್ದ? ಯಾವುದು ದುಂಡು?");

    // Textbook citation
    expect(joyfulMath.textbook.title).toContain("Joyful Mathematics");
    expect(joyfulMath.textbook.chapterNumber).toBe(2);
    expect(joyfulMath.textbook.printedPages).toBe("13–14");
    expect(joyfulMath.textbook.publisher).toContain("Karnataka Textbook Society");

    // Verification and legal disclaimer
    expect(joyfulMath.verification.status).toBe("VERIFIED");
    expect(joyfulMath.verification.disclaimer).toContain(
      "not officially published, endorsed, or approved by KTBS",
    );

    // Pedagogical constraints
    expect(joyfulMath.pedagogicalConstraints.targetAge).toBe(6);
    expect(joyfulMath.pedagogicalConstraints.format).toBe("SORTING_DIAGRAM");
    expect(joyfulMath.pedagogicalConstraints.concepts).toEqual([
      "Long vs Round",
      "Rolling vs Sliding",
      "Multi-perspective viewing",
    ]);
  });
});
