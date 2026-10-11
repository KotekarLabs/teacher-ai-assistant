import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginRequest } from "@teacher-ai/contracts";
import { apiClient } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export default function Login() {
  const navigate = useNavigate();
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      setError("");
      await apiClient.post("/auth/login", data);
      await checkAuth();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFCF9] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 selection:bg-violet-100 selection:text-violet-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-violet-500/20 mb-3 select-none">
            T
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-200/60">
            Educator Workspace
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-2">
            Teacher AI Assistant
          </h2>
        </div>

        {/* Auth Card */}
        <Card elevated className="p-6 sm:p-8 bg-white border border-slate-200/80 shadow-md">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Login</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Welcome back. Enter your credentials to access your personalized classroom workspace.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5"
            >
              <svg
                className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4.5"
            data-testid="login-form"
            noValidate
          >
            <div>
              <Input
                label="Email"
                type="email"
                placeholder="Email"
                autoComplete="email"
                disabled={isSubmitting}
                error={errors.email?.message}
                className="min-h-[44px]"
                {...register("email")}
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                disabled={isSubmitting}
                error={errors.password?.message}
                className="min-h-[44px]"
                {...register("password")}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="ai"
                size="md"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="w-full min-h-[44px] text-sm font-semibold shadow-xs"
              >
                Login
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center min-h-[44px] px-3 text-xs sm:text-sm font-medium text-violet-700 hover:text-violet-800 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-lg"
            >
              Need an account? Sign up
            </Link>
          </div>
        </Card>

        {/* Simple Footer Note */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Teacher AI Assistant &bull; Secure Monolith Architecture
        </p>
      </div>
    </main>
  );
}
