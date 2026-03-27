import { createContext, useContext, useState, useEffect } from "react";
import { adminAPI } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Restore authentication state from localStorage on app load
    const storedToken = localStorage.getItem("token");
    const storedAdmin = localStorage.getItem("admin");

    if (storedToken && storedAdmin) {
      setToken(storedToken);
      setAdmin(JSON.parse(storedAdmin));
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await adminAPI.login({ email, password });
    const { admin: adminData, token: newToken } = response.data.data;

    localStorage.setItem("token", newToken);
    localStorage.setItem("admin", JSON.stringify(adminData));

    setToken(newToken);
    setAdmin(adminData);

    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await adminAPI.register({ name, email, password });
    const { admin: adminData, token: newToken } = response.data.data;

    localStorage.setItem("token", newToken);
    localStorage.setItem("admin", JSON.stringify(adminData));

    setToken(newToken);
    setAdmin(adminData);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    setToken(null);
    setAdmin(null);
  };

  const updateAdminProfile = (updatedData) => {
    const updatedAdmin = { ...admin, ...updatedData };
    localStorage.setItem("admin", JSON.stringify(updatedAdmin));
    setAdmin(updatedAdmin);
  };

  const value = {
    admin,
    token,
    loading,
    login,
    register,
    logout,
    updateAdminProfile,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
