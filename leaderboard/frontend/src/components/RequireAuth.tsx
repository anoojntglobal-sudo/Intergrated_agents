import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function RequireAuth() {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RequireAdmin() {
  const { token, isAdmin } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
