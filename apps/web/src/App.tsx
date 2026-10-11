import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./store/authStore";
import { ProtectedRoute, OnboardingRoute } from "./components/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import CreateClass from "./pages/CreateClass";
import ClassDetails from "./pages/ClassDetails";
import EditClass from "./pages/EditClass";
import { CreateLesson } from "./pages/CreateLesson";
import { LessonDetails } from "./pages/LessonDetails";
import { EditLesson } from "./pages/EditLesson";
import { CreateWorksheet } from "./pages/CreateWorksheet";
import { WorksheetDetails } from "./pages/WorksheetDetails";
import { EditWorksheet } from "./pages/EditWorksheet";
import { CreateQuiz } from "./pages/CreateQuiz";
import { QuizDetails } from "./pages/QuizDetails";
import { EditQuiz } from "./pages/EditQuiz";
import { CreateHomework } from "./pages/CreateHomework";
import { HomeworkDetails } from "./pages/HomeworkDetails";
import { EditHomework } from "./pages/EditHomework";
import Library from "./pages/Library";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

export default function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) return <div>Loading Application...</div>;

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<OnboardingRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/library" element={<Library />} />
              <Route path="/classes" element={<Classes />} />

              <Route path="/classes/new" element={<CreateClass />} />
              <Route path="/classes/:classId" element={<ClassDetails />} />
              <Route path="/classes/:classId/edit" element={<EditClass />} />
              <Route path="/create/lesson" element={<CreateLesson />} />
              <Route path="/lessons/:lessonId" element={<LessonDetails />} />
              <Route path="/lessons/:lessonId/edit" element={<EditLesson />} />
              <Route path="/create/worksheet" element={<CreateWorksheet />} />
              <Route
                path="/worksheets/:worksheetId"
                element={<WorksheetDetails />}
              />
              <Route
                path="/worksheets/:worksheetId/edit"
                element={<EditWorksheet />}
              />
              <Route path="/create/quiz" element={<CreateQuiz />} />
              <Route path="/quizzes/:quizId" element={<QuizDetails />} />
              <Route path="/quizzes/:quizId/edit" element={<EditQuiz />} />
              <Route path="/create/homework" element={<CreateHomework />} />
              <Route
                path="/homeworks/:homeworkId"
                element={<HomeworkDetails />}
              />
              <Route
                path="/homeworks/:homeworkId/edit"
                element={<EditHomework />}
              />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
