"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, Clock, User, Mail, Phone, MessageSquare, MapPin } from "lucide-react";
import Navbar from "../Navbar";
import PageTransition from "../PageTransition";
import SmartPageWrapper from "../SmartPageWrapper";

function BookAppointmentPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: user?.fullName || "",
    clientEmail: user?.emailAddresses?.[0]?.emailAddress || "",
    clientPhone: "",
    appointmentDate: "",
    appointmentTime: "",
    appointmentType: "online",
    message: ""
  });
  
  // Pre-fill form with URL parameters and user data
  useEffect(() => {
    const consultancyId = searchParams?.get('consultancyId');
    const appointmentType = searchParams?.get('appointmentType');
    const date = searchParams?.get('date');
    const time = searchParams?.get('time');
    
    console.log('URL params:', { consultancyId, appointmentType, date, time });
    
    setFormData(prev => ({
      ...prev,
      clientName: user?.fullName || prev.clientName,
      clientEmail: user?.emailAddresses?.[0]?.emailAddress || prev.clientEmail,
      appointmentDate: date || prev.appointmentDate,
      appointmentTime: time || prev.appointmentTime,
      appointmentType: appointmentType || prev.appointmentType
    }));
  }, [searchParams, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingData = {
        ...formData,
        consultancyId: searchParams?.get('consultancyId'),
        userId: user?.id
      };
      
      console.log('Booking data:', bookingData);
      
      const response = await fetch("/api/appointments/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response result:', result);

      if (result.success) {
        alert("Appointment booked successfully! You will receive a confirmation email shortly.");
        router.push("/");
      } else {
        alert(result.error || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SmartPageWrapper loadingMessage="📅 Preparing your booking form...">
      <PageTransition>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-t-xl p-4 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">Book Your Appointment</h1>
              <p className="text-indigo-100 text-sm md:text-lg">✨ Fill in your details to schedule a consultation</p>
            </div>
            <div className="absolute -top-4 -right-4 w-16 md:w-24 h-16 md:h-24 bg-white opacity-10 rounded-full"></div>
            <div className="absolute -bottom-2 -left-2 w-12 md:w-16 h-12 md:h-16 bg-white opacity-10 rounded-full"></div>
          </div>
          
          <div className="bg-white rounded-b-xl shadow-2xl p-4 md:p-8 border-t-4 border-gradient-to-r from-indigo-500 to-purple-500">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Personal Information */}
              <div className="md:col-span-2">
                <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800 border-b-2 border-indigo-200 pb-2 flex items-center">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-2 md:mr-3">
                    <User className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                  Personal Information
                </h2>
              </div>
              
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  <User className="w-3 h-3 md:w-4 md:h-4 inline mr-1 md:mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 text-sm md:text-base"
                  placeholder="Enter your full name"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                  placeholder="Enter your email"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Appointment Details */}
              <div className="md:col-span-2">
                <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800 border-b-2 border-indigo-200 pb-2 mt-4 md:mt-6 flex items-center">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-2 md:mr-3">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                  Appointment Details
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Appointment Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Appointment Time
                </label>
                <input
                  type="text"
                  required
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                  placeholder="Selected time will appear here"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Appointment Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="appointmentType"
                      value="online"
                      checked={formData.appointmentType === "online"}
                      onChange={(e) => setFormData({...formData, appointmentType: e.target.value})}
                      className="mr-2"
                    />
                    Online Meeting
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="appointmentType"
                      value="offline"
                      checked={formData.appointmentType === "offline"}
                      onChange={(e) => setFormData({...formData, appointmentType: e.target.value})}
                      className="mr-2"
                    />
                    Office Visit
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Additional Message (Optional)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Any specific requirements, questions, or topics you'd like to discuss..."
                />
              </div>

              <div className="md:col-span-2 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Booking Appointment...
                    </div>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
      </div>
      </PageTransition>
    </SmartPageWrapper>
  );
}

export default BookAppointmentPage;