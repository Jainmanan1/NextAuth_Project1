"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [user, Setuser] = useState({
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);

  const onSubmitPage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post("/api/users/forgotpassword", user);
      toast.success(
        "if the account exists, a password reset email has been sent",
      );
        setTimeout(()=>router.push("/login"),1500) ;
    } catch (error: any) {
      if (error.response?.status === 429) {
        const seconds = error.response.data.retryAfter;
        const minutes = Math.ceil(seconds / 60);
        toast.error(
          `Too many attempts. Try again in ${minutes} minutes.`,
        );
      } else{
      toast.error(error.response?.data?.error || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    user.email.length > 0 ? setButtonDisabled(false) : setButtonDisabled(true);
  }, [user]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4 selection:bg-blue-500/30 overflow-hidden">
      <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob  pointer-events-none"></div>

      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000  pointer-events-none"></div>

      <div className="absolute -bottom-10 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-15 animate-blob animation-delay-4000  pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <h1 className="text-center text-3xl font-bold text-white mb-6  ">
          {loading ? "processing..." : "Forgot Password?"}
        </h1>
        <form
          onSubmit={onSubmitPage}
          className="border border-gray-800 bg-gray-900 rounded-xl p-8 space-y-4 shadow-2xl"
        >
          <div className=" flex flex-col space-y-1">
            <label className="  text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => Setuser({ ...user, email: e.target.value })}
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="Enter your email"
              required
            />
          </div>
          <button
            type="submit"
            disabled={buttonDisabled || loading}
            className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 ${
              buttonDisabled || loading
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
            } `}
          >
            {loading ? "Sending reset email..." : "Send Reset Email"}
          </button>
        </form>
      </div>
    </div>
  );
}
