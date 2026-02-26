import { Routes, Route } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/home";
import DashboardPage from "./pages/dashboard";
import CompanionPage from "./pages/companion";
import VirtualCallPage from "./pages/call";
import PatientSetupPage from "./pages/patient-setup";
import ApiDocsPage from "./pages/api-docs";
import AdminPage from "./pages/admin";
import ApiReferencePage from "./pages/api-reference";
import NotFound from "./pages/not-found";

export default function App() {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="/companion/:patientId" element={<CompanionPage />} />
      <Route path="/call/:patientId" element={<VirtualCallPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/dashboard/patient/:patientId" element={<PatientSetupPage />} />
      <Route path="/api-docs" element={<ApiDocsPage />} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      <Route path="/api-reference" element={<ApiReferencePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
