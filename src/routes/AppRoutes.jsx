import { Routes, Route } from "react-router-dom";

// ==================== AUTH ====================
import Login from "../pages/Login";

// ==================== LAYOUT ====================
import AdminLayout from "../layouts/AdminLayout/AdminLayout";

// ==================== GUARDS ====================
import ProtectedRoute, { RoleGuard } from "../components/ProtectedRoute";

// ==================== COMMON ====================
import NotFound from "../pages/NotFound";
import ProfilePage from "../pages/ProfilePage";

// ==================== PARISH ADMIN ====================
import Dashboard from "../pages/Dashboard";
import PrayerManager from "../pages/PrayerManager";
import SlideManager from "../pages/SlideManager";
import EventAdmin from "../pages/EventAdmin";
import AdminScheduleCalendar from "../pages/AdminScheduleCalendar";
import ChurchPage from "../pages/ChurchPage";
import GroupPage from "../pages/GroupsPage";
import AdminManager from "../pages/AdminManager";
import ActivityLogsPage from "../pages/ActivityLogsPage";
import SettingsPage from "../pages/SettingsPage";
import Gallery from "../pages/Gallery";
import ParishionerList from "../pages/ParishionerList";
import ExamManagementPage from "../pages/ExamManagementPage";
import RagTrainingPage from "../pages/RagTrainingPage";
import VisitorAnalytics from "../pages/VisitorAnalytics";
import DocumentsPage from "../pages/DocumentPage";
import NotificationManagementPage from "../pages/NotificationManagementPage";
import ReportDashboard from "../pages/ReportDashboard";
import SacramentPage from "../pages/SacramentPage";
import MediaManager from "../pages/MediaManager";
import ContactPage from "../pages/ContactPage";
import StudentsPage from "../pages/StudentsPage";
import DailyVerseAdmin from "../pages/admin/DailyVerseAdmin";

// ==================== CERTIFICATE ====================
import CertificatePage from "../components/CertificatePage";
import VerifyCertificate from "../components/VerifyCertificate";

// ============================================================
// ROLES
// ============================================================

// Các role có quyền truy cập hệ thống quản trị Giáo xứ
const PARISH_ADMIN_ROLES = [
  "admin",
  "priest",
  "liturgy_manager",
  "media_manager",
];

export default function AppRoutes() {
  return (
    <Routes>
      {/* ======================================================
          PUBLIC ROUTES
      ====================================================== */}

      {/* Đăng nhập hệ thống Giáo xứ */}

      <Route path="/" element={<Login />} />
      {/* ------------------------------------------------------
          Xác thực chứng chỉ - Public
          ------------------------------------------------------ */}
      <Route path="/xac-thuc" element={<VerifyCertificate />} />

      {/* ======================================================
          PARISH ADMIN SYSTEM
      ====================================================== */}

      <Route element={<ProtectedRoute loginPath="/giao-xu/login" />}>
        <Route element={<RoleGuard allowedRoles={PARISH_ADMIN_ROLES} />}>
          <Route element={<AdminLayout />}>
            {/* --------------------------------------------------
                Dashboard
                -------------------------------------------------- */}
            <Route path="/giao-xu" element={<Dashboard />} />

            {/* --------------------------------------------------
                Prayer
                -------------------------------------------------- */}
            <Route path="/prayers" element={<PrayerManager />} />

            {/* --------------------------------------------------
                Admin management
                -------------------------------------------------- */}
            <Route path="/admins" element={<AdminManager />} />

            {/* --------------------------------------------------
                Website content
                -------------------------------------------------- */}
            <Route path="/slides" element={<SlideManager />} />

            <Route path="/news" element={<EventAdmin />} />

            <Route path="/gallery" element={<Gallery />} />

            <Route path="/media-library" element={<MediaManager />} />

            {/* --------------------------------------------------
                Parish
                -------------------------------------------------- */}
            <Route path="/quan-ly" element={<ChurchPage />} />

            <Route path="/doan-the" element={<GroupPage />} />

            <Route path="/parishioners" element={<ParishionerList />} />

            {/* --------------------------------------------------
                Sacraments
                -------------------------------------------------- */}
            <Route path="/sacraments" element={<SacramentPage />} />

            <Route path="/certificates" element={<CertificatePage />} />

            {/* --------------------------------------------------
                Catechism / Students
                -------------------------------------------------- */}
            <Route path="/marriage-students" element={<StudentsPage />} />

            <Route path="/exam-prayer" element={<ExamManagementPage />} />

            {/* --------------------------------------------------
                Liturgical calendar
                -------------------------------------------------- */}
            <Route path="/lich-phung-vu" element={<AdminScheduleCalendar />} />

            {/* --------------------------------------------------
                Notifications
                -------------------------------------------------- */}
            <Route
              path="/announcements"
              element={<NotificationManagementPage />}
            />

            {/* --------------------------------------------------
                Documents
                -------------------------------------------------- */}
            <Route path="/documents" element={<DocumentsPage />} />

            {/* --------------------------------------------------
                Reports / statistics
                -------------------------------------------------- */}
            <Route path="/reports" element={<ReportDashboard />} />

            <Route path="/statistics" element={<VisitorAnalytics />} />

            {/* --------------------------------------------------
                Daily verse
                -------------------------------------------------- */}
            <Route path="/dailyverse" element={<DailyVerseAdmin />} />

            {/* --------------------------------------------------
                RAG
                -------------------------------------------------- */}
            <Route path="/rag" element={<RagTrainingPage />} />

            {/* --------------------------------------------------
                Feedback
                -------------------------------------------------- */}
            <Route path="/feedbacks" element={<ContactPage />} />

            {/* --------------------------------------------------
                Activity logs
                -------------------------------------------------- */}
            <Route path="/activity-logs" element={<ActivityLogsPage />} />

            {/* --------------------------------------------------
                Settings
                -------------------------------------------------- */}
            <Route path="/settings" element={<SettingsPage />} />

            {/* --------------------------------------------------
                Profile
                -------------------------------------------------- */}
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>

      {/* ======================================================
          FALLBACK
      ====================================================== */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
