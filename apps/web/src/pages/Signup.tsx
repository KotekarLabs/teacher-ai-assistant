import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupSchema, type SignupRequest } from "@teacher-ai/contracts";
import { apiClient } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

export default function Signup() {
  const navigate = useNavigate();
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupRequest>({
    resolver: zodResolver(SignupSchema),
  });

  const onSubmit = async (data: SignupRequest) => {
    try {
      setError("");
      await apiClient.post("/auth/signup", data);
      await checkAuth();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-64"
        data-testid="signup-form"
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
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Sign Up
        </button>
      </form>
      <Link to="/login" className="mt-4 text-blue-500">
        Already have an account? Login
      </Link>
    </div>
  );
}
