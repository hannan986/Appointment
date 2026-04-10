"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Calendar,
  Clock,
  Plus,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { format, parseISO, isFuture, isToday } from "date-fns";

type Appointment = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  notes: string | null;
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
    color: string;
  };
  user: { name: string; email: string };
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) fetchAppointments();
  }, [session]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments?limit=50");
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    setCancelling(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (res.ok) {
        toast.success("Appointment cancelled");
        fetchAppointments();
      } else {
        toast.error("Failed to cancel");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCancelling(null);
    }
  };

  const filtered = appointments.filter((a) => {
    if (filter === "all") return true;
    if (filter === "upcoming") return ["PENDING", "CONFIRMED"].includes(a.status) && isFuture(parseISO(a.date));
    if (filter === "past") return ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(a.status);
    return a.status === filter;
  });

  const upcoming = appointments.filter(
    (a) => ["PENDING", "CONFIRMED"].includes(a.status) && (isFuture(parseISO(a.date)) || isToday(parseISO(a.date)))
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A77FF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {session?.user.name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage and track all your appointments
            </p>
          </div>
          <Link
            href="/book"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0A77FF] text-white rounded-xl text-sm font-semibold hover:bg-[#0056CC] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Booking
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Bookings", value: appointments.length, icon: Calendar, color: "text-[#0A77FF] bg-blue-50" },
            { label: "Upcoming", value: upcoming.length, icon: Clock, color: "text-green-600 bg-green-50" },
            { label: "Completed", value: appointments.filter(a => a.status === "COMPLETED").length, icon: CheckCircle, color: "text-purple-600 bg-purple-50" },
            { label: "Cancelled", value: appointments.filter(a => a.status === "CANCELLED").length, icon: AlertCircle, color: "text-red-500 bg-red-50" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className={`inline-flex p-2 rounded-lg mb-2 ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Next appointment banner */}
        {upcoming.length > 0 && (
          <div className="bg-gradient-to-r from-[#0A77FF] to-[#0056CC] rounded-xl p-5 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-xs font-medium uppercase tracking-wide mb-1">Next Appointment</p>
                <h3 className="text-xl font-bold">{upcoming[0].service.name}</h3>
                <div className="flex items-center gap-4 mt-1 text-blue-100 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(parseISO(upcoming[0].date), "EEE, MMM d")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {upcoming[0].startTime}
                  </span>
                </div>
              </div>
              <StatusBadge status={upcoming[0].status} />
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {[
            { key: "all", label: "All" },
            { key: "upcoming", label: "Upcoming" },
            { key: "CONFIRMED", label: "Confirmed" },
            { key: "PENDING", label: "Pending" },
            { key: "past", label: "Past" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                ${filter === key ? "bg-[#0A77FF] text-white" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Appointments list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#0A77FF]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No appointments found</p>
            <p className="text-sm text-gray-400 mt-1">
              {filter === "upcoming" ? "You have no upcoming appointments." : "Try a different filter."}
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#0A77FF] text-white rounded-lg text-sm font-medium hover:bg-[#0056CC] transition-all"
            >
              <Plus className="w-4 h-4" />
              Book Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((appt) => (
              <div
                key={appt.id}
                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: appt.service.color || "#0A77FF" }}
                >
                  {appt.service.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{appt.service.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(parseISO(appt.date), "EEE, MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {appt.startTime} – {appt.endTime}
                        </span>
                      </div>
                      {appt.notes && (
                        <p className="text-xs text-gray-400 mt-1 truncate">{appt.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={appt.status} />
                      {["PENDING", "CONFIRMED"].includes(appt.status) && isFuture(parseISO(appt.date)) && (
                        <button
                          onClick={() => cancelAppointment(appt.id)}
                          disabled={cancelling === appt.id}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Cancel appointment"
                        >
                          {cancelling === appt.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      ID: #{appt.id.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold text-[#0A77FF]">
                      ${appt.service.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
