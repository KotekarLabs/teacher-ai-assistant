import request from "supertest";
import app from "../apps/api/src/index";
import { AuthService } from "../apps/api/src/services/auth.service";

async function main() {
  console.log("=== 1. UNAUTHENTICATED REQUEST EVIDENCE ===");
  const unauthRes = await request(app).get("/api/v1/curriculum/presets");
  console.log(`HTTP Status: ${unauthRes.status} ${unauthRes.statusCode === 401 ? "Unauthorized" : ""}`);
  console.log("Headers:", JSON.stringify(unauthRes.headers, null, 2));
  console.log("Body:", JSON.stringify(unauthRes.body, null, 2));

  console.log("\n=== 2. AUTHENTICATED REQUEST EVIDENCE ===");
  const token = AuthService.generateToken("teacher-evidence-uuid-1");
  const authRes = await request(app)
    .get("/api/v1/curriculum/presets")
    .set("Cookie", `token=${token}`);

  console.log(`HTTP Status: ${authRes.status} ${authRes.statusCode === 200 ? "OK" : ""}`);
  console.log("Headers:", JSON.stringify({
    "content-type": authRes.headers["content-type"],
    "access-control-allow-credentials": authRes.headers["access-control-allow-credentials"],
  }, null, 2));
  console.log("Body:", JSON.stringify(authRes.body, null, 2));
}

main().catch(console.error);
