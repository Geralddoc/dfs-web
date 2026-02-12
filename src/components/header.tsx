"use client";

import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserState } from "@/components/user-state";
import { LayoutDashboard, ArrowLeft } from "lucide-react";

export function Header() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  // Assuming 'user' would be fetched or passed down if this conditional rendering is intended.
  // For the purpose of this edit, 'user' is not defined in this component's scope.
  // If 'user' is meant to be available, it would typically come from a hook like useQuery or context.
  const user = null; // Placeholder to make the code syntactically valid for the snippet.

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {!isHomePage && (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                onClick={() => window.location.href = "/"}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            )}
            {isHomePage && (
              <div className="flex items-center gap-2 text-slate-800">
                <LayoutDashboard className="h-5 w-5 text-indigo-600" />
                <span className="font-bold text-lg">Management Portal</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <UserMenu />
              </div>
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function UserMenu() {
  return (
    <div className="text-sm text-slate-600">
      Authenticated
    </div>
  )
}

function SignInButton() {
  return (
    <button className="text-sm text-blue-600">Sign In</button>
  )
}