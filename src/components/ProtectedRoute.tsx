import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export const ProtectedRoute: React.FC<{
  allowedRoles: Array<"user" | "authority">;
  children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
  const { auth } = useAuth();

  if (!auth?.role) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(auth.role)) {
    // Logged in but wrong role
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
