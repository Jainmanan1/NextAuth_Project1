"use client";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) return; 
      setLoading(true);
      try {
        await axios.post("/api/users/verifyemail", { token });
        setVerified(true);
        localStorage.removeItem("pending_email");
        toast.success("Email verified successfully!");
        setTimeout(() => router.push("/login"), 2000);
      } catch (err: any) {
        setError(true);
        if (err.response?.status === 429) {
          const seconds = err.response.data.retryAfter;
          toast.error(
            `Rate limit hit. Please wait ${Math.ceil(seconds / 60)} minutes.`,
          );
        } else {
          toast.error("Verification link expired or invalid");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setError(true);
    }
  }, [token, router]);


  const handleResend = async () => {
    try {
      setResendLoading(true);
      
      let savedEmail = localStorage.getItem("pending_email");

      if (!savedEmail) {
        const inputEmail = window.prompt(
          "Please enter your email to receive a new link:",
        );
        if (!inputEmail) return;
        savedEmail = inputEmail;
      }

      await axios.post("/api/users/resendverifyemail", { email: savedEmail });
      toast.success("New verification link sent!");
    } catch (err: any) {
      if (err.response?.status === 429) {
        const seconds = err.response.data.retryAfter;
        toast.error(`Please wait ${Math.ceil(seconds / 60)} minutes.`);
      } else {
        toast.error("Failed to resend email.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white p-4">
      <div className="w-full max-w-md bg-gray-900/50 p-8 rounded-2xl border border-gray-800 text-center shadow-2xl">
        {loading && (
          <div className="space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-400">Verifying your email...</p>
          </div>
        )}

        {verified && (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-green-400">Verified! 🎉</h2>
            <p className="text-gray-400">Redirecting you to login...</p>
            <Link
              href="/login"
              className="text-blue-500 hover:underline block pt-4"
            >
              Click here if not redirected
            </Link>
          </div>
        )}

        {error && !loading && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-red-500">
              Invalid or Expired Link
            </h2>
            <p className="text-gray-400">
              The verification link is no longer valid or has already been used.
            </p>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="bg-blue-600 hover:bg-blue-500 py-2 px-4 rounded-lg font-bold transition-all disabled:opacity-50"
              >
                {resendLoading ? "Sending..." : "Resend Verification Email"}
              </button>

              <Link
                href="/signup"
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Back to Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
