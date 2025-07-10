"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Video,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "../Navbar";
import PageTransition from "../PageTransition";

interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  service: string;
  date: string;
  time: string;
  type: "online" | "offline";
  status: "confirmed" | "pending" | "completed" | "cancelled";
  amount: number;
  notes?: string;
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    clientName: "John Smith",
    clientEmail: "john@example.com",
    clientPhone: "+1 (555) 123-4567",
    service: "Business Strategy Consultation",
    date: "2025-01-15",
    time: "10:00 AM",
    type: "online",
    status: "confirmed",
    amount: 250,
    notes: "Initial consultation for startup strategy"
  },
  {
    id: "2",
    clientName: "Sarah Johnson",
    clientEmail: "sarah@example.com",
    clientPhone: "+1 (555) 987-6543",
    service: "Market Analysis",
    date: "2025-01-16",
    time: "2:00 PM",
    type: "offline",
    status: "pending",
    amount: 300,
  },
  {
    id: "3",
    clientName: "Mike Davis",
    clientEmail: "mike@example.com",
    clientPhone: "+1 (555) 456-7890",
    service: "Growth Strategy",
    date: "2025-01-14",
    time: "11:00 AM",
    type: "online",
    status: "completed",
    amount: 200,
  },
  {
    id: "4",
    clientName: "Emily Brown",
    clientEmail: "emily@example.com",
    clientPhone: "+1 (555) 321-9876",
    service: "Business Planning",
    date: "2025-01-17",
    time: "3:00 PM",
    type: "online",
    status: "confirmed",
    amount: 275,
  },
];

const ConsultancyCalendarPage: React.FC = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (isLoaded && (!user || user.publicMetadata?.role !== "consultancy")) {
      router.replace("/");
      return;
    }
  }, [user, isLoaded, router]);

  if (!isLoaded) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </PageTransition>
    );
  }

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => 
      prev.map(apt => apt.id === id ? { ...apt, status } : apt)
    );
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateStr);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = getDaysInMonth(currentMonth);
  const todayAppointments = getAppointmentsForDate(selectedDate);

  return (
    <PageTransition>
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Calendar & Appointments</h1>
              <p className="text-gray-600 mt-1">Manage your schedule and client appointments</p>
            </div>
            <button
              onClick={() => router.push('/consultancy-dashboard')}
              className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    if (!day) {
                      return <div key={index} className="p-2 h-20"></div>;
                    }

                    const dayAppointments = getAppointmentsForDate(day);
                    const isSelected = selectedDate.toDateString() === day.toDateString();
                    const isToday = new Date().toDateString() === day.toDateString();

                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedDate(day)}
                        className={`p-2 h-20 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-indigo-100 border-indigo-300' : ''
                        } ${isToday ? 'bg-blue-50' : ''}`}
                      >
                        <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                          {day.getDate()}
                        </div>
                        <div className="mt-1 space-y-1">
                          {dayAppointments.slice(0, 2).map(apt => (
                            <div
                              key={apt.id}
                              className={`text-xs px-1 py-0.5 rounded truncate ${
                                apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {apt.time} - {apt.clientName}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayAppointments.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Appointments for Selected Date */}
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {formatDate(selectedDate)}
                </h3>
                
                {todayAppointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No appointments for this date</p>
                ) : (
                  <div className="space-y-4">
                    {todayAppointments.map(appointment => (
                      <motion.div
                        key={appointment.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedAppointment(appointment)}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{appointment.time}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          <User className="w-4 h-4 inline mr-1" />
                          {appointment.clientName}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          {appointment.service}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          {appointment.type === 'online' ? (
                            <Video className="w-4 h-4 mr-1" />
                          ) : (
                            <MapPin className="w-4 h-4 mr-1" />
                          )}
                          {appointment.type === 'online' ? 'Online Meeting' : 'Office Visit'}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Appointment Details Modal */}
          {selectedAppointment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold">Appointment Details</h2>
                    <button
                      onClick={() => setSelectedAppointment(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Client Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Client Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-gray-500 mr-3" />
                          <span>{selectedAppointment.clientName}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 text-gray-500 mr-3" />
                          <span>{selectedAppointment.clientEmail}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-5 h-5 text-gray-500 mr-3" />
                          <span>{selectedAppointment.clientPhone}</span>
                        </div>
                        <div className="flex items-center">
                          {selectedAppointment.type === 'online' ? (
                            <Video className="w-5 h-5 text-gray-500 mr-3" />
                          ) : (
                            <MapPin className="w-5 h-5 text-gray-500 mr-3" />
                          )}
                          <span>{selectedAppointment.type === 'online' ? 'Online Meeting' : 'Office Visit'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Appointment Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-gray-500 mr-3" />
                          <span>{selectedAppointment.date}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-gray-500 mr-3" />
                          <span>{selectedAppointment.time}</span>
                        </div>
                        <div className="md:col-span-2">
                          <strong>Service:</strong> {selectedAppointment.service}
                        </div>
                        <div className="md:col-span-2">
                          <strong>Amount:</strong> ${selectedAppointment.amount}
                        </div>
                        {selectedAppointment.notes && (
                          <div className="md:col-span-2">
                            <strong>Notes:</strong> {selectedAppointment.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Actions */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Update Status</h3>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => updateAppointmentStatus(selectedAppointment.id, 'confirmed')}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirm
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(selectedAppointment.id, 'completed')}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Complete
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(selectedAppointment.id, 'cancelled')}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ConsultancyCalendarPage;