import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import Home from "./pages/Home.jsx";
import { isAdminAuthed } from "./admin/auth.js";
import { ROUTES } from "./constants.js";

function RequireAdmin({ children }) {
  const location = useLocation();
  if (!isAdminAuthed()) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} state={{ from: location }} replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
