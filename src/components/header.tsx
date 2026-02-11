"use client";

import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";
import { UserState } from "@/components/user-state";

export function Header() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">The Division of Food Security</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-semibold text-gray-700 mr-4">Tobago House of Assembly</span>
            <UserState />
          </div>
        </div>
      </div>
    </header>
  );
}