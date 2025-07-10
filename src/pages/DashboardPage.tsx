"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Video,
  Users,
  XCircle,
  Trash2,
  X,
  CheckCircle,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import Navbar from "../components/Navbar";
import PageTransition from "../components/PageTransition";
import {
  appointmentManager,
  AppointmentData,
} from "../utils/appointmentManager";

// Appointment type
interface Appointment {
  id: string;
  consultancyName: string;
  category: string;
  date: string;
  time: string;
  location: string;
  mode: "Online" | "Offline";
  status: "Confirmed" | "Pending" | "Cancelled";
}

// Dummy data
const dummyAppointments: Appointment[] = [
  {
    id: "1",
    consultancyName: "Career Boosters",
    category: "Career Consultancy",
    date: "March 10, 2025",
    time: "2:00 PM",
    location: "New York, USA",
    mode: "Online",
    status: "Confirmed",
  },
  {
    id: "2",
    consultancyName: "Wealth Advisors",
    category: "Financial Consultancy",
    date: "March 15, 2025",
    time: "4:30 PM",
    location: "San Francisco, USA",
    mode: "Offline",
    status: "Pending",
  },
  {
    id: "3",
    consultancyName: "Legal Experts",
    category: "Legal Consultancy",
    date: "March 18, 2025",
    time: "11:00 AM",
    location: "London, UK",
    mode: "Online",
    status: "Cancelled",
  },
];

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user's appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (user?.id) {
        try {
          // Fetch appointments where user is the client
          const response = await fetch(`/api/appointments?userId=${user.id}`);
          const result = await response.json();

          console.log("User appointments response:", result);
          console.log("Appointments data:", result.data);

          if (result.success) {
            console.log("Setting appointments:", result.data);
            setAppointments(result.data || []);
          } else {
            console.log("No success, setting empty array");
            setAppointments([]);
          }
        } catch (error) {
          console.error("Error fetching appointments:", error);
          setAppointments([]);
        }
      }
      setLoading(false);
    };

    fetchAppointments();
  }, [user?.id]);
  const [modal, setModal] = useState<{
    id: string | null;
    action: "cancel" | "remove" | null;
  }>({ id: null, action: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // If user is not loaded yet, show loading
  if (!isLoaded) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </PageTransition>
    );
  }

  // Remove user check - allow dashboard access

  // If user is consultancy, redirect to consultancy dashboard
  if (user && user.publicMetadata?.role === "consultancy") {
    router.replace("/consultancy-dashboard");
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl text-gray-600">
            Redirecting to consultancy dashboard...
          </div>
        </div>
      </PageTransition>
    );
  }

  const userName =
    user?.fullName ||
    user?.firstName ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "User";

  // Filter appointments
  const filteredAppointments = (appointments || []).filter((appointment) => {
    const matchesSearch =
      searchTerm === "" ||
      (appointment as any).consultancyName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      false;
    const matchesFilter =
      filterStatus === "all" || appointment.status === filterStatus;
    console.log(
      "Filtering appointment:",
      appointment,
      "Search match:",
      matchesSearch,
      "Filter match:",
      matchesFilter
    );
    return matchesSearch && matchesFilter;
  });

  // Stats
  const stats = {
    total: (appointments || []).length,
    confirmed: (appointments || []).filter((a) => a.status === "confirmed")
      .length,
    pending: (appointments || []).filter((a) => a.status === "pending").length,
    cancelled: (appointments || []).filter((a) => a.status === "cancelled")
      .length,
  };

  // Handle appointment cancellation
  const cancelAppointment = async (id: string) => {
    try {
      const success = await appointmentManager.cancelAppointment(id);
      if (success && user?.id) {
        // Refresh appointments list
        const response = await fetch(`/api/appointments?userId=${user.id}`);
        const result = await response.json();
        if (result.success) {
          setAppointments(result.data || []);
        }
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
    setModal({ id: null, action: null });
  };

  // Handle appointment removal
  const removeAppointment = async (id: string) => {
    try {
      // First cancel the appointment, then delete it
      await appointmentManager.cancelAppointment(id);
      const success = await appointmentManager.deleteAppointment(id);
      if (success) {
        // Refresh appointments list
        if (user?.id) {
          const response = await fetch(`/api/appointments?userId=${user.id}`);
          const result = await response.json();
          if (result.success) {
            setAppointments(result.data || []);
          }
        }
      }
    } catch (error) {
      console.error("Error removing appointment:", error);
    }
    setModal({ id: null, action: null });
  };

  return (
    <PageTransition>
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        {/* Dashboard Header */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold text-gray-800">
              Welcome back, {userName}!
            </h2>
            <p className="text-lg text-gray-600 mt-1">
              View your booked appointments.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 mb-8">
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total}
                </p>
              </div>
              <CalendarDays className="w-8 h-8 text-indigo-500" />
            </div>
          </motion.div>
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Confirmed</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.confirmed}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.pending}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </motion.div>
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Cancelled</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.cancelled}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search appointments..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => router.push("/categories")}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> New
              </button>
            </div>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="mt-10">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            Your Appointments ({filteredAppointments.length})
          </h3>

          <AnimatePresence>
            {filteredAppointments.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAppointments.map((appointment) => (
                  <motion.div
                    key={appointment._id}
                    className={`relative bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200 hover:scale-105 transition-all ${
                      appointment.status === "cancelled" ? "opacity-60" : ""
                    }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{
                      opacity: 0,
                      scale: 0.8,
                      transition: { duration: 0.3 },
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <h4 className="text-xl font-semibold text-gray-900">
                      {(appointment as any).consultancyName || "Appointment"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {appointment.message || "Career Growth Consultation"}
                    </p>

                    {/* Date and Time */}
                    <div className="flex items-center gap-2 text-gray-600 mt-2">
                      <CalendarDays className="w-5 h-5 text-blue-500" />
                      <p className="text-lg">
                        {new Date(
                          appointment.appointmentDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <Clock className="w-5 h-5 text-purple-500" />
                      <p className="text-lg">{appointment.appointmentTime}</p>
                    </div>

                    {/* Meeting Type */}
                    <div className="flex items-center gap-2 text-gray-600 mt-2">
                      <Video className="w-5 h-5 text-indigo-500" />
                      <p className="text-sm">
                        {(appointment as any).appointmentType === "online"
                          ? "Online Meeting"
                          : (appointment as any).appointmentType === "offline"
                          ? "Office Visit"
                          : "Online Meeting"}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="mt-3 flex items-center gap-2">
                      {appointment.status === "confirmed" ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : appointment.status === "pending" ? (
                        <Clock className="w-6 h-6 text-yellow-500" />
                      ) : appointment.status === "completed" ? (
                        <CheckCircle className="w-6 h-6 text-blue-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                      <p
                        className={`text-lg font-semibold capitalize ${
                          appointment.status === "confirmed"
                            ? "text-green-600"
                            : appointment.status === "pending"
                            ? "text-yellow-600"
                            : appointment.status === "completed"
                            ? "text-blue-600"
                            : "text-red-600"
                        }`}
                      >
                        {appointment.status}
                      </p>
                    </div>

                    {/* Buttons */}
                    <div className="mt-4 flex gap-3">
                      {appointment.status !== "cancelled" &&
                        appointment.status !== "completed" && (
                          <button
                            onClick={() =>
                              setModal({
                                id: appointment._id,
                                action: "cancel",
                              })
                            }
                            className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 flex items-center gap-1"
                          >
                            <X className="w-4 h-4" /> Cancel
                          </button>
                        )}
                      <button
                        onClick={() =>
                          setModal({ id: appointment._id, action: "remove" })
                        }
                        className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                  {searchTerm || filterStatus !== "all"
                    ? "No appointments match your search."
                    : "No appointments yet."}
                </p>
                <button
                  onClick={() => router.push("/categories")}
                  className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Book Your First Appointment
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {modal.id && (
        <motion.div
          className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg">
              Are you sure you want to {modal.action} this appointment?
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() =>
                  modal.action === "cancel"
                    ? cancelAppointment(modal.id!)
                    : removeAppointment(modal.id!)
                }
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Yes
              </button>
              <button
                onClick={() => setModal({ id: null, action: null })}
                className="bg-gray-300 px-4 py-2 rounded-lg"
              >
                No
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </PageTransition>
  );
};

export default DashboardPage;
