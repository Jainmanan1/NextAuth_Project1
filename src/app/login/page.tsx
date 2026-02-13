"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Input from "@/components/input";

export default function LoginPage() {
  
  const router = useRouter();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
const [resendLoading, setResendLoading] = useState(false);
const [resendSuccess, setResendSuccess] = useState(false);
  const [error,setError] = useState("")
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
       await axios.post("/api/users/login", user);
      toast.success("Login successful!");
      router.push("/profile");
    } catch (error:any) {
      if (error.response?.status === 429) {
        const seconds = error.response.data.retryAfter;
        toast.error(
          `Too many attempts. Try again in ${Math.ceil(seconds / 60)} minutes.`,
        );
      }
     
      const message = error.response?.data?.error;
      if(message === "EMAIL_NOT_VERIFIED"){
        setError("Email not verified, Please verify the email")
      }else{
        setError("Invalid Credentials")
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.email.length > 0 && user.password.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [user]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4 selection:bg-blue-500/30 overflow-hidden ">
      <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob pointer-events-none  "></div>

      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000  pointer-events-none"></div>

      <div className="w-full max-w-md">
        <h1 className="text-center text-3xl font-bold text-white mb-6">
          {loading ? "Processing..." : "Login"}
        </h1>

        <form
          onSubmit={onLogin}
          className="space-y-4 rounded-xl bg-gray-900 p-8 shadow-2xl border border-gray-800"
        >
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 text-center">
              {error}
              {error.includes("verify") && (
                <button
                  type="button"
                  disabled={resendLoading || resendSuccess}
                  onClick={async () => {
                    try {
                      setResendLoading(true);
                      await axios.post("/api/users/resendverifyemail", {
                        email: user.email,
                      });                     
                        setResendSuccess(true); 
                        setTimeout(() => {
                          setResendSuccess(false);
                        }, 30000);                    
                      toast.success("verification email resent");
                    } catch (error) {
                      toast.error("Failed to resend verification email");
                    } finally {
                      setResendLoading(false);
                    }
                  }}
                  className={`ml-2 underline ${resendLoading || resendSuccess ? "text-gray-400 cursor-not-allowed" : "text-blue-400 hover:text-blue-300"}  `}
                >
                  {resendLoading
                    ? "Sending..."
                    : resendSuccess
                      ? "Email Sent"
                      : "Resend Email"}
                </button>
              )}
            </div>
          )}
          <div>
            <label className="mb-2 block  text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-gray-600  shadow-inner"
              placeholder="name@company.com"
              required
            />
          </div>

          <div>
            <Input
              type="password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              label="Password"
              placeholder="••••••••"
              isPassword={true}
              error={
                user.password.length > 0 && user.password.length < 8
                  ? "Password too short"
                  : ""
              }
              touched={true}
            />
          </div>

          <div className="flex items-end justify-end">
            <Link href={"/forgotpassword"}>Forgot Password?</Link>
          </div>

          <button
            type="submit"
            disabled={buttonDisabled || loading}
            className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 
              ${
                buttonDisabled || loading
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
              }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="text-center mt-4">
            <Link
              href="/signup"
              className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
