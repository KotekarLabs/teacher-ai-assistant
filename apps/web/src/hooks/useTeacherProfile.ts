import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTeacherProfile, updateTeacherProfile } from "../api/teacher.api";
import { useAuthStore } from "../store/authStore";
import type {
  UpdateTeacherProfileRequest,
  TeacherProfileDTO,
} from "@teacher-ai/contracts";

export const TEACHER_PROFILE_QUERY_KEY = ["teacher", "profile"] as const;

export function useTeacherProfile() {
  const profileInStore = useAuthStore((s) => s.profile);

  return useQuery({
    queryKey: TEACHER_PROFILE_QUERY_KEY,
    queryFn: async () => {
      const response = await getTeacherProfile();
      // Keep authStore in sync when fetched directly from the backend
      if (response?.profile) {
        useAuthStore.getState().setProfile(response.profile);
      }
      return response.profile;
    },
    // Use stored profile as initial data if available for immediate responsiveness
    initialData: profileInStore || undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useUpdateTeacherProfile() {
  const queryClient = useQueryClient();
  const setProfile = useAuthStore((s) => s.setProfile);

  return useMutation({
    mutationFn: async (data: UpdateTeacherProfileRequest) => {
      const response = await updateTeacherProfile(data);
      return response.profile;
    },
    onSuccess: (updatedProfile: TeacherProfileDTO) => {
      // 1. Update TanStack Query cache
      queryClient.setQueryData(TEACHER_PROFILE_QUERY_KEY, updatedProfile);
      queryClient.invalidateQueries({ queryKey: TEACHER_PROFILE_QUERY_KEY });

      // 2. Update authStore
      setProfile(updatedProfile);
    },
  });
}
