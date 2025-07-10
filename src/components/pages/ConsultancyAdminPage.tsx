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
import { getConsultancyProfile } from "../../utils/consultancyUtils";

interface Appointment {
  _id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType?: "online" | "offline";
  status: "confirmed" | "pending" | "completed" | "cancelled";
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
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showProfileViews, setShowProfileViews] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
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

  const updateAppointmentStatus = async (
    appointmentId: string,
    newStatus: "confirmed" | "pending" | "completed" | "cancelled"
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

  const showNote = (note: string) => {
    setSelectedNote(note);
    setShowNoteModal(true);
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
      .filter((a: any) => a.paymentStatus === "paid")
      .reduce((sum: number, a: any) => sum + (a.amount || 0), 0),
  };

  // Show logout function
  const handleLogout = () => {
    localStorage.removeItem("consultancyId");
    router.push("/consultancy-setup");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
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
            <button
              onClick={handleLogout}
              className="bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalAppointments}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Confirmed</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.confirmed}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.pending}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Revenue</p>
                <p className="text-2xl font-bold text-gray-800">
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
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Profile Management
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Consultancy Name</p>
                <p className="font-medium">{currentProfile.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-medium">{currentProfile.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{currentProfile.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">
                  {currentProfile.phone || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">
                  {currentProfile.email || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="font-medium">
                  {currentProfile.price || "Not set"}
                </p>
              </div>
              <button
                onClick={() => setShowEditProfile(true)}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowCalendar(true)}
                className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white p-4 rounded-lg hover:from-green-500 hover:to-green-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Calendar className="w-8 h-8 mb-2" />
                    <h3 className="font-semibold">View Calendar</h3>
                    <p className="text-sm opacity-90">{appointments.length} appointments</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{new Date().getDate()}</p>
                    <p className="text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'short' })}</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowAnalytics(true)}
                className="w-full bg-gradient-to-r from-purple-400 to-purple-600 text-white p-4 rounded-lg hover:from-purple-500 hover:to-purple-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <BarChart3 className="w-8 h-8 mb-2" />
                    <h3 className="font-semibold">View Analytics</h3>
                    <p className="text-sm opacity-90">Detailed insights</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stats.confirmed}</p>
                    <p className="text-sm">confirmed</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowProfileViews(true)}
                className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white p-4 rounded-lg hover:from-blue-500 hover:to-blue-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Eye className="w-8 h-8 mb-2" />
                    <h3 className="font-semibold">Profile Views</h3>
                    <p className="text-sm opacity-90">View analytics</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{profileViewsData.weekViews}</p>
                    <p className="text-sm">this week</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Appointments</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Client Details</th>
                  <th className="text-left py-3">Service</th>
                  <th className="text-left py-3">Date & Time</th>
                  <th className="text-left py-3">Type</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Payment</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr
                    key={appointment._id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{appointment.clientName}</p>
                        <p className="text-sm text-gray-500">
                          {appointment.clientEmail}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.clientPhone}
                        </p>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span>
                          {appointment.message && appointment.message.trim()
                            ? "Custom Service"
                            : currentProfile.category || "Consultation"}
                        </span>
                        {appointment.message && appointment.message.trim() && (
                          <button
                            onClick={() => showNote(appointment.message || "")}
                            className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-200"
                          >
                            View Note
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      {appointment.appointmentDate} at {appointment.appointmentTime}
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
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        $250 - paid
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        {appointment.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment._id,
                                  "confirmed"
                                )
                              }
                              className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment._id,
                                  "cancelled"
                                )
                              }
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {appointment.status === "confirmed" && (
                          <button
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment._id,
                                "completed"
                              )
                            }
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Client Note</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-gray-700">
                {selectedNote || "No additional notes provided."}
              </p>
            </div>
            <button
              onClick={() => setShowNoteModal(false)}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">Monthly Calendar</h3>
              <button
                onClick={() => setShowCalendar(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
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
              
              // Count appointments per day
              const appointmentCounts: {[key: string]: number} = {};
              appointments.forEach((apt: any) => {
                const dateKey = new Date(apt.appointmentDate).toDateString();
                appointmentCounts[dateKey] = (appointmentCounts[dateKey] || 0) + 1;
              });
              
              return (
                <div>
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-semibold">
                      {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((date, index) => {
                      const isCurrentMonth = date.getMonth() === month;
                      const isToday = date.toDateString() === today.toDateString();
                      const appointmentCount = appointmentCounts[date.toDateString()] || 0;
                      
                      let bgColor = 'bg-white';
                      if (appointmentCount > 0) {
                        if (appointmentCount >= 5) bgColor = 'bg-blue-600';
                        else if (appointmentCount >= 3) bgColor = 'bg-blue-500';
                        else if (appointmentCount >= 2) bgColor = 'bg-blue-400';
                        else bgColor = 'bg-blue-200';
                      }
                      
                      const textColor = appointmentCount >= 3 ? 'text-white' : 'text-gray-900';
                      
                      return (
                        <div
                          key={index}
                          className={`h-12 border border-gray-200 flex items-center justify-center text-sm relative cursor-pointer hover:bg-gray-50 ${
                            isCurrentMonth ? '' : 'text-gray-400'
                          } ${bgColor} ${textColor} ${
                            isToday ? 'ring-2 ring-indigo-500' : ''
                          }`}
                          title={appointmentCount > 0 ? `${appointmentCount} appointment${appointmentCount > 1 ? 's' : ''}` : ''}
                        >
                          <span className="font-medium">{date.getDate()}</span>
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
                      <span>1 appointment</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-400 rounded mr-2"></div>
                      <span>2 appointments</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                      <span>3-4 appointments</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                      <span>5+ appointments</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">Analytics Dashboard</h3>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalAppointments}</div>
                <div className="text-sm text-gray-600">Total Appointments</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((stats.confirmed / Math.max(stats.totalAppointments, 1)) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>

            {/* Simple Bar Chart */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4">Appointment Status Distribution</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-20 text-sm text-gray-600">Confirmed</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 mx-3">
                    <div 
                      className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(stats.confirmed / Math.max(stats.totalAppointments, 1)) * 100}%` }}
                    >
                      <span className="text-white text-xs font-medium">{stats.confirmed}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-20 text-sm text-gray-600">Pending</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 mx-3">
                    <div 
                      className="bg-yellow-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(stats.pending / Math.max(stats.totalAppointments, 1)) * 100}%` }}
                    >
                      <span className="text-white text-xs font-medium">{stats.pending}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-20 text-sm text-gray-600">Cancelled</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 mx-3">
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
              <h4 className="text-lg font-semibold mb-4">Recent Activity</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {appointments.slice(0, 10).map((appointment) => (
                  <div key={appointment._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{appointment.clientName}</span>
                      <span className="text-gray-500 ml-2">booked appointment</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No activity data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Views Modal */}
      {showProfileViews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">Profile Views Analytics</h3>
              <button
                onClick={() => setShowProfileViews(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{profileViewsData.totalViews}</div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{profileViewsData.todayViews}</div>
                <div className="text-sm text-gray-600">Today</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{profileViewsData.weekViews}</div>
                <div className="text-sm text-gray-600">This Week</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">+{profileViewsData.growth}%</div>
                <div className="text-sm text-gray-600">Growth</div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4">User Interaction Over Time (Last 7 Days)</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
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
                        <div className="text-xs text-gray-600 mt-2 text-center font-medium">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-4 px-2">
                  <span>7 days ago</span>
                  <span>Today</span>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600">Total views this week: <span className="font-semibold text-blue-600">331</span></div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-4">Traffic Sources</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>Direct Search</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>Category Browse</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>Recommendations</span>
                    <span className="font-medium">25%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Peak Hours</h4>
                <div className="space-y-2">
                  {[{time: '9:00 AM', activity: 65}, {time: '12:00 PM', activity: 80}, {time: '3:00 PM', activity: 45}, {time: '6:00 PM', activity: 70}].map(({time, activity}) => (
                    <div key={time} className="flex items-center">
                      <div className="w-16 text-sm text-gray-600">{time}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4 mx-3">
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
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                  ></textarea>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Why Choose Us</label>
                  <textarea
                    name="whyChooseUs"
                    rows={2}
                    defaultValue={Array.isArray(profile?.whyChooseUs) ? profile.whyChooseUs.join(', ') : (profile?.whyChooseUs || '')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  ></textarea>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expertise (comma separated)*</label>
                  <input
                    type="text"
                    name="expertise"
                    defaultValue={currentProfile.expertise?.join(', ') || ''}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
    </div>
  );
};

export default ConsultancyAdminPage;
