export const config = {
  jwtSecret: process.env.JWT_SECRET || "fallback-secret-for-dev",
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  aiProvider: process.env.AI_PROVIDER || "MOCK",
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
};
