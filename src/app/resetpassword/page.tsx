"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import Input from "@/components/input";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [user, setUser] = useState({
    password: "",
    confirmPassword: "",
  });

  const [touchedFields, setTouchedFields] = useState({
    password: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(true);
      return;
    }
    const isPasswordValid = user.password.length >= 8;
    const passwordsMatch = user.password === user.confirmPassword;

    if (token && isPasswordValid && passwordsMatch) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [token, user]);

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user.password !== user.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    try {
      setLoading(true);
      await axios.post("/api/users/resetpassword", {
        password: user.password,
        confirmPassword: user.confirmPassword,
        token: token,
      });

      toast.success("Password reset successfully");
      setTimeout(() => router.push("/login"), 1500);
    } catch (error: any) {
      setError(true);
      if (error.response?.status === 429) {
        const seconds = error.response.data.retryAfter;
        const minutes = Math.ceil(seconds / 60);
        toast.error(
          `Account reset limit reached. Please try again later in ${minutes} minutes.`,
        );
        return;
      }else{
        toast.error(error.response?.data?.error || "Failed to reset password.");
      } 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4 selection:bg-blue-500/30 overflow-hidden">
      <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob  pointer-events-none"></div>

      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000  pointer-events-none"></div>
      
      <div className="absolute -bottom-10 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-15 animate-blob animation-delay-4000  pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8 ">
          <div className="text-2xl mb-2 font-extrabold tracking-tight text-white">
            {loading ? "Updating..." : "New Password"}
          </div>

          {error ? (
            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-center">
              <p className="text-red-500 mb-4">Invalid or expired token.</p>
              <Link
                href="/forgotpassword"
                className="text-blue-500 hover:underline"
              >
                Request a new link
              </Link>
            </div>
          ) : (
            <form
              onSubmit={resetPassword}
              className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-8 rounded-2xl shadow-2xl space-y-5"
            >
              <Input
                type="password"
                placeholder="••••••••"
                value={user.password}
                label="Password"
                isPassword={true}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                onBlur={() =>
                  setTouchedFields({ ...touchedFields, password: true })
                }
                touched={touchedFields.password}
                error={
                  !user.password
                    ? "Password is required"
                    : user.password.length < 8
                      ? "Minimum 8 characters required"
                      : ""
                }
              />

              <Input
                label="Confirm Password"
                type="password"
                isPassword={true}
                placeholder="••••••••"
                value={user.confirmPassword}
                onChange={(e) =>
                  setUser({ ...user, confirmPassword: e.target.value })
                }
                onBlur={() =>
                  setTouchedFields({ ...touchedFields, confirmPassword: true })
                }
                touched={touchedFields.confirmPassword}
                error={
                  !user.confirmPassword
                    ? "Please confirm your password"
                    : user.password !== user.confirmPassword
                      ? "Passwords do not match"
                      : ""
                }
              />

              <button
                type="submit"
                disabled={buttonDisabled || loading}
                className={`py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 w-full ${
                  buttonDisabled || loading
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
                }`}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
