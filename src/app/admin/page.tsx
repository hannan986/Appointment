"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import {
  LayoutDashboard,
  Calendar,
  Settings,
  Users,
  TrendingUp,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  Save,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { format, parseISO } from "date-fns";

type Tab = "overview" | "appointments" | "services" | "slots";
type Service = {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  color: string;
  isActive: boolean;
};
type Appointment = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  service: { id: string; name: string; color: string };
  user: { name: string; email: string; phone?: string };
};
type Stats = {
  totalAppointments: number;
  pendingCount: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
  thisMonthCount: number;
  thisWeekCount: number;
  totalUsers: number;
  totalServices: number;
  upcomingAppointments: Appointment[];
};
type Slot = {
  id: string;
  serviceId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string>("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Service form
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({ name: "", description: "", duration: "30", price: "0", color: "#0A77FF" });
  const [savingService, setSavingService] = useState(false);

  // Slot form
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [slotForm, setSlotForm] = useState({ serviceId: "", dayOfWeek: "1", startTime: "09:00", endTime: "09:30" });
  const [savingSlot, setSavingSlot] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user.role !== "ADMIN")) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user.role === "ADMIN") {
      loadAll();
    }
  }, [session]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, apptRes, svcRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/appointments?limit=100"),
        fetch("/api/services"),
      ]);
      const [statsData, apptData, svcData] = await Promise.all([
        statsRes.json(),
        apptRes.json(),
        svcRes.json(),
      ]);
      setStats(statsData);
      setAppointments(apptData.appointments || []);
      setServices(svcData);
      if (svcData.length > 0) {
        setSelectedService(svcData[0].id);
        loadSlots(svcData[0].id);
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async (serviceId: string) => {
    try {
      const res = await fetch(`/api/slots?serviceId=${serviceId}&date=${format(new Date(), "yyyy-MM-dd")}`);
      // Load all slots for service by day
      const slotsRes = await fetch(`/api/slots/all?serviceId=${serviceId}`);
      if (slotsRes.ok) {
        const data = await slotsRes.json();
        setSlots(data);
      }
    } catch {}
  };

  const updateAppointmentStatus = async (id: string, newStatus: string) => {
    setUpdatingStatus(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Status updated to ${newStatus.toLowerCase()}`);
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        );
        if (stats) {
          loadAll();
        }
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const saveService = async () => {
    setSavingService(true);
    try {
      const url = editingService ? `/api/services/${editingService.id}` : "/api/services";
      const method = editingService ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceForm),
      });
      if (res.ok) {
        toast.success(editingService ? "Service updated!" : "Service created!");
        setShowServiceForm(false);
        setEditingService(null);
        setServiceForm({ name: "", description: "", duration: "30", price: "0", color: "#0A77FF" });
        loadAll();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save service");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSavingService(false);
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm("Delete this service? This will also remove all related time slots.")) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Service deleted");
        loadAll();
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const saveSlot = async () => {
    setSavingSlot(true);
    try {
      const res = await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slotForm),
      });
      if (res.ok) {
        toast.success("Time slot added!");
        setShowSlotForm(false);
        setSlotForm({ serviceId: selectedService, dayOfWeek: "1", startTime: "09:00", endTime: "09:30" });
        loadSlots(selectedService);
      } else {
        toast.error("Failed to save slot");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSavingSlot(false);
    }
  };

  const deleteSlot = async (id: string) => {
    try {
      await fetch(`/api/slots?id=${id}`, { method: "DELETE" });
      toast.success("Slot deleted");
      loadSlots(selectedService);
    } catch {
      toast.error("Failed to delete slot");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A77FF]" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "appointments", label: "Appointments", icon: Calendar },
    { key: "services", label: "Services", icon: Settings },
    { key: "slots", label: "Time Slots", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Manage appointments, services, and time slots</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A77FF] text-white text-xs font-semibold rounded-full">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Live
          </span>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 bg-white rounded-xl p-1 mb-6 border border-gray-100 shadow-sm w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                ${activeTab === tab.key ? "bg-[#0A77FF] text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Appointments", value: stats.totalAppointments, icon: Calendar, color: "text-[#0A77FF] bg-blue-50", change: `+${stats.thisMonthCount} this month` },
                { label: "This Week", value: stats.thisWeekCount, icon: TrendingUp, color: "text-green-600 bg-green-50", change: "Booked this week" },
                { label: "Active Users", value: stats.totalUsers, icon: Users, color: "text-purple-600 bg-purple-50", change: "Registered customers" },
                { label: "Services", value: stats.totalServices, icon: Settings, color: "text-orange-600 bg-orange-50", change: "Active services" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <div className={`inline-flex p-2.5 rounded-xl mb-3 ${s.color}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{s.value}</div>
                  <div className="text-sm font-medium text-gray-600 mt-0.5">{s.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{s.change}</div>
                </div>
              ))}
            </div>

            {/* Status breakdown */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Appointment Status</h3>
                <div className="space-y-3">
                  {[
                    { label: "Pending", count: stats.pendingCount, color: "bg-yellow-400", width: (stats.pendingCount / Math.max(stats.totalAppointments, 1)) * 100 },
                    { label: "Confirmed", count: stats.confirmedCount, color: "bg-green-400", width: (stats.confirmedCount / Math.max(stats.totalAppointments, 1)) * 100 },
                    { label: "Completed", count: stats.completedCount, color: "bg-blue-400", width: (stats.completedCount / Math.max(stats.totalAppointments, 1)) * 100 },
                    { label: "Cancelled", count: stats.cancelledCount, color: "bg-red-400", width: (stats.cancelledCount / Math.max(stats.totalAppointments, 1)) * 100 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-semibold text-gray-900">{item.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all`}
                          style={{ width: `${Math.max(item.width, 2)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
                {stats.upcomingAppointments.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">No upcoming appointments</p>
                ) : (
                  <div className="space-y-3">
                    {stats.upcomingAppointments.map((appt) => (
                      <div key={appt.id} className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: appt.service.color }}
                        >
                          {appt.user.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{appt.user.name}</p>
                          <p className="text-xs text-gray-500">{appt.service.name} · {appt.startTime}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {format(parseISO(appt.date), "MMM d")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">All Appointments</h2>
              <p className="text-sm text-gray-500 mt-0.5">{appointments.length} total</p>
            </div>
            {appointments.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No appointments yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Service</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date & Time</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{appt.user.name}</p>
                            <p className="text-xs text-gray-400">{appt.user.email}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                              style={{ background: appt.service.color }}
                            >
                              {appt.service.name[0]}
                            </div>
                            <span className="text-sm text-gray-700">{appt.service.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-700">{format(parseISO(appt.date), "MMM d, yyyy")}</p>
                          <p className="text-xs text-gray-400">{appt.startTime} – {appt.endTime}</p>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={appt.status as any} />
                        </td>
                        <td className="px-5 py-4">
                          {updatingStatus === appt.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#0A77FF]" />
                          ) : (
                            <div className="flex items-center gap-1">
                              {appt.status === "PENDING" && (
                                <>
                                  <button
                                    onClick={() => updateAppointmentStatus(appt.id, "CONFIRMED")}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                    title="Confirm"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => updateAppointmentStatus(appt.id, "CANCELLED")}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Cancel"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {appt.status === "CONFIRMED" && (
                                <>
                                  <button
                                    onClick={() => updateAppointmentStatus(appt.id, "COMPLETED")}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    title="Mark Completed"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => updateAppointmentStatus(appt.id, "NO_SHOW")}
                                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-all"
                                    title="No Show"
                                  >
                                    <AlertCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">Services ({services.length})</h2>
              <button
                onClick={() => {
                  setEditingService(null);
                  setServiceForm({ name: "", description: "", duration: "30", price: "0", color: "#0A77FF" });
                  setShowServiceForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0A77FF] text-white rounded-xl text-sm font-semibold hover:bg-[#0056CC] transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Service
              </button>
            </div>

            {showServiceForm && (
              <div className="bg-white rounded-xl border border-blue-200 p-5 mb-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {editingService ? "Edit Service" : "New Service"}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Name</label>
                    <input
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                      placeholder="e.g. General Consultation"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A77FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Duration (minutes)</label>
                    <input
                      type="number"
                      value={serviceForm.duration}
                      onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A77FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A77FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={serviceForm.color}
                        onChange={(e) => setServiceForm({ ...serviceForm, color: e.target.value })}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      <input
                        value={serviceForm.color}
                        onChange={(e) => setServiceForm({ ...serviceForm, color: e.target.value })}
                        className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A77FF]"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                      rows={2}
                      placeholder="Describe this service..."
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A77FF] resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={saveService}
                    disabled={savingService || !serviceForm.name}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0A77FF] text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-[#0056CC] transition-all"
                  >
                    {savingService ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {savingService ? "Saving..." : "Save Service"}
                  </button>
                  <button
                    onClick={() => setShowServiceForm(false)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((svc) => (
                <div key={svc.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ background: svc.color }}
                      >
                        {svc.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{svc.name}</p>
                        <p className="text-xs text-gray-400">{svc.duration} min · ${svc.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingService(svc);
                          setServiceForm({
                            name: svc.name,
                            description: svc.description,
                            duration: svc.duration.toString(),
                            price: svc.price.toString(),
                            color: svc.color,
                          });
                          setShowServiceForm(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-[#0A77FF] hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteService(svc.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{svc.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${svc.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                      {svc.isActive ? "Active" : "Inactive"}
                    </span>
                    <div className="w-4 h-4 rounded" style={{ background: svc.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time Slots Tab */}
        {activeTab === "slots" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h2 className="font-semibold text-gray-900">Time Slots</h2>
                <p className="text-sm text-gray-500">Manage available booking slots per service</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedService}
                  onChange={(e) => {
                    setSelectedService(e.target.value);
                    loadSlots(e.target.value);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A77FF]"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setSlotForm({ serviceId: selectedService, dayOfWeek: "1", startTime: "09:00", endTime: "09:30" });
                    setShowSlotForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0A77FF] text-white rounded-xl text-sm font-semibold hover:bg-[#0056CC] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Slot
                </button>
              </div>
            </div>

            {showSlotForm && (
              <div className="bg-white rounded-xl border border-blue-200 p-5 mb-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">New Time Slot</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Day of Week</label>
                    <select
                      value={slotForm.dayOfWeek}
                      onChange={(e) => setSlotForm({ ...slotForm, dayOfWeek: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A77FF]"
                    >
                      {DAY_NAMES.map((d, i) => (
                        <option key={d} value={i}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Start Time</label>
                    <input
                      type="time"
                      value={slotForm.startTime}
                      onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A77FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">End Time</label>
                    <input
                      type="time"
                      value={slotForm.endTime}
                      onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A77FF]"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={saveSlot}
                    disabled={savingSlot}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0A77FF] text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-[#0056CC] transition-all"
                  >
                    {savingSlot ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {savingSlot ? "Saving..." : "Add Slot"}
                  </button>
                  <button
                    onClick={() => setShowSlotForm(false)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Slots grouped by day */}
            <div className="space-y-3">
              {DAY_NAMES.map((day, dayIdx) => {
                const daySlots = slots.filter((s) => s.dayOfWeek === dayIdx);
                if (daySlots.length === 0) return null;
                return (
                  <div key={day} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <h3 className="font-medium text-gray-900 mb-3">{day}</h3>
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map((slot) => (
                        <div key={slot.id} className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                          <span className="text-sm text-[#0A77FF] font-medium">
                            {slot.startTime} – {slot.endTime}
                          </span>
                          <button
                            onClick={() => deleteSlot(slot.id)}
                            className="text-blue-300 hover:text-red-500 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {slots.length === 0 && (
                <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No time slots configured</p>
                  <p className="text-sm mt-1">Add slots to allow customers to book appointments</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
