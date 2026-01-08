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
  CheckCircle,
  Plus,
  Search,
  Users,
} from "lucide-react";
import Navbar from "../Navbar";
import PageTransition from "../PageTransition";
import GlobalLoader from "../GlobalLoader";
import { useDataLoading } from "../../hooks/useDataLoading";

const ConsultancyDashboardPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 9;
  
  // Data loading state
  const dashboardLoading = useDataLoading({ 
    dataType: 'consultancy-appointments',
    minLoadingTime: 700 
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/appointments?consultancyId=${user.id}`);
          const result = await response.json();
          if (result.success) {
            setAppointments(result.data || []);
            dashboardLoading.setDataLoaded(true);
          } else {
            setAppointments([]);
            dashboardLoading.setDataLoaded(true);
          }
        } catch (error) {
          console.error("Error fetching appointments:", error);
          setAppointments([]);
          dashboardLoading.setError('Failed to load appointments');
        }
      } else {
        dashboardLoading.setDataLoaded(true);
      }
    };

    if (isLoaded) {
      fetchAppointments();
    }
  }, [user?.id, isLoaded]);

  if (!isLoaded) return null;

  if (user && user.publicMetadata?.role !== "consultancy") {
    router.replace("/dashboard");
    return null;
  }

  const userName = user?.fullName || user?.firstName || "Consultant";

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch = searchTerm === "" || 
      appointment.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || appointment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);
  const startIndex = (currentPage - 1) * appointmentsPerPage;
  const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + appointmentsPerPage);

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    pending: appointments.filter(a => a.status === "pending").length,
    completed: appointments.filter(a => a.status === "completed").length,
  };

  const createMeeting = async (appointmentId: string) => {
    try {
      const response = await fetch('/api/meetings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          consultancyId: user?.id,
          appointmentId,
          createdBy: 'consultant'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Refresh appointments to get updated data
        const refreshResponse = await fetch(`/api/appointments?consultancyId=${user?.id}`);
        const refreshResult = await refreshResponse.json();
        if (refreshResult.success) {
          setAppointments(refreshResult.data || []);
        }
        
        // Open meeting as host with 1-hour limit
        const url = `/meeting/${data.meetingId}?role=consultant&name=${encodeURIComponent(userName)}&userId=${user?.id}&duration=60`;
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Failed to create meeting:', error);
    }
  };

  const joinMeeting = (meetingId: string) => {
    const url = `/meeting/${meetingId}?role=consultant&name=${encodeURIComponent(userName)}&userId=${user?.id}`;
    window.open(url, '_blank');
  };

  return (
    <GlobalLoader 
      dataLoadingState={{
        isDataLoaded: dashboardLoading.isDataLoaded,
        dataType: 'consultancy-appointments'
      }}
    >
      <PageTransition>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-all duration-300">
          <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
            
            {/* Header */}
            <motion.div
              className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-4 md:p-8 flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h2 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                  Welcome, {userName}!
                </h2>
                <p className="text-sm md:text-lg text-gray-600 dark:text-gray-400 mt-1">
                  Manage your client appointments and meetings.
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
              <motion.div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-3 md:p-6 border-l-4 border-indigo-500" whileHover={{ scale: 1.02 }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Total</p>
                    <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.total}</p>
                  </div>
                  <Users className="w-6 h-6 md:w-8 md:h-8 text-indigo-500" />
                </div>
              </motion.div>
              
              <motion.div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-3 md:p-6 border-l-4 border-green-500" whileHover={{ scale: 1.02 }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Confirmed</p>
                    <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.confirmed}</p>
                  </div>
                  <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
                </div>
              </motion.div>
              
              <motion.div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-3 md:p-6 border-l-4 border-yellow-500" whileHover={{ scale: 1.02 }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Pending</p>
                    <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.pending}</p>
                  </div>
                  <Clock className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
                </div>
              </motion.div>
              
              <motion.div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-3 md:p-6 border-l-4 border-blue-500" whileHover={{ scale: 1.02 }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Completed</p>
                    <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.completed}</p>
                  </div>
                  <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
                </div>
              </motion.div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-4 md:p-6 mb-6 md:mb-8">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-between">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-3 md:px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Appointments */}
            <div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4 md:mb-6">
                Client Appointments ({filteredAppointments.length})
              </h3>

              {paginatedAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {paginatedAppointments.map((appointment, index) => (
                    <motion.div
                      key={appointment._id}
                      className="bg-white dark:bg-dark-card p-4 md:p-6 rounded-2xl shadow-md border hover:scale-105 transition-all duration-300"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <h4 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {appointment.clientName}
                      </h4>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {appointment.message}
                      </p>

                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2 text-sm">
                        <CalendarDays className="w-4 h-4 text-blue-500" />
                        <p>{new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2 text-sm">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <p>{appointment.appointmentTime}</p>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4 text-sm">
                        <Video className="w-4 h-4 text-indigo-500" />
                        <p>{appointment.appointmentType === "online" ? "Online Meeting" : "Office Visit"}</p>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>

                      {appointment.status === "confirmed" && appointment.appointmentType === "online" && (() => {
                        const now = new Date();
                        const aptDate = new Date(appointment.appointmentDate);
                        const aptTime = appointment.appointmentTime;
                        const [time, period] = (aptTime || "").split(" ");
                        const [hours, minutes] = time.split(":").map(Number);
                        let hour24 = hours;
                        if (period === "PM" && hours !== 12) hour24 += 12;
                        if (period === "AM" && hours === 12) hour24 = 0;
                        aptDate.setHours(hour24, minutes || 0);
                        
                        const meetingStartTime = new Date(aptDate.getTime() - 10 * 60 * 1000);
                        const canStartMeeting = now >= meetingStartTime && now <= aptDate;
                        
                        return canStartMeeting ? (
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-green-800 dark:text-green-300">Host Meeting</span>
                              <Video className="w-4 h-4 text-green-600" />
                            </div>
                            
                            {appointment.meetingId ? (
                              <div>
                                <p className="text-xs text-green-600 mb-2">Meeting ID: {appointment.meetingId}</p>
                                <button
                                  onClick={() => joinMeeting(appointment.meetingId)}
                                  className="w-full bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                >
                                  <Video className="w-4 h-4" />
                                  Join Meeting
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => createMeeting(appointment._id)}
                                className="w-full bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                              >
                                <Video className="w-4 h-4" />
                                Start Meeting
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Meeting Scheduled</span>
                              <Clock className="w-4 h-4 text-gray-500" />
                            </div>
                            <p className="text-xs text-gray-500">
                              Available 10 minutes before: {meetingStartTime.toLocaleTimeString()}
                            </p>
                          </div>
                        );
                      })()}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No appointments found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
    </GlobalLoader>
  );
};

export default ConsultancyDashboardPage;