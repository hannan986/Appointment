"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
  X,
  ChevronDown,
} from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path: string) =>
    pathname === path ? "text-[#0A77FF] font-semibold" : "text-gray-600 hover:text-[#0A77FF]";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0A77FF] rounded-lg flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Appoint<span className="text-[#0A77FF]">Ease</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={`text-sm transition-colors ${isActive("/")}`}>
              Home
            </Link>
            <Link href="/book" className={`text-sm transition-colors ${isActive("/book")}`}>
              Book Appointment
            </Link>
            {session && (
              <Link href="/dashboard" className={`text-sm transition-colors ${isActive("/dashboard")}`}>
                My Appointments
              </Link>
            )}
            {session?.user.role === "ADMIN" && (
              <Link href="/admin" className={`text-sm transition-colors ${isActive("/admin")}`}>
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-[#0A77FF] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {session.user.name?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 leading-none">{session.user.name}</p>
                    <p className="text-xs text-gray-500 leading-none mt-0.5">
                      {session.user.role === "ADMIN" ? "Administrator" : "Member"}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      My Dashboard
                    </Link>
                    {session.user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => { signOut({ callbackUrl: "/" }); setDropdownOpen(false); }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#0A77FF] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0A77FF] rounded-lg hover:bg-[#0056CC] transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4">
          <nav className="flex flex-col gap-1">
            <Link href="/" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Home</Link>
            <Link href="/book" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Book Appointment</Link>
            {session && (
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50">My Appointments</Link>
            )}
            {session?.user.role === "ADMIN" && (
              <Link href="/admin" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Admin Panel</Link>
            )}
            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="mt-2 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 text-left flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm text-center border border-gray-200 hover:bg-gray-50">Sign In</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-sm text-center bg-[#0A77FF] text-white hover:bg-[#0056CC]">Get Started</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
