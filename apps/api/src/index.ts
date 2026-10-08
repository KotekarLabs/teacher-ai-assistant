import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import teacherRoutes from "./routes/teacher.routes";
import classRoutes from "./routes/class.routes";
import { lessonRouter } from "./routes/lesson.routes";
import { worksheetRouter } from "./routes/worksheet.routes";
import { quizRouter } from "./routes/quiz.routes";
import { homeworkRouter } from "./routes/homework.routes";
import { contentRouter } from "./routes/content.routes";
import { config } from "./utils/config";

const app = express();

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    exposedHeaders: ["Content-Disposition"],
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/classes", classRoutes);
app.use("/api/v1/lessons", lessonRouter);
app.use("/api/v1/worksheets", worksheetRouter);
app.use("/api/v1/quizzes", quizRouter);
app.use("/api/v1/homeworks", homeworkRouter);
app.use("/api/v1/content", contentRouter);


app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok" });
});

// Generic error handler
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  },
);

if (process.env.NODE_ENV !== "test") {
  app.listen(3000, () => console.log("API running on port 3000"));
}

export default app;
