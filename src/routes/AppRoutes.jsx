import { Routes, Route } from "react-router-dom";

// ==================== AUTH ====================
import Login from "../pages/Login";
import CatechistLogin from "../pages/catechist/CatechistLogin";

// ==================== LAYOUT ====================
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import CatechistLayout from "../layouts/CatechistLayout/CatechistLayout";

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
import CatechistManagement from "../pages/catechist/CatechistManagement";
import DailyVerseAdmin from "../pages/admin/DailyVerseAdmin";

// ==================== CERTIFICATE ====================
import CertificatePage from "../components/CertificatePage";
import VerifyCertificate from "../components/VerifyCertificate";

// ==================== CATECHIST ====================
import CatechistDashboard from "../pages/catechist/CatechistDashboard";
import ClassManagementDashboard from "../pages/catechist/ClassManagement";
import StudentManagement from "../pages/catechist/StudentManagement";
import GameManagementPage from "../pages/catechist/GameManagementPage";
import ResultsPage from "../pages/catechist/ResultsPage";
import LeaderboardPage from "../pages/catechist/LeaderboardPage";
import LessonQuestionManager from "../pages/LessonQuestionManager";
import ProfilePageCate from "../pages/catechist/ProfilePageCate";
import ParishSettingsPage from "../pages/catechist/ParishSettingsPage";
import AttendancePage from "../pages/catechist/AttendancePage";
import TeacherClassesPage from "../pages/catechist/TeacherClassesPage";
import MyStudentsPage from "../pages/catechist/MyStudentsPage";

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

// Giáo lý viên
const CATECHIST_ROLES = ["catechist", "teacher"];

export default function AppRoutes() {
  return (
    <Routes>
      {/* ======================================================
          PUBLIC ROUTES
      ====================================================== */}

      {/* Đăng nhập hệ thống Giáo xứ */}
      <Route path="/giao-xu/login" element={<Login />} />

      {/* Đăng nhập hệ thống Giáo lý */}
      <Route path="/" element={<CatechistLogin />} />
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

            <Route path="/lessons" element={<LessonQuestionManager />} />

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
          CATECHIST / GIÁO LÝ SYSTEM
      ====================================================== */}

      <Route element={<ProtectedRoute loginPath="/" />}>
        <Route element={<RoleGuard allowedRoles={CATECHIST_ROLES} />}>
          <Route element={<CatechistLayout />}>
            {/* --------------------------------------------------
                Giáo lý Dashboard
                -------------------------------------------------- */}
            <Route path="/catechist" element={<CatechistDashboard />} />

            {/* --------------------------------------------------
                Quản lý lớp
                -------------------------------------------------- */}
            <Route
              path="/catechist/classes"
              element={<ClassManagementDashboard />}
            />
            <Route
              path="/catechist/classes-teacher"
              element={<TeacherClassesPage />}
            />
            {/* --------------------------------------------------
                Quản lý học sinh
                -------------------------------------------------- */}
            <Route path="/catechist/students" element={<StudentManagement />} />
            <Route
              path="/catechist/student-class"
              element={<MyStudentsPage />}
            />

            {/* --------------------------------------------------
                Game giáo lý
                -------------------------------------------------- */}
            <Route path="/catechist/games" element={<GameManagementPage />} />

            {/* --------------------------------------------------
                Kết quả
                -------------------------------------------------- */}
            <Route path="/catechist/results" element={<ResultsPage />} />

            {/* --------------------------------------------------
                Bảng xếp hạng
                -------------------------------------------------- */}
            <Route
              path="/catechist/leaderboard"
              element={<LeaderboardPage />}
            />

            {/* --------------------------------------------------
                Bài học / câu hỏi
                -------------------------------------------------- */}
            <Route
              path="/catechist/lessons"
              element={<LessonQuestionManager />}
            />
            <Route
              path="/catechist-management"
              element={<CatechistManagement />}
            />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/catechist/profile" element={<ProfilePageCate />} />
            <Route
              path="/catechist/settings"
              element={<ParishSettingsPage />}
            />
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
