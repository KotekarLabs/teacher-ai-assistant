import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginRequest } from "@teacher-ai/contracts";
import { apiClient } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
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
    <div className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-64"
        data-testid="login-form"
      >
        <div>
          <input
            {...register("email")}
            placeholder="Email"
            className="border p-2 w-full"
            type="email"
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email.message}</span>
          )}
        </div>
        <div>
          <input
            {...register("password")}
            placeholder="Password"
            className="border p-2 w-full"
            type="password"
          />
          {errors.password && (
            <span className="text-red-500 text-sm">
              {errors.password.message}
            </span>
          )}
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Login
        </button>
      </form>
      <Link to="/signup" className="mt-4 text-blue-500">
        Need an account? Sign up
      </Link>
    </div>
  );
}
