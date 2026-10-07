import { create } from "zustand";
import { type AuthUser, type TeacherProfileDTO, type AuthMeResponse } from "@teacher-ai/contracts";
import { apiClient } from "../api/client";

interface AuthState {
  user: AuthUser | null;
  profile: TeacherProfileDTO | null;
  hasCompletedOnboarding: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  setProfile: (profile: TeacherProfileDTO) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  hasCompletedOnboarding: false,
  isAuthenticated: false,
  isLoading: true,
  checkAuth: async () => {
    try {
      const res = await apiClient.get<AuthMeResponse>("/auth/me");
      set({
        user: res.data.user,
        profile: res.data.profile,
        hasCompletedOnboarding: res.data.hasCompletedOnboarding,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({
        user: null,
        profile: null,
        hasCompletedOnboarding: false,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
  setProfile: (profile: TeacherProfileDTO) => {
    set({ profile, hasCompletedOnboarding: true });
  },
  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
      set({
        user: null,
        profile: null,
        hasCompletedOnboarding: false,
        isAuthenticated: false,
      });
    } catch (e) {
      console.error("Logout failed", e);
    }
  },
}));

