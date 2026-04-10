"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Calendar, Eye, EyeOff, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }

      // Auto-login after registration
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.ok) {
        toast.success("Account created! Welcome to AppointEase.");
        router.push("/dashboard");
      } else {
        toast.success("Account created! Please sign in.");
        router.push("/login");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2 : 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A77FF] via-[#0056CC] to-[#003d99] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#0A77FF]" />
            </div>
            <span className="text-2xl font-bold text-white">AppointEase</span>
          </Link>
          <p className="text-blue-200 mt-2 text-sm">Create your free account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Get started free</h1>
          <p className="text-gray-500 text-sm mb-6">Join thousands of businesses automating their bookings</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A77FF] focus:border-transparent placeholder:text-gray-400"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A77FF] focus:border-transparent placeholder:text-gray-400"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone (optional)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A77FF] focus:border-transparent placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A77FF] focus:border-transparent placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        passwordStrength >= i
                          ? i === 1 ? "bg-red-400" : i === 2 ? "bg-yellow-400" : "bg-green-400"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#0A77FF] text-white font-semibold rounded-xl hover:bg-[#0056CC] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creating Account..." : "Create Free Account"}
            </button>
          </form>

          <div className="mt-4 space-y-2">
            {["Free to use", "No credit card needed", "Cancel anytime"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
                <Check className="w-3.5 h-3.5 text-green-500" />
                {item}
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#0A77FF] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
