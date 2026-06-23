import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { CommissionsListPage } from "./pages/CommissionsListPage";
import { CommissionDetailPage } from "./pages/CommissionDetailPage";
import { CreateCommissionPage } from "./pages/CreateCommissionPage";
import { ClientsPage } from "./pages/ClientsPage";
import { CommissionTypesPage } from "./pages/CommissionTypesPage";
import { TagsPage } from "./pages/TagsPage";
import { ClientCommissionsListPage } from "./pages/ClientCommissionsListPage";
import { ClientCommissionDetailPage } from "./pages/ClientCommissionDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/signup"       element={<SignupPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Artist-only */}
          <Route element={<ProtectedRoute requiredRole="ARTIST" />}>
            <Route path="/commissions"        element={<CommissionsListPage />} />
            <Route path="/commissions/new"    element={<CreateCommissionPage />} />
            <Route path="/commissions/:id"    element={<CommissionDetailPage />} />
            <Route path="/clients"            element={<ClientsPage />} />
            <Route path="/commission-types"   element={<CommissionTypesPage />} />
            <Route path="/tags"               element={<TagsPage />} />
          </Route>

          {/* Client-only */}
          <Route element={<ProtectedRoute requiredRole="CLIENT" />}>
            <Route path="/my-commissions"      element={<ClientCommissionsListPage />} />
            <Route path="/my-commissions/:id"  element={<ClientCommissionDetailPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
