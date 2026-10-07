export const config = {
  jwtSecret: process.env.JWT_SECRET || "fallback-secret-for-dev",
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};
