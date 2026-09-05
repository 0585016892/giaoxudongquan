import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

/**
 * ============================================================
 * PROTECTED ROUTE
 * ============================================================
 *
 * Dùng để bảo vệ các khu vực cần đăng nhập.
 *
 * loginPath:
 * - "/"               → hệ thống Giáo lý
 * - "/giao-xu/login"  → hệ thống quản trị Giáo xứ
 */
export default function ProtectedRoute({ loginPath = "/" }) {
  const { user, loading } = useUser();
  const location = useLocation();

  // Đang kiểm tra trạng thái đăng nhập
  if (loading) {
    return null;
  }

  // Chưa đăng nhập
  if (!user) {
    return (
      <Navigate
        to={loginPath}
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}

/**
 * ============================================================
 * ROLE GUARD
 * ============================================================
 *
 * Kiểm tra user có đúng role được phép truy cập hay không.
 *
 * allowedRoles:
 * [
 *   "admin",
 *   "priest",
 *   "catechist",
 *   ...
 * ]
 *
 * loginPath:
 * - "/"               → login Giáo lý
 * - "/giao-xu/login"  → login Giáo xứ
 */
export function RoleGuard({ allowedRoles = [], loginPath = "/" }) {
  const { user, loading } = useUser();
  const location = useLocation();

  // Đang loading user
  if (loading) {
    return null;
  }

  // Chưa đăng nhập
  if (!user) {
    return (
      <Navigate
        to={loginPath}
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // ==========================================================
  // KHÔNG CÓ QUYỀN
  // ==========================================================

  if (!allowedRoles.includes(user.role)) {
    // --------------------------------------------------------
    // GIÁO LÝ VIÊN / GIÁO VIÊN
    // --------------------------------------------------------

    if (user.role === "catechist" || user.role === "teacher") {
      return <Navigate to="/catechist" replace />;
    }

    // --------------------------------------------------------
    // ADMIN / PRIEST / CÁC ROLE GIÁO XỨ
    // --------------------------------------------------------

    return <Navigate to="/giao-xu" replace />;
  }

  return <Outlet />;
}
