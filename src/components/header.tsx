"use client";

import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";
import { UserState } from "@/components/user-state";

export function Header() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  // Assuming 'user' would be fetched or passed down if this conditional rendering is intended.
  // For the purpose of this edit, 'user' is not defined in this component's scope.
  // If 'user' is meant to be available, it would typically come from a hook like useQuery or context.
  const user = null; // Placeholder to make the code syntactically valid for the snippet.

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">The Division of Food Security</h1>
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