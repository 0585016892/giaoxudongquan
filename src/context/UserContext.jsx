import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

const decodeJWT = (token) => {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      throw new Error("JWT không hợp lệ");
    }

    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");

    while (base64.length % 4) {
      base64 += "=";
    }

    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(json);
  } catch (error) {
    console.error("❌ JWT DECODE ERROR:", error);
    return null;
  }
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================================
  // RESTORE LOGIN
  // ================================
  useEffect(() => {
    const token = localStorage.getItem("token");

    console.log("🔄 [AUTH] Restore token:", !!token);

    if (!token) {
      setLoading(false);
      return;
    }

    const payload = decodeJWT(token);

    if (!payload) {
      console.error("❌ JWT không hợp lệ");

      localStorage.removeItem("token");
      setLoading(false);
      return;
    }

    console.log("🔓 [AUTH] RESTORED JWT:", payload);

    // Check hết hạn
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      console.warn("⏰ JWT đã hết hạn");

      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
      return;
    }

    const restoredUser = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      full_name: payload.full_name,
      username: payload.username,
      avatar: payload.avatar,
      church_id: payload.church_id,
      account_type: payload.account_type,
      teacher_id: payload.teacher_id,
      catechist_id: payload.catechist_id,
      token,
    };

    console.log("✅ [AUTH] USER RESTORED:", restoredUser);

    setUser(restoredUser);
    setLoading(false);
  }, []);

  // ================================
  // LOGIN
  // ================================
  const login = (token) => {
    console.log("🔐 [AUTH] LOGIN");

    const payload = decodeJWT(token);

    if (!payload) {
      throw new Error("JWT token không hợp lệ");
    }

    console.log("🔓 [AUTH] DECODED:", payload);

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error("JWT token đã hết hạn");
    }

    localStorage.setItem("token", token);

    const loggedUser = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      full_name: payload.full_name,
      username: payload.username,
      avatar: payload.avatar,
      church_id: payload.church_id,
      account_type: payload.account_type,
      teacher_id: payload.teacher_id,
      catechist_id: payload.catechist_id,
      token,
    };

    console.log("👤 [AUTH] LOGIN USER:", loggedUser);

    setUser(loggedUser);

    return loggedUser;
  };

  // ================================
  // LOGOUT
  // ================================
  const logout = () => {
    const currentRole = user?.role;

    console.log("🚪 [AUTH] LOGOUT:", currentRole);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("catechist_user");
    localStorage.removeItem("church_id");

    setUser(null);

    if (currentRole === "catechist" || currentRole === "teacher") {
      window.location.replace("/");
      return;
    }

    window.location.replace("/giao-xu/login");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
