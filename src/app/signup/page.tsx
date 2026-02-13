"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Input from "@/components/input";
export default function SignUpPage() {
  const [user, setUser] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [touchedFields, setTouchedFields] = useState({
      password: false,
      username:false,
      email:false
      
    });
  const router = useRouter();
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post("/api/users/signup", user);
      localStorage.setItem("pending_email", user.email);
      toast.success("Account created! Redirecting...");
      router.push("/login");
    } catch (error: any) {
      if (error.response?.status === 429) {
        const seconds = error.response.data.retryAfter;
        const minutes = Math.ceil(seconds / 60);
        toast.error(
          `Account creation limit reached for this connection. Please try again later in ${minutes} minutes.`,
        );
        return;
      }
      const errorMessage =
        typeof error.response?.data?.error === "string"
          ? error.response.data.error
          : "Signup failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isEmailValid = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
      user.email,
    );
    const isUsernameValid = user.username.length >= 3;
    const isPasswordValid = user.password.length >= 8;

    if (isEmailValid && isUsernameValid && isPasswordValid) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [user]);

 return (
   <div className="relative flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4 selection:bg-blue-500/30 overflow-hidden">
     <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob  pointer-events-none"></div>

     <div className="absolute bottom-0 -right-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000  pointer-events-none"></div>

     <div className="absolute -bottom-10 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-15 animate-blob animation-delay-4000  pointer-events-none"></div>

     <div className="w-full max-w-md z-10">
       <div className="text-center mb-8">
         <h1 className="text-4xl font-extrabold tracking-tight text-white">
           {loading ? "Creating Account..." : "Join Us"}
         </h1>
         <p className="text-gray-400 mt-2">Enter your details to get started</p>
       </div>

       <form
         onSubmit={onSignUp}
         className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-8 rounded-2xl shadow-2xl space-y-5"
       >
         <div>
           <Input
             type="text"
             placeholder="johndoe"
             value={user.username}
             onChange={(e) => setUser({ ...user, username: e.target.value })}
             label="Username"
             onBlur={() =>
               setTouchedFields({ ...touchedFields, username: true })
             }
             touched={touchedFields.username}
             error={
               !user.username
                 ? "Username is required"
                 : user.username.length < 3
                   ? "Minimum 3 characters required"
                   : ""
             }
           />
         </div>

         <div>
           <Input
             type="email"
             placeholder="name@example.com"
             value={user.email}
             onChange={(e) => setUser({ ...user, email: e.target.value })}
             label="Email"
             onBlur={() => setTouchedFields({ ...touchedFields, email: true })}
             touched={touchedFields.email}
             error={
               !user.email
                 ? "Email is required"
                 : !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(user.email)
                   ? "Invalid email address"
                   : ""
             }
           />
         </div>
         <div>
           <Input
             type="password"
             label="Password"
             placeholder="••••••••"
             isPassword={true}
             value={user.password}
             onChange={(e) => setUser({ ...user, password: e.target.value })}
             onBlur={() =>
               setTouchedFields({ ...touchedFields, password: true })
             }
             touched={touchedFields.password}
             error={
               !user.password
                 ? "Password is required"
                 : user.password.length < 8
                   ? "Must be at least 8 characters"
                   : ""
             }
           />
         </div>

         <button
           type="submit"
           disabled={buttonDisabled || loading}
           className={`w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 transform 
            ${
              buttonDisabled || loading
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-[0.98]"
            }`}
         >
           {loading ? (
             <span className="flex items-center justify-center gap-2">
               <svg
                 className="animate-spin h-5 w-5 text-white"
                 viewBox="0 0 24 24"
               >
                 <circle
                   className="opacity-25"
                   cx="12"
                   cy="12"
                   r="10"
                   stroke="currentColor"
                   strokeWidth="4"
                   fill="none"
                 ></circle>
                 <path
                   className="opacity-75"
                   fill="currentColor"
                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                 ></path>
               </svg>
               Processing...
             </span>
           ) : (
             "Create Account"
           )}
         </button>

         <div className="pt-2 text-center">
           <p className="text-gray-400 text-sm">
             Already have an account?{" "}
             <Link
               href="/login"
               className="text-blue-500 hover:text-blue-400 font-semibold transition-colors"
             >
               Login here
             </Link>
           </p>
         </div>
       </form>
     </div>
   </div>
 );
}
