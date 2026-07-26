"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function VerifyEmailPage() {
  const { verifyEmail, resendVerification } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
  }, [email, router]);

  function handleChange(index: number, value: string) {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const next = document.querySelector(`input[name="otp-${index + 1}"]`) as HTMLInputElement;
      if (next) next.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.querySelector(`input[name="otp-${index - 1}"]`) as HTMLInputElement;
      if (prev) prev.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verifyEmail(email, code);
      setSuccess(true);
      setTimeout(() => router.push("/"), 1500);
    } catch (err: any) {
      setError(err.message || "Verification failed");
      setOtp(["", "", "", "", "", ""]);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    setResent(false);

    try {
      await resendVerification(email);
      setResent(true);
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">Verify Email</h1>
        <p className="text-gray-600 text-center mb-8">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-gray-900">{email}</span>
        </p>

        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-medium">Email verified! Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  name={`otp-${i}`}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              ))}
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-40"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Didn&apos;t receive the code?{" "}
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-black font-medium hover:underline disabled:opacity-40"
            >
              {resending ? "Sending..." : "Resend"}
            </button>
          </p>
          {resent && (
            <p className="text-green-600 text-sm mt-2">Code sent!</p>
          )}
        </div>

        <p className="text-center text-gray-600 mt-6">
          <Link href="/login" className="text-black font-medium hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
