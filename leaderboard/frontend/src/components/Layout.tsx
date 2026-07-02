import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import BackendWakeup from "./BackendWakeup";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#0c0c14] text-gray-100">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-6 sticky top-0 z-50">
        <Link to="/" className="text-lg font-bold text-indigo-400 tracking-tight">
          AI Leaderboard Agent
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <Link to="/compare" className="text-sm font-medium text-cyan-400 hover:text-cyan-300 border border-cyan-800 px-3 py-1 rounded-lg transition-colors">
            Compare
          </Link>
          <Link to="/admin" className="text-sm font-medium text-amber-400 hover:text-amber-300 border border-amber-800 px-3 py-1 rounded-lg transition-colors">
            Admin
          </Link>
          <span className="text-xs text-gray-600">{user?.username}</span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-500 hover:text-gray-300 border border-gray-700 px-3 py-1 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>
      <BackendWakeup />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
