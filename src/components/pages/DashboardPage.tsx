"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useScrollLock } from "../../hooks/useScrollLock";
import {
  CalendarDays,
  Clock,
  Video,
  XCircle,
  Trash2,
  X,
  CheckCircle,
  Plus,
  Search,
} from "lucide-react";
import Navbar from "../Navbar";
import PageTransition from "../PageTransition";
import SmartPageWrapper from "../SmartPageWrapper";
import {
  appointmentManager,
  AppointmentData,
} from "../../utils/appointmentManager";

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    id: string;
    action: "cancel" | "remove";
    name: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageTransition, setPageTransition] = useState(false);
  const appointmentsPerPage = 9;

  // Lock scroll when confirmation modal is open
  useScrollLock(!!confirmModal);



  // Check if appointment is expired
  const isAppointmentExpired = (appointment: AppointmentData) => {
    const now = new Date();
    const aptDate = new Date(appointment.appointmentDate);
    const aptTime = appointment.appointmentTime;
    const [time, period] = (aptTime || "").split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let hour24 = hours;
    if (period === "PM" && hours !== 12) hour24 += 12;
    if (period === "AM" && hours === 12) hour24 = 0;
    aptDate.setHours(hour24, minutes || 0);
    return aptDate < now;
  };

  // Get display status with expiration logic
  const getDisplayStatus = (appointment: AppointmentData) => {
    if (appointment.status === "completed") return "completed";
    if (appointment.status === "cancelled") return "cancelled";
    if (isAppointmentExpired(appointment) && (appointment.status === "confirmed" || appointment.status === "pending")) {
      return "expired";
    }
    return appointment.status;
  };

  // Load user's appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/appointments?userId=${user.id}`);
          const result = await response.json();
          if (result.success) {
            setAppointments(result.data || []);
          } else {
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



  if (!isLoaded) {
    return null;
  }

  if (user && user.publicMetadata?.role === "consultancy") {
    router.replace("/consultancy-dashboard");
    return null;
  }

  const userName = user?.fullName || user?.firstName || "User";

  // Filter and paginate appointments
  const filteredAppointments = (appointments || []).filter((appointment) => {
    const matchesSearch =
      searchTerm === "" ||
      (appointment as any).consultancyName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      false;
    const displayStatus = getDisplayStatus(appointment);
    const matchesFilter = filterStatus === "all" || displayStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);
  const startIndex = (currentPage - 1) * appointmentsPerPage;
  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + appointmentsPerPage
  );

  // Stats with expiration logic
  const stats = {
    total: (appointments || []).length,
    confirmed: (appointments || []).filter((a) => getDisplayStatus(a) === "confirmed").length,
    pending: (appointments || []).filter((a) => getDisplayStatus(a) === "pending").length,
    cancelled: (appointments || []).filter((a) => {
      const status = getDisplayStatus(a);
      return status === "cancelled" || status === "expired";
    }).length,
    completed: (appointments || []).filter((a) => getDisplayStatus(a) === "completed").length,
  };

  // Smooth page change
  const changePage = (newPage: number) => {
    setPageTransition(true);
    setTimeout(() => {
      setCurrentPage(newPage);
      setPageTransition(false);
    }, 150);
  };

  // Handle appointment actions
  const executeAction = async (id: string, action: "cancel" | "remove") => {
    setActionLoading(id);
    try {
      if (action === "cancel") {
        const success = await appointmentManager.cancelAppointment(id);
        if (success && user?.id) {
          const response = await fetch(`/api/appointments?userId=${user.id}`);
          const result = await response.json();
          if (result.success) {
            setAppointments(result.data || []);
          }
        }
      } else {
        const response = await fetch(`/api/appointments/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();
        if (result.success) {
          setAppointments((prev) => prev.filter((apt) => apt._id !== id));
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  return (
    <SmartPageWrapper loadingMessage="📊 Loading your dashboard...">
      <PageTransition>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-6 py-12">
            {/* Dashboard Header */}
            <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex items-center justify-between mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-8 mb-8">
              <motion.div
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
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
                    <p className="text-2xl font-bold text-gray-800">{stats.confirmed}</p>
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
                    <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </motion.div>
              <motion.div
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Completed</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.completed}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-500" />
                </div>
              </motion.div>
              <motion.div
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Cancelled</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.cancelled}</p>
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
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>

                    <option value="expired">Expired</option>
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
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                Your Appointments ({filteredAppointments.length})
              </h3>

              {paginatedAppointments.length > 0 ? (
                <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-150 ${
                  pageTransition ? "opacity-50" : "opacity-100"
                }`}>
                  {paginatedAppointments.map((appointment, index) => {
                    const displayStatus = getDisplayStatus(appointment);
                    
                    return (
                      <motion.div
                        key={appointment._id}
                        className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:scale-105 transition-all"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <h4 className="text-xl font-semibold text-gray-900">
                          {(appointment as any).consultancyName || "Appointment"}
                        </h4>
                        <p className="text-sm text-gray-500 mb-4">
                          {appointment.message || "Consultation"}
                        </p>

                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <CalendarDays className="w-5 h-5 text-blue-500" />
                          <p>{new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <Clock className="w-5 h-5 text-purple-500" />
                          <p>{appointment.appointmentTime}</p>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 mb-4">
                          <Video className="w-5 h-5 text-indigo-500" />
                          <p>{(appointment as any).appointmentType === "online" ? "Online Meeting" : "Office Visit"}</p>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          {displayStatus === "confirmed" && <CheckCircle className="w-6 h-6 text-green-500" />}
                          {displayStatus === "pending" && <Clock className="w-6 h-6 text-yellow-500" />}
                          {displayStatus === "completed" && <CheckCircle className="w-6 h-6 text-green-500" />}

                          {displayStatus === "expired" && <XCircle className="w-6 h-6 text-gray-500" />}
                          {displayStatus === "cancelled" && <XCircle className="w-6 h-6 text-red-500" />}
                          
                          <p className={`text-lg font-semibold capitalize ${
                            displayStatus === "confirmed" ? "text-green-600" :
                            displayStatus === "pending" ? "text-yellow-600" :
                            displayStatus === "completed" ? "text-green-600" :

                            displayStatus === "expired" ? "text-gray-600" : "text-red-600"
                          }`}>
                            {displayStatus}
                          </p>
                        </div>

                        {displayStatus === "completed" && (
                          <div className="text-center py-2">
                            <p className="text-green-600 font-medium">✅ Consultation Completed</p>
                          </div>
                        )}

                        {displayStatus === "expired" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  id: appointment._id,
                                  action: "remove",
                                  name: (appointment as any).consultancyName || "Appointment",
                                })
                              }
                              disabled={actionLoading === appointment._id}
                              className="w-full bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        )}

                        {displayStatus !== "completed" && displayStatus !== "expired" && (
                          <div className="flex gap-2">
                            {displayStatus !== "cancelled" && (
                              <button
                                onClick={() =>
                                  setConfirmModal({
                                    id: appointment._id,
                                    action: "cancel",
                                    name: (appointment as any).consultancyName || "Appointment",
                                  })
                                }
                                disabled={actionLoading === appointment._id}
                                className="flex-1 bg-orange-50 text-orange-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                <X className="w-4 h-4" />
                                Withdraw
                              </button>
                            )}

                            <button
                              onClick={() =>
                                setConfirmModal({
                                  id: appointment._id,
                                  action: "remove",
                                  name: (appointment as any).consultancyName || "Appointment",
                                })
                              }
                              disabled={actionLoading === appointment._id}
                              className="flex-1 bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changePage(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1 || pageTransition}
                      className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => changePage(page)}
                          disabled={pageTransition}
                          className={`px-3 py-2 rounded-lg transition-all ${
                            currentPage === page
                              ? "bg-indigo-500 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          } disabled:opacity-50`}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      onClick={() =>
                        changePage(Math.min(currentPage + 1, totalPages))
                      }
                      disabled={currentPage === totalPages || pageTransition}
                      className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Modal */}
          {confirmModal && (
            <motion.div
              className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50"
              style={{
                position: 'fixed',
                top: `${typeof window !== "undefined" ? window.scrollY : 0}px`,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                minHeight: '100vh',
                minWidth: '100vw'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(null)}
            >
              <motion.div
                className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                <motion.h3
                  className="text-lg font-semibold mb-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                >
                  {confirmModal.action === "cancel" ? "Withdraw Appointment?" : "Remove Appointment?"}
                </motion.h3>
                <motion.p
                  className="text-gray-600 mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  {confirmModal.action === "cancel"
                    ? `Cancel your appointment with ${confirmModal.name}?`
                    : `Permanently remove ${confirmModal.name} from your list?`}
                </motion.p>
                <motion.div
                  className="flex gap-3"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <button
                    onClick={() => setConfirmModal(null)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      executeAction(confirmModal.id, confirmModal.action);
                      setConfirmModal(null);
                    }}
                    className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                      confirmModal.action === "cancel" ? "bg-red-500 hover:bg-red-600" : "bg-gray-500 hover:bg-gray-600"
                    }`}
                  >
                    {confirmModal.action === "cancel" ? "Withdraw" : "Remove"}
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </PageTransition>
    </SmartPageWrapper>
  );
};

export default DashboardPage;