"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";

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
import Modal from "../Modal";
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
    if (
      isAppointmentExpired(appointment) &&
      (appointment.status === "confirmed" || appointment.status === "pending")
    ) {
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
    const matchesFilter =
      filterStatus === "all" || displayStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(
    filteredAppointments.length / appointmentsPerPage
  );
  const startIndex = (currentPage - 1) * appointmentsPerPage;
  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + appointmentsPerPage
  );

  // Stats with expiration logic
  const stats = {
    total: (appointments || []).length,
    confirmed: (appointments || []).filter(
      (a) => getDisplayStatus(a) === "confirmed"
    ).length,
    pending: (appointments || []).filter(
      (a) => getDisplayStatus(a) === "pending"
    ).length,
    cancelled: (appointments || []).filter((a) => {
      const status = getDisplayStatus(a);
      return status === "cancelled" || status === "expired";
    }).length,
    completed: (appointments || []).filter(
      (a) => getDisplayStatus(a) === "completed"
    ).length,
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
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-all duration-300">
          <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
            {/* Dashboard Header - Welcome Box with Glow */}
            <motion.div
              className="bg-white dark:bg-dark-card rounded-xl shadow-lg dark:shadow-neon-lg border border-gray-200 dark:border-neon-blue/30 p-4 md:p-8 flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8 transition-all duration-300 dark:ring-1 dark:ring-neon-blue/20"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h2 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 transition-all duration-300">
                  Welcome back, {userName}!
                </h2>
                <p className="text-sm md:text-lg text-gray-600 dark:text-gray-400 mt-1 transition-all duration-300">
                  View your booked appointments.
                </p>
              </div>
              <div className="md:hidden">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards - No Glow */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 mt-6 md:mt-8 mb-6 md:mb-8">
              <motion.div
                className="bg-white dark:bg-dark-card rounded-xl shadow-md border border-gray-200 dark:border-dark-border p-3 md:p-6 border-l-4 border-indigo-500 dark:border-l-neon-blue transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm transition-all duration-300">Total</p>
                    <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100 transition-all duration-300">
                      {stats.total}
                    </p>
                  </div>
                  <CalendarDays className="w-6 h-6 md:w-8 md:h-8 text-indigo-500 dark:text-neon-blue transition-all duration-300" />
                </div>
              </motion.div>
              <motion.div
                className="bg-white dark:bg-dark-card rounded-xl shadow-md border border-gray-200 dark:border-dark-border p-3 md:p-6 border-l-4 border-green-500 dark:border-l-green-400 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm transition-all duration-300">
                      Confirmed
                    </p>
                    <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100 transition-all duration-300">
                      {stats.confirmed}
                    </p>
                  </div>
                  <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-500 dark:text-green-400" />
                </div>
              </motion.div>
              <motion.div
                className="bg-white dark:bg-dark-card rounded-xl shadow-md border border-gray-200 dark:border-dark-border p-3 md:p-6 border-l-4 border-yellow-500 dark:border-l-yellow-400 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm transition-all duration-300">Pending</p>
                    <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100 transition-all duration-300">
                      {stats.pending}
                    </p>
                  </div>
                  <Clock className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 dark:text-yellow-400" />
                </div>
              </motion.div>
              <motion.div
                className="bg-white dark:bg-dark-card rounded-xl shadow-md border border-gray-200 dark:border-dark-border p-3 md:p-6 border-l-4 border-blue-500 dark:border-l-blue-400 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm transition-all duration-300">
                      Completed
                    </p>
                    <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100 transition-all duration-300">
                      {stats.completed}
                    </p>
                  </div>
                  <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-blue-500 dark:text-blue-400" />
                </div>
              </motion.div>
              <motion.div
                className="bg-white dark:bg-dark-card rounded-xl shadow-md border border-gray-200 dark:border-dark-border p-3 md:p-6 border-l-4 border-red-500 dark:border-l-red-400 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm transition-all duration-300">
                      Cancelled
                    </p>
                    <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100 transition-all duration-300">
                      {stats.cancelled}
                    </p>
                  </div>
                  <XCircle className="w-6 h-6 md:w-8 md:h-8 text-red-500 dark:text-red-400" />
                </div>
              </motion.div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-md border border-gray-200 dark:border-dark-border p-4 md:p-6 mb-6 md:mb-8 transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-between">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <select
                    className="px-3 md:px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 transition-all duration-300"
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
                    className="bg-indigo-500 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <Plus className="w-4 h-4" /> New
                  </button>
                </div>
              </div>
            </div>

            {/* Appointments Section */}
            <div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4 md:mb-6 transition-all duration-300">
                Your Appointments ({filteredAppointments.length})
              </h3>

              {paginatedAppointments.length > 0 ? (
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 transition-opacity duration-150 ${
                    pageTransition ? "opacity-50" : "opacity-100"
                  }`}
                >
                  {paginatedAppointments.map((appointment, index) => {
                    const displayStatus = getDisplayStatus(appointment);

                    return (
                      <motion.div
                        key={appointment._id}
                        className="bg-white dark:bg-dark-card p-4 md:p-6 rounded-2xl shadow-md border border-gray-200 dark:border-dark-border hover:scale-105 transition-all duration-300"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <h4 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 transition-all duration-300">
                          {(appointment as any).consultancyName ||
                            "Appointment"}
                        </h4>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-3 md:mb-4 transition-all duration-300">
                          {appointment.message || "Consultation"}
                        </p>

                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2 text-sm md:text-base transition-all duration-300">
                          <CalendarDays className="w-4 h-4 md:w-5 md:h-5 text-blue-500 dark:text-blue-400" />
                          <p>
                            {new Date(
                              appointment.appointmentDate
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2 text-sm md:text-base transition-all duration-300">
                          <Clock className="w-4 h-4 md:w-5 md:h-5 text-purple-500 dark:text-purple-400" />
                          <p>{appointment.appointmentTime}</p>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4 text-sm md:text-base transition-all duration-300">
                          <Video className="w-4 h-4 md:w-5 md:h-5 text-indigo-500 dark:text-indigo-400" />
                          <p>
                            {(appointment as any).appointmentType === "online"
                              ? "Online Meeting"
                              : "Office Visit"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          {displayStatus === "confirmed" && (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          )}
                          {displayStatus === "pending" && (
                            <Clock className="w-6 h-6 text-yellow-500" />
                          )}
                          {displayStatus === "completed" && (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          )}
                          {displayStatus === "expired" && (
                            <XCircle className="w-6 h-6 text-gray-500" />
                          )}
                          {displayStatus === "cancelled" && (
                            <XCircle className="w-6 h-6 text-red-500" />
                          )}

                          <p
                            className={`text-sm md:text-lg font-semibold capitalize transition-all duration-300 ${
                              displayStatus === "confirmed"
                                ? "text-green-600 dark:text-green-400"
                                : displayStatus === "pending"
                                  ? "text-yellow-600 dark:text-yellow-400"
                                  : displayStatus === "completed"
                                    ? "text-green-600 dark:text-green-400"
                                    : displayStatus === "expired"
                                      ? "text-gray-600 dark:text-gray-400"
                                      : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {displayStatus}
                          </p>
                        </div>

                        {displayStatus === "completed" && (
                          <div className="text-center py-2">
                            <p className="text-green-600 dark:text-green-400 font-medium transition-all duration-300">
                              ✅ Consultation Completed
                            </p>
                          </div>
                        )}

                        {displayStatus === "expired" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  id: appointment._id,
                                  action: "remove",
                                  name:
                                    (appointment as any).consultancyName ||
                                    "Appointment",
                                })
                              }
                              disabled={actionLoading === appointment._id}
                              className="w-full bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        )}

                        {displayStatus !== "completed" &&
                          displayStatus !== "expired" && (
                            <div className="flex flex-col sm:flex-row gap-2">
                              {displayStatus !== "cancelled" && (
                                <button
                                  onClick={() =>
                                    setConfirmModal({
                                      id: appointment._id,
                                      action: "cancel",
                                      name:
                                        (appointment as any).consultancyName ||
                                        "Appointment",
                                    })
                                  }
                                  disabled={actionLoading === appointment._id}
                                  className="flex-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-orange-100 dark:hover:bg-orange-800/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
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
                                    name:
                                      (appointment as any).consultancyName ||
                                      "Appointment",
                                  })
                                }
                                disabled={actionLoading === appointment._id}
                                className="flex-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
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
                  <CalendarDays className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 transition-all duration-300" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-2 transition-all duration-300">
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
                      className="px-3 py-2 rounded-lg bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => changePage(page)}
                          disabled={pageTransition}
                          className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                            currentPage === page
                              ? "bg-indigo-500 text-white"
                              : "bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-surface"
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
                      className="px-3 py-2 rounded-lg bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Modal */}
          <Modal
            isOpen={!!confirmModal}
            onClose={() => setConfirmModal(null)}
            title={confirmModal?.action === "cancel" ? "Withdraw Appointment?" : "Remove Appointment?"}
            showCloseButton={false}
          >
            <p className="text-gray-600 dark:text-gray-400 mb-6 transition-all duration-300">
              {confirmModal?.action === "cancel"
                ? `Cancel your appointment with ${confirmModal?.name}?`
                : `Permanently remove ${confirmModal?.name} from your list?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmModal) {
                    executeAction(confirmModal.id, confirmModal.action);
                  }
                }}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  confirmModal?.action === "cancel"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-gray-500 hover:bg-gray-600"
                }`}
              >
                {confirmModal?.action === "cancel" ? "Withdraw" : "Remove"}
              </button>
            </div>
          </Modal>
        </div>
      </PageTransition>
    </SmartPageWrapper>
  );
};

export default DashboardPage;
