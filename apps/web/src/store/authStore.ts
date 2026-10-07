import { create } from "zustand";
import { type AuthUser } from "@teacher-ai/contracts";
import { apiClient } from "../api/client";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  checkAuth: async () => {
    try {
      const res = await apiClient.get("/auth/me");
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
      set({ user: null, isAuthenticated: false });
    } catch (e) {
      console.error("Logout failed", e);
    }
  },
}));
