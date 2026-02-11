"use client";

import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function EmailVerification() {
  const [message, setMessage] = useState("");
  // const { sendEmailVerification } = useConvexAuth();

  const handleSendVerification = async () => {
    try {
      // await sendEmailVerification();
      console.log("Email verification sent (mock)");
      setMessage("Verification email sent. Please check your inbox.");
    } catch (error) {
      setMessage("Failed to send verification email. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            Please verify your email address to complete your registration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              We've sent a verification link to your email address. Please check your inbox and click the link to verify your email.
            </p>
            {message && (
              <div className={`p-3 rounded-md ${message.includes('sent') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message}
              </div>
            )}
            <Button onClick={handleSendVerification} className="w-full">
              Resend Verification Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}