"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import {
  Settings,
  Calendar,
  Users,
  Edit,
  Eye,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import ConsultancyMeetingScheduler from '../ConsultancyMeetingScheduler';
import { getConsultancyProfile } from "../../utils/consultancyUtils";
import Modal from "../Modal";
import ThemeToggle from "../ThemeToggle";

interface Appointment {
  _id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType?: "online" | "offline";
  status: "confirmed" | "pending" | "completed" | "cancelled" | "expired";
  message?: string;
  consultancyId: string;
  userId: string;
}

// Removed mock appointments - using real data from API

const ConsultancyAdminPage: React.FC = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showProfileViews, setShowProfileViews] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedDateAppointments, setSelectedDateAppointments] = useState<any[]>([]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [currentAppointmentPage, setCurrentAppointmentPage] = useState(1);
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [navigatingToEdit, setNavigatingToEdit] = useState(false);
  const appointmentsPerPage = 9;
  const [profileViewsData, setProfileViewsData] = useState({
    totalViews: 0,
    todayViews: 0,
    weekViews: 0,
    growth: 0
  });

  useEffect(() => {
    setProfileViewsData({
      totalViews: Math.floor(Math.random() * 500) + 200,
      todayViews: Math.floor(Math.random() * 50) + 10,
      weekViews: Math.floor(Math.random() * 100) + 50,
      growth: Math.floor(Math.random() * 30) + 5
    });
  }, []);

  // Remove loading overlay
  useEffect(() => {
    const overlay = document.querySelector('.page-loading-overlay');
    if (overlay) {
      setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 300);
      }, 800);
    }
  }, []);



  const updateAppointmentStatus = async (
    appointmentId: string,
    newStatus: "confirmed" | "pending" | "completed" | "cancelled" | "expired"
  ) => {
    try {
      console.log('Updating appointment:', appointmentId, 'to status:', newStatus);
      
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response result:', result);

      if (result.success) {
        setAppointments((prev) =>
          prev.map((apt) => {
            if (apt._id === appointmentId) {
              return { ...apt, status: newStatus };
            }
            return apt;
          })
        );
        alert(`Appointment ${newStatus} successfully!`);
      } else {
        console.error('API returned error:', result.error);
        alert(`Failed to update appointment status: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      alert(`Failed to update appointment status: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const toggleNote = (appointmentId: string) => {
    setActiveNoteId(activeNoteId === appointmentId ? null : appointmentId);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get consultancyId from localStorage
        const consultancyId = localStorage.getItem("consultancyId");
        console.log("Consultancy ID from localStorage:", consultancyId);

        if (consultancyId) {
          // Fetch consultancy profile
          console.log("Fetching profile for ID:", consultancyId);
          const profileResponse = await fetch(
            `/api/consultancies/${consultancyId}`
          );
          const profileResult = await profileResponse.json();

          console.log("Profile response:", profileResult);

          if (profileResult.success) {
            console.log("Setting profile:", profileResult.data);
            setProfile(profileResult.data);
          }

          // Fetch appointments
          console.log("Fetching appointments for consultancy:", consultancyId);
          const appointmentsResponse = await fetch(
            `/api/appointments?consultancyId=${consultancyId}`
          );
          const appointmentsResult = await appointmentsResponse.json();

          console.log("Appointments response:", appointmentsResult);

          if (appointmentsResult.success) {
            setAppointments(appointmentsResult.data || []);
          }
        } else {
          console.log(
            "No consultancyId found in localStorage, redirecting to login"
          );
          router.push("/consultancy-setup");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const currentProfile = profile
    ? {
        name: profile.name,
        category: profile.category,
        location: profile.location,
        phone: profile.contact?.phone,
        email: profile.contact?.email,
        price: profile.price,
        expertise: profile.expertise,
        availability: profile.availability,
      }
    : {
        name: "Loading...",
        category: "Loading...",
        location: "Loading...",
        phone: "Loading...",
        email: "Loading...",
        price: "Loading...",
      };

  const stats = {
    totalAppointments: appointments.length,
    confirmed: appointments.filter((a) => a.status === "confirmed" || a.status === "completed").length,
    pending: appointments.filter((a) => a.status === "pending").length,
    revenue: appointments
      .filter((a) => a.status === "confirmed" || a.status === "completed")
      .reduce((sum: number) => {
        const price = parseInt(profile?.price?.replace(/[^0-9]/g, '') || '0');
        return sum + price;
      }, 0),
  };

  // Show logout function
  const handleLogout = () => {
    localStorage.removeItem("consultancyId");
    router.push("/consultancy-setup");
  };

  const handleDateClick = (date: Date, appointmentsByDate: {[key: string]: any[]}) => {
    const dateKey = date.toDateString();
    const dayAppointments = appointmentsByDate[dateKey] || [];
    if (dayAppointments.length > 0) {
      setSelectedDateAppointments(dayAppointments);
      setCurrentAppointmentPage(1);
      setShowDateModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-gray-800 dark:to-gray-900 text-white transition-colors duration-300">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                {currentProfile.name} - Admin Portal
              </h1>
              <p className="text-slate-300 mt-1">
                Manage your consultancy services and appointments
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">
                  {stats.totalAppointments}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Confirmed</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">
                  {stats.confirmed}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Pending</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">
                  {stats.pending}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Revenue</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">
                  ${stats.revenue}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Admin Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Profile Management */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white transition-colors duration-300">
              <Settings className="w-5 h-5" />
              Profile Management
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Consultancy Name</p>
                <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{currentProfile.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Category</p>
                <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{currentProfile.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Location</p>
                <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{currentProfile.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Phone</p>
                <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                  {currentProfile.phone || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Email</p>
                <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                  {currentProfile.email || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Price</p>
                <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                  {currentProfile.price || "Not set"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => window.open(`/consultancy/${localStorage.getItem('consultancyId')}`, '_blank')}
                  className="bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Eye className="w-4 h-4" />
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setNavigatingToEdit(true);
                    // Create loading overlay
                    const overlay = document.createElement('div');
                    overlay.className = 'page-loading-overlay';
                    overlay.innerHTML = `
                      <div class="text-center">
                        <div class="text-4xl mb-4">✏️</div>
                        <div class="text-xl font-medium text-gray-700 mb-2">Loading Edit Profile</div>
                        <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                      </div>
                    `;
                    document.body.appendChild(overlay);
                    
                    setTimeout(() => {
                      router.push(`/consultancy-edit?id=${localStorage.getItem('consultancyId')}`);
                    }, 300);
                  }}
                  disabled={navigatingToEdit}
                  className="bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-white transition-colors duration-300">
              <Settings className="w-5 h-5" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => setShowCalendar(true)}
                className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white p-4 rounded-lg hover:from-green-500 hover:to-green-700 transition-all shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6" />
                    <div className="text-left">
                      <h3 className="font-semibold text-base">View Calendar</h3>
                      <p className="text-sm opacity-90">{appointments.filter((apt: any) => {
                        const now = new Date();
                        const aptDate = new Date(apt.appointmentDate);
                        const aptTime = apt.appointmentTime;
                        const [time, period] = aptTime.split(' ');
                        const [hours, minutes] = time.split(':').map(Number);
                        let hour24 = hours;
                        if (period === 'PM' && hours !== 12) hour24 += 12;
                        if (period === 'AM' && hours === 12) hour24 = 0;
                        aptDate.setHours(hour24, minutes || 0);
                        return apt.status === "confirmed" && aptDate > now;
                      }).length} upcoming</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{new Date().getDate()}</p>
                    <p className="text-sm opacity-90">{new Date().toLocaleDateString('en-US', { weekday: 'short' })}</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowAnalytics(true)}
                className="w-full bg-gradient-to-r from-purple-400 to-purple-600 text-white p-4 rounded-lg hover:from-purple-500 hover:to-purple-700 transition-all shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6" />
                    <div className="text-left">
                      <h3 className="font-semibold text-base">View Analytics</h3>
                      <p className="text-sm opacity-90">Detailed insights</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stats.confirmed}</p>
                    <p className="text-sm opacity-90">confirmed</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowProfileViews(true)}
                className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white p-4 rounded-lg hover:from-blue-500 hover:to-blue-700 transition-all shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="w-6 h-6" />
                    <div className="text-left">
                      <h3 className="font-semibold text-base">Profile Views</h3>
                      <p className="text-sm opacity-90">View analytics</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{profileViewsData.weekViews}</p>
                    <p className="text-sm opacity-90">this week</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Meeting Scheduler */}
        <ConsultancyMeetingScheduler consultancyId={localStorage.getItem('consultancyId')} appointments={appointments} />

        {/* Appointments Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8 transition-colors duration-300">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-300">Recent Appointments</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 text-gray-900 dark:text-white transition-colors duration-300">Client Details</th>
                  <th className="text-left py-3 text-gray-900 dark:text-white transition-colors duration-300">Service</th>
                  <th className="text-left py-3 text-gray-900 dark:text-white transition-colors duration-300">Date & Time</th>
                  <th className="text-left py-3 text-gray-900 dark:text-white transition-colors duration-300">Type</th>
                  <th className="text-left py-3 text-gray-900 dark:text-white transition-colors duration-300">Status</th>
                  <th className="text-left py-3 text-gray-900 dark:text-white transition-colors duration-300">Payment</th>
                  <th className="text-left py-3 text-gray-900 dark:text-white transition-colors duration-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments
                  .slice((appointmentsPage - 1) * appointmentsPerPage, appointmentsPage * appointmentsPerPage)
                  .map((appointment) => (
                  <tr
                    key={appointment._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                  >
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{appointment.clientName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                          {appointment.clientEmail}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                          {appointment.clientPhone}
                        </p>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">
                          {appointment.message && appointment.message.trim()
                            ? "Custom Service"
                            : currentProfile.category || "Consultation"}
                        </span>
                        {appointment.message && appointment.message.trim() ? (
                          <div className="relative">
                            <button
                              onClick={() => toggleNote(appointment._id)}
                              className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-2 py-1 rounded text-xs cursor-pointer w-fit"
                            >
                              💭 View Note
                            </button>
                            {activeNoteId === appointment._id && (
                              <div className="absolute left-full top-0 z-50" style={{ marginLeft: '-100px', marginTop: '-4px' }}>
                                <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-4 shadow-xl min-w-80 max-w-96 relative">
                                  <div className="absolute -left-2 top-3 w-4 h-4 bg-blue-50 border-l-2 border-b-2 border-blue-400 transform rotate-45"></div>
                                  <div className="text-sm text-gray-800 leading-relaxed font-medium pr-6">
                                    💬 {appointment.message}
                                  </div>
                                  <button
                                    onClick={() => setActiveNoteId(null)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 font-bold"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No note</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-gray-900 dark:text-white transition-colors duration-300">
                      {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (appointment.appointmentType || "online") === "online"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {appointment.appointmentType || "online"}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : appointment.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : appointment.status === "expired"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {profile?.price || '$250'} - paid
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        {(() => {
                          const now = new Date();
                          const aptDate = new Date(appointment.appointmentDate);
                          const [time, period] = (appointment.appointmentTime || '').split(' ');
                          const [hours, minutes] = time.split(':').map(Number);
                          let hour24 = hours;
                          if (period === 'PM' && hours !== 12) hour24 += 12;
                          if (period === 'AM' && hours === 12) hour24 = 0;
                          aptDate.setHours(hour24, minutes || 0);
                          
                          const isExpired = aptDate < now;
                          
                          // For pending appointments that are past due - show expired button
                          if (isExpired && appointment.status === "pending") {
                            return (
                              <button
                                onClick={() => updateAppointmentStatus(appointment._id, "expired")}
                                className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                              >
                                Mark Expired
                              </button>
                            );
                          }
                          
                          // For future pending appointments - show confirm/reject
                          if (appointment.status === "pending" && !isExpired) {
                            return (
                              <>
                                <button
                                  onClick={() => updateAppointmentStatus(appointment._id, "confirmed")}
                                  className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => updateAppointmentStatus(appointment._id, "cancelled")}
                                  className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                >
                                  Reject
                                </button>
                              </>
                            );
                          }
                          
                          // For confirmed appointments that are past due - show complete/expire
                          if (appointment.status === "confirmed" && isExpired) {
                            return (
                              <>
                                <button
                                  onClick={() => updateAppointmentStatus(appointment._id, "completed")}
                                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => updateAppointmentStatus(appointment._id, "expired")}
                                  className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                                >
                                  Expire
                                </button>
                              </>
                            );
                          }
                          
                          // For future confirmed appointments - show complete
                          if (appointment.status === "confirmed" && !isExpired) {
                            return (
                              <button
                                onClick={() => updateAppointmentStatus(appointment._id, "completed")}
                                className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                              >
                                Complete
                              </button>
                            );
                          }
                          
                          // For completed, cancelled, or expired appointments - no actions
                          return null;
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Appointments Pagination */}
          {appointments.length > appointmentsPerPage && (
            <div className="mt-6 flex justify-center gap-2">
              {Array.from({ length: Math.ceil(appointments.length / appointmentsPerPage) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setAppointmentsPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    appointmentsPage === i + 1
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Verification Status Section - Moved to Bottom */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8 transition-colors duration-300">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white transition-colors duration-300">
            <CheckCircle className="w-5 h-5" />
            Verification Status
          </h2>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 transition-colors duration-300 ${
              profile?.status === 'verified' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                : profile?.status === 'rejected'
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">
                  {profile?.status === 'verified' ? '✅' : 
                   profile?.status === 'rejected' ? '❌' : '⏳'}
                </span>
                <span className={`font-semibold text-lg transition-colors duration-300 ${
                  profile?.status === 'verified' 
                    ? 'text-green-900 dark:text-green-100'
                    : profile?.status === 'rejected'
                    ? 'text-red-900 dark:text-red-100'
                    : 'text-yellow-900 dark:text-yellow-100'
                }`}>
                  {profile?.status === 'verified' ? 'Verified' : 
                   profile?.status === 'rejected' ? 'Rejected' : 'Under Review'}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200 mb-3 transition-colors duration-300">
                {profile?.status === 'verified' 
                  ? 'Your consultancy is verified and live on the platform!'
                  : profile?.status === 'rejected'
                  ? 'Your consultancy was rejected. Please review the feedback and resubmit.'
                  : 'Your consultancy is under admin review. Usually takes 2-3 working days.'}
              </p>
              {profile?.status === 'rejected' && profile?.rejectionReason && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded p-3 mb-3 transition-colors duration-300">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1 transition-colors duration-300">Rejection Reason:</p>
                  <p className="text-sm text-red-700 dark:text-red-300 transition-colors duration-300">{profile.rejectionReason}</p>
                </div>
              )}
              {profile?.status === 'rejected' && (
                <div className="flex gap-2">
                  {profile?.rejectionReason?.includes('Please verify your phone number and email address to resubmit your application') ? (
                    <button
                      onClick={() => {
                        const consultancyId = localStorage.getItem('consultancyId');
                        window.location.href = `/verification?consultancy=${consultancyId}`;
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      📧 Verify Now
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        // Resubmit for verification
                        fetch(`/api/consultancies/${localStorage.getItem('consultancyId')}/resubmit`, {
                          method: 'POST'
                        }).then(res => res.json()).then(result => {
                          if (result.success) {
                            alert('✅ Resubmitted for verification!');
                            window.location.reload();
                          }
                        });
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      🔄 Resubmit for Verification
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>



      {/* Calendar Modal */}
      <Modal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        title="Monthly Calendar"
        maxWidth="max-w-5xl"
      >
        {(() => {
              const today = new Date();
              const year = today.getFullYear();
              const month = today.getMonth();
              const firstDay = new Date(year, month, 1);
              const lastDay = new Date(year, month + 1, 0);
              const startDate = new Date(firstDay);
              startDate.setDate(startDate.getDate() - firstDay.getDay());
              
              const days = [];
              for (let i = 0; i < 42; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                days.push(date);
              }
              
              // Count future confirmed appointments only
              const now = new Date();
              const appointmentCounts: {[key: string]: number} = {};
              const appointmentsByDate: {[key: string]: any[]} = {};
              appointments
                .filter((apt: any) => {
                  const aptDate = new Date(apt.appointmentDate);
                  const aptTime = apt.appointmentTime;
                  const [time, period] = aptTime.split(' ');
                  const [hours, minutes] = time.split(':').map(Number);
                  let hour24 = hours;
                  if (period === 'PM' && hours !== 12) hour24 += 12;
                  if (period === 'AM' && hours === 12) hour24 = 0;
                  aptDate.setHours(hour24, minutes || 0);
                  
                  return apt.status === "confirmed" && aptDate > now;
                })
                .forEach((apt: any) => {
                  const dateKey = new Date(apt.appointmentDate).toDateString();
                  appointmentCounts[dateKey] = (appointmentCounts[dateKey] || 0) + 1;
                  if (!appointmentsByDate[dateKey]) appointmentsByDate[dateKey] = [];
                  appointmentsByDate[dateKey].push(apt);
                });
              
              return (
                <div>
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                      {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-center font-medium text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((date, index) => {
                      const isCurrentMonth = date.getMonth() === month;
                      const isToday = date.toDateString() === today.toDateString();
                      const appointmentCount = appointmentCounts[date.toDateString()] || 0;
                      
                      let bgColor = 'bg-white dark:bg-gray-700';
                      if (appointmentCount > 0) {
                        if (appointmentCount >= 5) bgColor = 'bg-blue-600';
                        else if (appointmentCount >= 3) bgColor = 'bg-blue-500';
                        else if (appointmentCount >= 2) bgColor = 'bg-blue-400';
                        else bgColor = 'bg-blue-200';
                      }
                      
                      const textColor = appointmentCount >= 3 ? 'text-white' : 'text-gray-900 dark:text-gray-100';
                      
                      return (
                        <div
                          key={index}
                          className={`h-12 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-sm relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300 ${
                            isCurrentMonth ? textColor : 'text-gray-400 dark:text-gray-500'
                          } ${bgColor} ${
                            isToday ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''
                          }`}
                          title={appointmentCount > 0 ? `${appointmentCount} appointment${appointmentCount > 1 ? 's' : ''}` : ''}
                          onClick={() => handleDateClick(date, appointmentsByDate)}
                        >
                          <span className={`font-medium ${
                            !isCurrentMonth ? 'text-gray-400 dark:text-gray-500' : 
                            appointmentCount >= 3 ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                          } transition-colors duration-300`}>{date.getDate()}</span>
                          {appointmentCount > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                              {appointmentCount > 9 ? '9+' : appointmentCount}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-200 rounded mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">1 appointment</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-400 rounded mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">2 appointments</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">3-4 appointments</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">5+ appointments</span>
                    </div>
                  </div>
                </div>
              );
            })()}
      </Modal>

      {/* Analytics Modal */}
      <Modal
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        title="Analytics Dashboard"
        maxWidth="max-w-4xl"
      >
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center transition-colors duration-300">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">{stats.totalAppointments}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Total Appointments</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center transition-colors duration-300">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">{stats.confirmed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Confirmed</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center transition-colors duration-300">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 transition-colors duration-300">{stats.pending}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Pending</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center transition-colors duration-300">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 transition-colors duration-300">
                  {Math.round((stats.confirmed / Math.max(stats.totalAppointments, 1)) * 100)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Success Rate</div>
              </div>
            </div>

            {/* Simple Bar Chart */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-300">Appointment Status Distribution</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-20 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Confirmed</div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-6 mx-3 transition-colors duration-300">
                    <div 
                      className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(stats.confirmed / Math.max(stats.totalAppointments, 1)) * 100}%` }}
                    >
                      <span className="text-white text-xs font-medium">{stats.confirmed}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-20 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Pending</div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-6 mx-3 transition-colors duration-300">
                    <div 
                      className="bg-yellow-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(stats.pending / Math.max(stats.totalAppointments, 1)) * 100}%` }}
                    >
                      <span className="text-white text-xs font-medium">{stats.pending}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-20 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Cancelled</div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-6 mx-3 transition-colors duration-300">
                    <div 
                      className="bg-red-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${((stats.totalAppointments - stats.confirmed - stats.pending) / Math.max(stats.totalAppointments, 1)) * 100}%` }}
                    >
                      <span className="text-white text-xs font-medium">{stats.totalAppointments - stats.confirmed - stats.pending}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-300">Recent Activity</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {appointments.slice(0, 10).map((appointment) => (
                  <div key={appointment._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded transition-colors duration-300">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{appointment.clientName}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2 transition-colors duration-300">booked appointment</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600 transition-colors duration-300" />
                    <p>No activity data available</p>
                  </div>
                )}
              </div>
            </div>
      </Modal>

      {/* Profile Views Modal */}
      <Modal
        isOpen={showProfileViews}
        onClose={() => setShowProfileViews(false)}
        title="Profile Views Analytics"
        maxWidth="max-w-4xl"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center transition-colors duration-300">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">{profileViewsData.totalViews}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Total Views</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center transition-colors duration-300">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">{profileViewsData.todayViews}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Today</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center transition-colors duration-300">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 transition-colors duration-300">{profileViewsData.weekViews}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">This Week</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center transition-colors duration-300">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 transition-colors duration-300">+{profileViewsData.growth}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Growth</div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-300">User Interaction Over Time (Last 7 Days)</h4>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-colors duration-300">
                <div className="flex items-end justify-between h-40 gap-2">
                  {[45, 32, 28, 65, 52, 38, 71].map((views, i) => {
                    const height = (views / 80) * 120 + 20; // Scale height based on views
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - i));
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div className="relative group w-full">
                          <div 
                            className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md w-full transition-all hover:from-blue-700 hover:to-blue-500 cursor-pointer shadow-sm"
                            style={{ height: `${height}px`, minHeight: '20px' }}
                          ></div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {views} views
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mt-2 text-center font-medium transition-colors duration-300">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-4 px-2 transition-colors duration-300">
                  <span>7 days ago</span>
                  <span>Today</span>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Total views this week: <span className="font-semibold text-blue-600 dark:text-blue-400 transition-colors duration-300">331</span></div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-300">Traffic Sources</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded transition-colors duration-300">
                    <span className="text-gray-900 dark:text-white transition-colors duration-300">Direct Search</span>
                    <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">45%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded transition-colors duration-300">
                    <span className="text-gray-900 dark:text-white transition-colors duration-300">Category Browse</span>
                    <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">30%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded transition-colors duration-300">
                    <span className="text-gray-900 dark:text-white transition-colors duration-300">Recommendations</span>
                    <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">25%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-300">Peak Hours</h4>
                <div className="space-y-2">
                  {[{time: '9:00 AM', activity: 65}, {time: '12:00 PM', activity: 80}, {time: '3:00 PM', activity: 45}, {time: '6:00 PM', activity: 70}].map(({time, activity}) => (
                    <div key={time} className="flex items-center">
                      <div className="w-16 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">{time}</div>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-4 mx-3 transition-colors duration-300">
                        <div 
                          className="bg-blue-500 h-4 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${activity}%` }}
                        >
                          <span className="text-white text-xs">{activity}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
      </Modal>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowEditProfile(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">Edit Profile</h3>
              <button
                onClick={() => setShowEditProfile(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsUpdating(true);
              
              try {
                const consultancyId = localStorage.getItem('consultancyId');
                const formData = new FormData(e.target as HTMLFormElement);
                
                // Password validation
                const password = formData.get('password');
                const confirmPassword = formData.get('confirmPassword');
                
                if (password && password !== confirmPassword) {
                  alert('Passwords do not match!');
                  return;
                }
                
                const { _id, ...profileWithoutId } = profile;
                const updateData = {
                  ...profileWithoutId,
                  name: formData.get('name') || profile.name,
                  category: formData.get('category') || profile.category,
                  description: formData.get('description') || profile.description,
                  location: formData.get('location') || profile.location,
                  price: formData.get('price') || profile.price,
                  image: formData.get('image') || profile.image,
                  whyChooseUs: formData.get('whyChooseUs') ? (formData.get('whyChooseUs') as string).split(',').map(item => item.trim()) : profile.whyChooseUs,
                  expertise: formData.get('expertise') ? (formData.get('expertise') as string).split(',').map(item => item.trim()) : profile.expertise,
                  contact: {
                    ...profile.contact,
                    email: formData.get('email') || profile.contact?.email,
                    phone: formData.get('phone') || profile.contact?.phone,
                    website: formData.get('website') || profile.contact?.website,
                    password: password || profile.contact?.password
                  },
                  availability: {
                    ...profile.availability,
                    days: formData.getAll('days').length > 0 ? Array.from(formData.getAll('days')) : profile.availability?.days,
                    hours: formData.get('hours') || profile.availability?.hours
                  }
                };
                
                const response = await fetch(`/api/consultancies/${consultancyId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updateData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                  // Revalidate cache
                  fetch('/api/revalidate', { method: 'POST' });
                  alert('Profile updated successfully!');
                  setShowEditProfile(false);
                  window.location.reload();
                } else {
                  alert('Failed to update profile: ' + result.error);
                }
              } catch (error) {
                alert('Error updating profile: ' + (error instanceof Error ? error.message : String(error)));
              } finally {
                setIsUpdating(false);
              }
            }}>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 border-b pb-2">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consultancy Name*</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={currentProfile.name}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Your consultancy name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                    <select
                      name="category"
                      defaultValue={currentProfile.category}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Business Strategy">Business Strategy</option>
                      <option value="Financial Services">Financial Services</option>
                      <option value="Legal Advisory">Legal Advisory</option>
                      <option value="Technology">Technology</option>
                      <option value="Health & Wellness">Health & Wellness</option>
                      <option value="Real Estate & Housing">Real Estate & Housing</option>
                      <option value="Career Consultation">Career Consultation</option>
                      <option value="Lifestyle & Personal Growth">Lifestyle & Personal Growth</option>
                      <option value="Travel & Hospitality">Travel & Hospitality</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location*</label>
                    <input
                      type="text"
                      name="location"
                      defaultValue={currentProfile.location}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (per session)*</label>
                    <input
                      type="text"
                      name="price"
                      defaultValue={currentProfile.price}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={profile?.description || ''}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe your consultancy services and expertise..."
                  ></textarea>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Why Choose Us (comma separated)*</label>
                  <textarea
                    name="whyChooseUs"
                    rows={2}
                    defaultValue={Array.isArray(profile?.whyChooseUs) ? profile.whyChooseUs.join(', ') : (profile?.whyChooseUs || '')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Expert team, 24/7 support, Proven results"
                  ></textarea>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL*</label>
                  <input
                    type="url"
                    name="image"
                    defaultValue={profile?.image || ''}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expertise (comma separated)*</label>
                  <input
                    type="text"
                    name="expertise"
                    defaultValue={currentProfile.expertise?.join(', ') || ''}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Business Strategy, Market Analysis, Financial Planning"
                  />
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 border-b pb-2">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address*</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={currentProfile.email}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={currentProfile.phone}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      name="website"
                      defaultValue={profile?.contact?.website || ''}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
                    <input
                      type="password"
                      name="password"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 border-b pb-2">Availability</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Days*</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          name="days"
                          value={day}
                          id={day}
                          defaultChecked={currentProfile.availability?.days?.includes(day)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor={day} className="ml-2 block text-sm text-gray-700">{day}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available Hours*</label>
                  <input
                    type="text"
                    name="hours"
                    defaultValue={currentProfile.availability?.hours || ''}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="9:00 AM - 5:00 PM"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Date Appointments Modal */}
      {showDateModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowDateModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">
                Appointments ({selectedDateAppointments.length})
              </h3>
              <button
                onClick={() => setShowDateModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedDateAppointments
                .slice((currentAppointmentPage - 1) * 4, currentAppointmentPage * 4)
                .map((appointment) => (
                <div key={appointment._id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{appointment.clientName}</h4>
                      <p className="text-gray-600">{appointment.clientEmail}</p>
                      <p className="text-gray-600">{appointment.clientPhone}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {appointment.appointmentTime} - {appointment.appointmentType || 'online'}
                      </p>
                      {appointment.message && (
                        <p className="text-sm text-gray-700 mt-2 bg-white p-2 rounded">
                          Note: {appointment.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {appointment.status}
                      </span>
                      <div className="flex gap-1">
                        {appointment.status === "pending" && (
                          <>
                            <button
                              onClick={() => {
                                updateAppointmentStatus(appointment._id, "confirmed");
                                setShowDateModal(false);
                              }}
                              className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => {
                                updateAppointmentStatus(appointment._id, "cancelled");
                                setShowDateModal(false);
                              }}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {appointment.status === "confirmed" && (
                          <button
                            onClick={() => {
                              updateAppointmentStatus(appointment._id, "completed");
                              setShowDateModal(false);
                            }}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedDateAppointments.length > 4 && (
              <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: Math.ceil(selectedDateAppointments.length / 4) }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentAppointmentPage(i + 1)}
                    className={`px-3 py-1 rounded ${
                      currentAppointmentPage === i + 1
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ConsultancyAdminPage;
