import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth, convexAuth } from "@convex-dev/auth/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

const { auth, signIn, signOut, signUp, isAuthenticated, getUser } = convexAuth();

export default convex;

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}

function useAuth() {
  return { isAuthenticated, getUser, signIn, signOut };
}