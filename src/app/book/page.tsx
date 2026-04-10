"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Loader2,
  ArrowRight,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfDay, getDay, addMonths, subMonths } from "date-fns";

type Service = {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  color: string;
};

type TimeSlot = {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
};

const STEPS = ["Service", "Date", "Time", "Confirm"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function BookPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then(setServices)
      .catch(() => toast.error("Failed to load services"));
  }, []);

  useEffect(() => {
    if (selectedService && selectedDate) {
      setSlotsLoading(true);
      fetch(`/api/slots?serviceId=${selectedService.id}&date=${format(selectedDate, "yyyy-MM-dd")}`)
        .then((r) => r.json())
        .then(setSlots)
        .catch(() => toast.error("Failed to load time slots"))
        .finally(() => setSlotsLoading(false));
    }
  }, [selectedService, selectedDate]);

  const handleBook = async () => {
    if (!session) {
      toast.error("Please sign in to book an appointment");
      router.push(`/login?callbackUrl=/book`);
      return;
    }

    if (!selectedService || !selectedDate || !selectedSlot) return;

    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          date: format(selectedDate, "yyyy-MM-dd"),
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Booking failed");
        return;
      }

      setStep(4); // success
    } catch {
      toast.error("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calendar helpers
  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  const startDayOffset = getDay(startOfMonth(currentMonth));
  const today = startOfDay(new Date());

  // Step indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all
            ${i < step ? "bg-green-500 text-white" : i === step ? "bg-[#0A77FF] text-white" : "bg-gray-100 text-gray-400"}`}
          >
            {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
          </div>
          <span className={`text-sm hidden sm:block ${i === step ? "text-gray-900 font-medium" : "text-gray-400"}`}>
            {s}
          </span>
          {i < STEPS.length - 1 && (
            <div className={`w-8 h-0.5 ${i < step ? "bg-green-400" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h2>
            <p className="text-gray-500 mb-6">
              A confirmation email has been sent to <strong>{session?.user.email}</strong>.
              You'll also receive a reminder 24 hours before your appointment.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service</span>
                  <span className="font-semibold text-gray-900">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date</span>
                  <span className="font-semibold text-gray-900">
                    {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Time</span>
                  <span className="font-semibold text-gray-900">
                    {selectedSlot?.startTime} – {selectedSlot?.endTime}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/dashboard"
                className="flex-1 py-3 px-4 bg-[#0A77FF] text-white font-semibold rounded-xl hover:bg-[#0056CC] transition-all text-sm text-center"
              >
                View My Appointments
              </Link>
              <button
                onClick={() => {
                  setStep(0);
                  setSelectedService(null);
                  setSelectedDate(null);
                  setSelectedSlot(null);
                  setNotes("");
                }}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
              >
                Book Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
          <p className="text-gray-500">Complete the steps below to schedule your visit</p>
        </div>

        <StepIndicator />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Step 0: Select Service */}
          {step === 0 && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose a Service</h2>
              {services.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No services available at the moment</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {services.map((svc) => (
                    <button
                      key={svc.id}
                      onClick={() => setSelectedService(svc)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedService?.id === svc.id
                          ? "border-[#0A77FF] bg-blue-50"
                          : "border-gray-100 hover:border-[#0A77FF]/30 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                          style={{ background: svc.color || "#0A77FF" }}
                        >
                          {svc.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{svc.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{svc.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" /> {svc.duration} min
                            </span>
                            <span className="flex items-center gap-1 text-xs font-semibold text-[#0A77FF]">
                              <Tag className="w-3 h-3" /> ${svc.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        {selectedService?.id === svc.id && (
                          <CheckCircle className="w-5 h-5 text-[#0A77FF] flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 1: Select Date */}
          {step === 1 && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pick a Date</h2>
              <div className="max-w-sm mx-auto">
                {/* Month header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <h3 className="font-semibold text-gray-900">
                    {format(currentMonth, "MMMM yyyy")}
                  </h3>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Day names */}
                <div className="grid grid-cols-7 mb-2">
                  {DAY_NAMES.map((d) => (
                    <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: startDayOffset }).map((_, i) => (
                    <div key={`e${i}`} />
                  ))}
                  {monthDays.map((day) => {
                    const isPast = isBefore(day, today);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, today);
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => !isPast && setSelectedDate(day)}
                        disabled={isPast}
                        className={`aspect-square flex items-center justify-center text-sm rounded-xl font-medium transition-all
                          ${isSelected ? "bg-[#0A77FF] text-white shadow-md shadow-blue-200" : ""}
                          ${!isSelected && isToday ? "bg-blue-50 text-[#0A77FF] font-bold" : ""}
                          ${!isSelected && !isToday && !isPast ? "hover:bg-gray-100 text-gray-700" : ""}
                          ${isPast ? "text-gray-300 cursor-not-allowed" : "cursor-pointer"}
                        `}
                      >
                        {format(day, "d")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select Time */}
          {step === 2 && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Choose a Time</h2>
              {selectedDate && (
                <p className="text-sm text-gray-500 mb-4">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </p>
              )}
              {slotsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0A77FF]" />
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="font-medium text-gray-500">No slots available</p>
                  <p className="text-sm mt-1">Try selecting a different date</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => slot.available && setSelectedSlot(slot)}
                      disabled={!slot.available}
                      className={`py-3 px-2 rounded-xl text-sm font-medium transition-all border-2
                        ${selectedSlot?.id === slot.id
                          ? "border-[#0A77FF] bg-[#0A77FF] text-white"
                          : slot.available
                          ? "border-gray-100 hover:border-[#0A77FF] text-gray-700 hover:text-[#0A77FF]"
                          : "border-gray-100 text-gray-300 cursor-not-allowed line-through bg-gray-50"
                        }`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirm Your Booking</h2>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-5 border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Service</span>
                    <span className="font-semibold text-gray-900">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-semibold text-gray-900">{selectedService?.duration} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date</span>
                    <span className="font-semibold text-gray-900">
                      {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Time</span>
                    <span className="font-semibold text-gray-900">
                      {selectedSlot?.startTime} – {selectedSlot?.endTime}
                    </span>
                  </div>
                  <div className="border-t border-blue-200 pt-3 flex justify-between">
                    <span className="text-gray-700 font-medium">Total</span>
                    <span className="text-xl font-bold text-[#0A77FF]">${selectedService?.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any special requests or information for your appointment..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A77FF] focus:border-transparent resize-none placeholder:text-gray-400"
                />
              </div>

              {!session && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Sign in required</strong> — You need to be signed in to complete your booking.
                    Your progress will be saved.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="px-6 pb-6 flex justify-between items-center">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 0 && !selectedService) ||
                  (step === 1 && !selectedDate) ||
                  (step === 2 && !selectedSlot)
                }
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0A77FF] text-white rounded-xl text-sm font-semibold hover:bg-[#0056CC] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleBook}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {loading ? "Booking..." : "Confirm Booking"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
