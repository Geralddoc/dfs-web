"use client";

import { useConvexAuth } from "convex/react";
import { AuthDialog } from "@/components/auth-dialog";

export function UserState() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <AuthDialog />;
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-600">Welcome, User</span>
      <button className="text-sm text-blue-600 hover:text-blue-800">
        Sign Out
      </button>
    </div>
  );
}