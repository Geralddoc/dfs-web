"use client";

import { ConvexAuthProvider, useAuthActions } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { convex } from "@/lib/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthProvider client={convex}>
      {children}
    </ConvexAuthProvider>
  );
}

function useAuth() {
  const { signIn, signOut } = useAuthActions();
  return { isAuthenticated: false, isLoading: false, getUser: () => null, signIn, signOut };
}