"use client"
import Link from "next/link";
import React, { useEffect, useState,useRef } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter, } from "next/navigation";


export default function ProfilePage() {
   const router = useRouter();
   const [data,setData] = useState("nothing")

  const [loading, setLoading] = useState(false);

  const logout = async (e: React.FormEvent) => {
    e.preventDefault();
   
    try {
      setLoading(true);
      
      const response = await axios.post("/api/users/logout");
      console.log("Logout success", response.data);
      toast.success("Logout successful!");
      router.push("/login")

      
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");

      
    }finally {
      setLoading(false);
    }

  }
 const getUserDetail = async()=>{
   const res = await axios.get("/api/users/me");
  
   setData(res.data.data.username);
  
 toast.success("User data loaded");

 }
 const refValue = useRef(false);
 
 useEffect(() => {
  if(refValue.current){
    return;
  }
  refValue.current=true;
   getUserDetail();
 }, []);
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0a0a0a] overflow-hidden p-4">
      <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob  pointer-events-none"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob  pointer-events-none"></div>
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000  pointer-events-none"></div>
      <div className="absolute bottom-0 left-4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-15 animate-blob animation-delay-4000  pointer-events-none"></div>

      <div className="z-10 w-full max-w-md bg-gray-900/40 backdrop-blur-2xl border border-gray-800 p-8 rounded-3xl shadow-2xl text-center">
        <div className="mb-6">
          <div className="mx-auto w-24 h-24 bg-linear-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4">
            U
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Profile
          </h1>
          <p className="text-gray-400 mt-1">Welcome back to your dashboard</p>
        </div>

        <div className="bg-gray-950/50 border border-gray-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">
            Status
          </p>
          <p className="text-green-400 font-medium">Verified Account</p>
        </div>

        <div>
          <h2>
            {data === "nothing" ? (
              "Nothing"
            ) : (
              <Link href={`/profile/${data}`}>{data}</Link>
            )}{" "}
          </h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              disabled={loading}
              className={`w-full px-4 py-3 bg-red-600/10 border border-red-600/20 text-red-500 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all duration-300 active:scale-[0.98] ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Logging out..." : "Logout"}
            </button>

            <button
              onClick={getUserDetail}
              className={`w-full px-4 py-3 bg-green-600/10 border border-green-600/20 text-green-500 rounded-xl font-bold hover:bg-green-600 hover:text-white transition-all duration-300 active:scale-[0.98] `}
            >
              user detail
            </button>
          </div>

          <Link
            href="/"
            className="block w-full px-4 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}