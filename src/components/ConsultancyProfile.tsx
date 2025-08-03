"use client";
import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useUser, SignInButton } from "@clerk/nextjs";
import { appointmentManager } from "../utils/appointmentManager";

interface ConsultancyProfileProps {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  description: string;
  location: string;
  expertise: string[];
  price: string;
  whyChooseUs?: string | string[];
  availability: {
    days: string[];
    hours: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
}

const ConsultancyProfile: React.FC<ConsultancyProfileProps> = ({
  id,
  name,
  rating,
  reviews,
  image,
  category,
  description,
  location,
  expertise,
  price,
  whyChooseUs,
  availability,
  contact,
}) => {
  // Add null checks for required props
  if (!id || !name || !availability || !contact) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-600">Unable to load consultancy profile. Missing required data.</p>
        </div>
      </div>
    );
  }
  const { isSignedIn, user } = useUser();
  const [appointmentType, setAppointmentType] = useState<"online" | "offline">(
    "online"
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [showWhyChooseUsModal, setShowWhyChooseUsModal] = useState(false);


  const [realRating, setRealRating] = useState(rating || 5.0);
  const [realReviewCount, setRealReviewCount] = useState(reviews || 0);

  React.useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        const response = await fetch(`/api/reviews/stats/${id}`);
        const result = await response.json();
        if (result.success) {
          setRealRating(result.data.averageRating || 5.0);
          setRealReviewCount(result.data.totalReviews || 0);
        }
      } catch (error) {
        console.error('Error fetching review stats:', error);
      }
    };
    
    if (id) fetchReviewStats();
  }, [id]);

  // Generate time slots based on availability hours
  const generateTimeSlots = () => {
    const slots = [];
    const [startTime, endTime] = (availability?.hours || '').split(' - ');
    
    // Parse start and end times
    const parseTime = (timeStr: string) => {
      const [time, period] = (timeStr || '').split(' ');
      const [hours, minutes] = (time || '').split(':').map(Number);
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) hour24 += 12;
      if (period === 'AM' && hours === 12) hour24 = 0;
      return hour24;
    };
    
    const startHour = parseTime(startTime);
    const endHour = parseTime(endTime);
    
    // Generate hourly slots
    for (let hour = startHour; hour < endHour; hour++) {
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour < 12 ? 'AM' : 'PM';
      slots.push(`${hour12.toString().padStart(2, '0')}:00 ${period}`);
    }
    
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  // Filter slots based on current time if today is selected
  const getAvailableSlots = () => {
    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();
    
    if (selectedDate === today) {
      return timeSlots.filter(slot => {
        const [time, period] = (slot || '').split(' ');
        const [hours] = (time || '').split(':').map(Number);
        let hour24 = hours;
        if (period === 'PM' && hours !== 12) hour24 += 12;
        if (period === 'AM' && hours === 12) hour24 = 0;
        return hour24 > currentHour;
      });
    }
    
    return timeSlots;
  };
  
  const availableSlots = getAvailableSlots();



  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="h-64 w-full relative">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
        <div className="p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-semibold">{realRating}</span>
                <span className="text-gray-500">({realReviewCount} reviews)</span>
                <span className="text-blue-600 ml-2">{category}</span>
              </div>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                {location}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                {price.startsWith('$') ? price : `$${price}`}
              </p>
              <p className="text-gray-500">per session</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">About Us</h3>
              <p className="text-gray-700">{description}</p>
            </div>
            
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Areas of Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {(expertise || []).map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Booking Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Schedule an Appointment</h2>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Appointment Type</h3>
            <div className="flex gap-4">
              <button
                className={`flex-1 py-3 px-4 rounded-lg border ${
                  appointmentType === "online"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                }`}
                onClick={() => setAppointmentType("online")}
              >
                Online Meeting
              </button>
              <button
                className={`flex-1 py-3 px-4 rounded-lg border ${
                  appointmentType === "offline"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                }`}
                onClick={() => setAppointmentType("offline")}
              >
                Office Visit
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Select Date</h3>
            <input
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Select Time</h3>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => {
                const isAvailable = selectedDate && availableSlots.includes(time);
                const isDisabled = !selectedDate || !availableSlots.includes(time);
                return (
                  <button
                    key={time}
                    className={`p-2 text-sm border rounded-lg ${
                      selectedTime === time
                        ? "bg-blue-600 text-white border-blue-600"
                        : isAvailable
                        ? "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                        : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    }`}
                    onClick={() => isAvailable && setSelectedTime(time)}
                    disabled={isDisabled}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
            {!selectedDate && (
              <p className="text-gray-500 text-sm mt-2">Please select a date first to see available time slots</p>
            )}
            {availableSlots.length === 0 && selectedDate && (
              <p className="text-gray-500 text-sm mt-2">No available slots for selected date</p>
            )}
          </div>

          {isSignedIn ? (
            <button 
              onClick={() => {
                if (selectedDate && selectedTime) {
                  console.log('Booking with ID:', id);
                  const params = new URLSearchParams({
                    consultancyId: id || '',
                    appointmentType,
                    date: selectedDate,
                    time: selectedTime
                  });
                  console.log('URL params:', params.toString());
                  window.location.href = `/book-appointment?${params.toString()}`;
                } else {
                  alert('Please select both date and time');
                }
              }}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                selectedDate && selectedTime
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 cursor-pointer"
                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
              }`}
            >
              Book Appointment
            </button>
          ) : (
            <SignInButton>
              <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all">
                Sign In to Book Appointment
              </button>
            </SignInButton>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-500 mr-3" />
              <span>{contact?.phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-500 mr-3" />
              <span>{contact?.email || 'Not provided'}</span>
            </div>
            <div className="flex items-center">
              <Globe className="w-5 h-5 text-gray-500 mr-3" />
              <a
                href={contact?.website || '#'}
                className="text-blue-600 hover:underline"
              >
                {contact?.website || 'Not provided'}
              </a>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Availability</h3>
            <div className="flex items-center mb-3">
              <Calendar className="w-5 h-5 text-gray-500 mr-3" />
              <span>{(availability?.days || []).join(", ")}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-500 mr-3" />
              <span>{availability?.hours || 'Not specified'}</span>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Why Choose Us</h3>
            {(() => {
              const items = Array.isArray(whyChooseUs) ? whyChooseUs : 
                whyChooseUs ? whyChooseUs.split(',').map(item => item.trim()) : 
                ['Experienced professionals', 'Flexible scheduling', 'Personalized approach', 'Proven track record'];
              
              const visibleItems = items.slice(0, 3);
              const hasMore = items.length > 3;
              
              return (
                <ul className="space-y-3">
                  {visibleItems.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>{item}</span>
                    </li>
                  ))}
                  {hasMore && (
                    <li className="flex items-center">
                      <button
                        onClick={() => setShowWhyChooseUsModal(true)}
                        className="flex items-center bg-white border border-black text-black px-3 py-1 rounded-full text-sm hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {items.length - 3} more
                      </button>
                    </li>
                  )}
                </ul>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Why Choose Us Modal */}
      {showWhyChooseUsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Why Choose Us</h3>
            <ul className="space-y-3 max-h-64 overflow-y-auto">
              {(Array.isArray(whyChooseUs) ? whyChooseUs : 
                whyChooseUs ? whyChooseUs.split(',').map(item => item.trim()) : 
                ['Experienced professionals', 'Flexible scheduling', 'Personalized approach', 'Proven track record']
              ).map((item, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowWhyChooseUsModal(false)}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultancyProfile;
