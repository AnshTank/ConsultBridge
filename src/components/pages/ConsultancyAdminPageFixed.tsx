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
  status: "confirmed" | "pending" | "completed" | "cancelled" | "expired";
  message?: string;
  consultancyId: string;
  userId: string;
}

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

  const updateAppointmentStatus = async (
    appointmentId: string,
    newStatus: "confirmed" | "pending" | "completed" | "cancelled" | "expired"
  ) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

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
        alert(`Failed to update appointment status: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Failed to update appointment status: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const toggleNote = (appointmentId: string) => {
    setActiveNoteId(activeNoteId === appointmentId ? null : appointmentId);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const consultancyId = localStorage.getItem("consultancyId");

        if (consultancyId) {
          const profileResponse = await fetch(
            `/api/consultancies/${consultancyId}`
          );
          const profileResult = await profileResponse.json();

          if (profileResult.success) {
            setProfile(profileResult.data);
          }

          const appointmentsResponse = await fetch(
            `/api/appointments?consultancyId=${consultancyId}`
          );
          const appointmentsResult = await appointmentsResponse.json();

          if (appointmentsResult.success) {
            setAppointments(appointmentsResult.data || []);
          }
        } else {
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

  const renderModal = (isOpen: boolean, onClose: () => void, children: React.ReactNode, maxWidth = "max-w-4xl") => {
    if (!isOpen) return null;
    
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    
    return (
      <div 
        className="scroll-modal"
        style={{ 
          top: `${scrollY}px`, 
          height: '100vh' 
        }}
        onClick={onClose}
      >
        <div 
          className={`scroll-modal-content ${maxWidth} w-full p-6`}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    );
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
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => window.open(`/consultancy/${localStorage.getItem('consultancyId')}`, '_blank')}
                  className="bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Eye className="w-4 h-4" />
                  View Profile
                </button>
                <button
                  onClick={() => router.push(`/consultancy-edit?id=${localStorage.getItem('consultancyId')}`)}
                  className="bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
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
      </div>

      {/* Calendar Modal */}
      {renderModal(showCalendar, () => setShowCalendar(false), (
        <>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold">Monthly Calendar</h3>
            <button
              onClick={() => setShowCalendar(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          <div>Calendar content here...</div>
        </>
      ), "max-w-5xl")}

      {/* Analytics Modal */}
      {renderModal(showAnalytics, () => setShowAnalytics(false), (
        <>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold">Analytics Dashboard</h3>
            <button
              onClick={() => setShowAnalytics(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          <div>Analytics content here...</div>
        </>
      ))}

      {/* Profile Views Modal */}
      {renderModal(showProfileViews, () => setShowProfileViews(false), (
        <>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold">Profile Views Analytics</h3>
            <button
              onClick={() => setShowProfileViews(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          <div>Profile views content here...</div>
        </>
      ))}
    </div>
  );
};

export default ConsultancyAdminPage;