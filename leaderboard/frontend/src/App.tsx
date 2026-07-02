import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import { RequireAuth } from "./components/RequireAuth";
import Login from "./pages/Login";
import Home from "./pages/Home";
import DomainPage from "./pages/DomainPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ComparePage from "./pages/ComparePage";
import SearchPage from "./pages/SearchPage";
import AdminPage from "./pages/AdminPage";
import AdminDomainPage from "./pages/AdminDomainPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Authenticated — login once, access everything */}
        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/domain/:slug" element={<DomainPage />} />
            <Route path="/leaderboard/:id" element={<LeaderboardPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/domain/:slug" element={<AdminDomainPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
