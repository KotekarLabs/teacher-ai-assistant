import { useAuthStore } from "../store/authStore";
import { useTeacherProfile } from "../hooks/useTeacherProfile";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ProfileForm } from "../components/profile/ProfileForm";
import { Button } from "../components/ui/Button";

export default function Profile() {
  const { user } = useAuthStore();
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useTeacherProfile();

  if (isLoading && !profile) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-pulse">
        {/* Skeleton Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 mb-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-slate-200" />
          <div className="flex-1 space-y-3 w-full">
            <div className="h-6 w-48 bg-slate-200 rounded-md" />
            <div className="h-4 w-32 bg-slate-100 rounded-md" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-24 bg-slate-100 rounded-full" />
              <div className="h-6 w-24 bg-slate-100 rounded-full" />
            </div>
          </div>
        </div>

        {/* Skeleton Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <div className="h-5 w-40 bg-slate-200 rounded-md" />
          <div className="h-10 w-full bg-slate-100 rounded-lg" />
          <div className="h-10 w-full bg-slate-100 rounded-lg" />
        </div>
      </main>
    );
  }

  if (isError && !profile) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div
          role="alert"
          className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-center space-y-3 shadow-xs"
        >
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold">Failed to load teacher profile</h2>
          <p className="text-sm text-rose-700 max-w-md mx-auto">
            {error instanceof Error ? error.message : "An unexpected network error occurred."}
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => refetch()}
              className="min-h-[44px]"
            >
              Try Again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8"
      data-testid="profile-page"
    >
      {/* Page Title Context */}
      <div className="mb-5 sm:mb-6">
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex items-center space-x-2 text-xs text-slate-500">
            <li>Workspace</li>
            <li>&rsaquo;</li>
            <li className="font-semibold text-slate-800" aria-current="page">
              Teacher Profile & Pedagogical Settings
            </li>
          </ol>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Teacher Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal details, teaching specialization, curriculum standards, and instruction language.
        </p>
      </div>

      {/* Profile Header Summary */}
      <ProfileHeader profile={profile || null} email={user?.email} />

      {/* Profile Form */}
      {profile && <ProfileForm initialProfile={profile} />}
    </main>
  );
}
