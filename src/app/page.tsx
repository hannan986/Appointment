import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  Calendar,
  Clock,
  Bell,
  CheckCircle,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Users,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "AI-powered slot management that fills idle time and eliminates scheduling conflicts automatically.",
    color: "bg-blue-50 text-[#0A77FF]",
  },
  {
    icon: Bell,
    title: "Automated Reminders",
    description: "Automatic email notifications 24 hours before appointments reduce no-shows by up to 75%.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Zap,
    title: "Instant Confirmation",
    description: "Customers receive beautiful confirmation emails the moment they book their appointment.",
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    icon: TrendingUp,
    title: "Real-time Analytics",
    description: "Live dashboard with appointment trends, customer insights, and performance metrics.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with encrypted data storage and 99.9% uptime guarantee.",
    color: "bg-red-50 text-red-600",
  },
  {
    icon: Users,
    title: "Multi-user Access",
    description: "Role-based access control for admins and customers with personalized dashboards.",
    color: "bg-teal-50 text-teal-600",
  },
];

const stats = [
  { value: "97%", label: "Reduced Wait Times" },
  { value: "75%", label: "Fewer No-Shows" },
  { value: "3x", label: "More Bookings" },
  { value: "24/7", label: "Online Booking" },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Medical Clinic Owner",
    avatar: "S",
    rating: 5,
    text: "AppointEase transformed our clinic workflow. No more phone tag — patients book online and get automatic reminders. Our no-show rate dropped from 30% to just 5%.",
  },
  {
    name: "Michael Chen",
    role: "Hair Salon Manager",
    avatar: "M",
    rating: 5,
    text: "The admin dashboard is incredible. I can see all appointments at a glance, manage staff schedules, and the automated emails keep clients informed. Best investment we've made.",
  },
  {
    name: "Emily Rodriguez",
    role: "Fitness Studio Owner",
    avatar: "E",
    rating: 5,
    text: "Setup took less than 20 minutes. Within a week we were handling 3x more bookings with zero extra effort. The automated system works like magic.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A77FF] via-[#0056CC] to-[#003d99] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Now with AI-powered scheduling
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Appointment Scheduling,{" "}
                <span className="text-yellow-300">Completely Automated</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Skip the phone calls. Let customers book online, receive instant confirmations,
                and get automated reminders — all on autopilot.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/book"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0A77FF] font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
                >
                  Book an Appointment
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
                >
                  Get Started Free
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6">
                {["No credit card required", "Setup in 5 minutes", "Free forever plan"].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-sm text-blue-100">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden lg:block animate-fade-in">
              <div className="relative">
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Today's Schedule</h3>
                    <span className="text-sm text-blue-200">April 10, 2024</span>
                  </div>
                  {[
                    { time: "9:00 AM", name: "Sarah M.", service: "Consultation", status: "CONFIRMED" },
                    { time: "10:30 AM", name: "James K.", service: "Follow-up", status: "CONFIRMED" },
                    { time: "11:00 AM", name: "Alice W.", service: "General Checkup", status: "PENDING" },
                    { time: "2:00 PM", name: "Robert J.", service: "Consultation", status: "CONFIRMED" },
                  ].map((appt, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 border-b border-white/10 last:border-0">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                        {appt.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{appt.name}</p>
                        <p className="text-xs text-blue-200">{appt.service}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">{appt.time}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${appt.status === "CONFIRMED" ? "bg-green-400/20 text-green-300" : "bg-yellow-400/20 text-yellow-300"}`}>
                          {appt.status === "CONFIRMED" ? "Confirmed" : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#0A77FF]" />
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Reminder Sent!</p>
                      <p className="text-xs text-gray-500">Sarah M. – Tomorrow 9:00 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-[#0A77FF] mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-blue-50 text-[#0A77FF] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Everything You Need
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Modern Businesses
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              From solo practitioners to enterprise teams — AppointEase handles all the scheduling complexity so you can focus on what matters.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-500">Book an appointment in under 2 minutes</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 to-blue-200 z-0" />
            {[
              { step: "1", title: "Choose a Service", desc: "Browse our service catalog and pick what you need.", icon: "🔍" },
              { step: "2", title: "Pick Date & Time", desc: "Select from available slots on the calendar.", icon: "📅" },
              { step: "3", title: "Confirm Booking", desc: "Provide your details and confirm the appointment.", icon: "✅" },
              { step: "4", title: "Get Notified", desc: "Receive instant confirmation + automated reminder.", icon: "📧" },
            ].map((item) => (
              <div key={item.step} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#0A77FF] rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg shadow-blue-200">
                  {item.icon}
                </div>
                <div className="w-7 h-7 bg-white border-2 border-[#0A77FF] text-[#0A77FF] rounded-full flex items-center justify-center text-xs font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Businesses</h2>
            <p className="text-xl text-gray-500">Join thousands of businesses that trust AppointEase</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0A77FF] rounded-full flex items-center justify-center text-white font-semibold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#0A77FF] to-[#0056CC] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Automate Your Bookings?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Start for free. No credit card required. Set up in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0A77FF] font-semibold rounded-xl hover:bg-blue-50 transition-all"
            >
              Book an Appointment
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/30 font-semibold rounded-xl hover:bg-white/20 transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#0A77FF] rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold">AppointEase</span>
            </div>
            <p className="text-sm">© {new Date().getFullYear()} AppointEase. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <Link href="/book" className="hover:text-white transition-colors">Book Now</Link>
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link href="/register" className="hover:text-white transition-colors">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
