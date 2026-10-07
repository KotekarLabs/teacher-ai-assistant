import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, profile, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard Foundation</h1>
      <p>Welcome, {profile?.displayName || user?.email}</p>
      {profile && (
        <div className="mt-2 text-sm text-slate-600">
          <p>Role: {profile.teachingRole}</p>
          <p>Board: {profile.curriculumBoard}</p>
        </div>
      )}
      <button
        onClick={handleLogout}
        className="mt-4 bg-red-500 text-white p-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
