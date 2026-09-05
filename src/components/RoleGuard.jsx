import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function RoleGuard({ allowedRoles = [], children }) {
  const { user, loading } = useUser();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Không có role được phép
  if (!allowedRoles.includes(user.role)) {
    if (user.role === "catechist") {
      return <Navigate to="/catechist" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
}
