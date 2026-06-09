"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen bg-[#f4f7fd] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#D4E0F0] max-w-sm w-full text-center">
        <h1 className="text-2xl font-serif font-bold text-[#111] mb-2">Float List DB</h1>
        <p className="text-[14px] text-[#6b7a99] mb-8">Sign in with your company Google account to access the candidate upload portal.</p>
        
        {error === "AccessDenied" && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-[13px] text-left">
            <strong>Access Denied.</strong> You must use an authorized company email address to log in.
          </div>
        )}

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex items-center justify-center gap-3 w-full border-[1.5px] border-[#D4E0F0] hover:bg-[#f4f7fd] transition-colors py-3 px-4 rounded-xl text-[14px] font-bold text-[#444]"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
