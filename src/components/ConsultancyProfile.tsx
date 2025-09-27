"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { useScrollLock } from "../hooks/useScrollLock";

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
          <p className="text-gray-600">
            Unable to load consultancy profile. Missing required data.
          </p>
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
  const [dateError, setDateError] = useState<string>("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [conflictModal, setConflictModal] = useState<{
    time: string;
    date: string;
  } | null>(null);

  // Lock scroll when modals are open
  useScrollLock(showWhyChooseUsModal || !!conflictModal);



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
        console.error("Error fetching review stats:", error);
      }
    };

    if (id) fetchReviewStats();
  }, [id]);

  // Generate time slots based on availability hours
  const generateTimeSlots = () => {
    const slots = [];
    const [startTime, endTime] = (availability?.hours || "").split(" - ");

    // Parse start and end times
    const parseTime = (timeStr: string) => {
      const [time, period] = (timeStr || "").split(" ");
      const [hours, minutes] = (time || "").split(":").map(Number);
      let hour24 = hours;
      if (period === "PM" && hours !== 12) hour24 += 12;
      if (period === "AM" && hours === 12) hour24 = 0;
      return hour24;
    };

    const startHour = parseTime(startTime);
    const endHour = parseTime(endTime);

    // Generate hourly slots
    for (let hour = startHour; hour < endHour; hour++) {
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour < 12 ? "AM" : "PM";
      slots.push(`${hour12.toString().padStart(2, "0")}:00 ${period}`);
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Store booked slots for reference but don't disable them
  React.useEffect(() => {
    if (selectedDate && user?.id) {
      // Convert YYYY-MM-DD to DD/MM/YYYY for API
      const [year, month, day] = selectedDate.split("-");
      const ddmmyyyy = `${day}/${month}/${year}`;

      console.log("Checking conflicts for date:", {
        selectedDate,
        ddmmyyyy,
        userId: user.id,
      });

      fetch(`/api/appointments/check?date=${ddmmyyyy}&userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Conflict check response:", data);
          if (data.success) {
            setBookedSlots(data.bookedTimes || []);
          }
        })
        .catch((err) => console.error("Error checking appointments:", err));
    } else {
      setBookedSlots([]);
    }
  }, [selectedDate, user?.id]);

  // Filter slots based on current time if today is selected (don't filter booked slots)
  const getAvailableSlots = () => {
    const today = new Date().toISOString().split("T")[0];
    const currentHour = new Date().getHours();

    // Only filter out past times if today is selected, keep all other slots available
    if (selectedDate === today) {
      return timeSlots.filter((slot) => {
        const [time, period] = (slot || "").split(" ");
        const [hours] = (time || "").split(":").map(Number);
        let hour24 = hours;
        if (period === "PM" && hours !== 12) hour24 += 12;
        if (period === "AM" && hours === 12) hour24 = 0;
        return hour24 > currentHour;
      });
    }

    // Return all time slots for future dates
    return timeSlots;
  };

  const availableSlots = getAvailableSlots();

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="h-48 md:h-64 w-full relative">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{name}</h1>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold text-sm md:text-base">{realRating}</span>
                  <span className="text-gray-500 text-sm md:text-base">
                    ({realReviewCount} reviews)
                  </span>
                </div>
                <span className="text-blue-600 text-sm md:text-base">{category}</span>
              </div>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                <span className="text-sm md:text-base">{location}</span>
              </div>
            </div>
            <div className="text-center md:text-right flex-shrink-0">
              <p className="text-xl md:text-2xl font-bold text-blue-600">
                {price.startsWith("$") ? price : `$${price}`}
              </p>
              <p className="text-gray-500 text-sm md:text-base">per session</p>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3">About Us</h3>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">{description}</p>
            </div>

            <div className="border-t pt-4 md:pt-6">
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Areas of Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {(expertise || []).map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-700 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Schedule an Appointment</h2>

          <div className="mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3">Appointment Type</h3>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <button
                className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-lg border text-sm md:text-base ${
                  appointmentType === "online"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                }`}
                onClick={() => setAppointmentType("online")}
              >
                Online Meeting
              </button>
              <button
                className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-lg border text-sm md:text-base ${
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

          <div className="mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3">Select Date</h3>
            <div className="relative">
              <div
                className={`relative cursor-pointer transition-all duration-300 select-none ${
                  dateError ? "transform scale-[0.98]" : ""
                }`}
                onClick={() => setShowCalendar(!showCalendar)}
                onMouseDown={(e) => e.preventDefault()}
                style={{ userSelect: "none", WebkitUserSelect: "none" }}
              >
                <div
                  className={`w-full p-3 border rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-between ${
                    dateError
                      ? "border-red-300 bg-red-50 animate-pulse"
                      : selectedDate
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300 bg-white hover:border-blue-400"
                  }`}
                >
                  <span
                    className={selectedDate ? "text-gray-900" : "text-gray-500"}
                  >
                    {selectedDate
                      ? new Date(selectedDate).toLocaleDateString("en-GB", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Select a date"}
                  </span>
                  <motion.div
                    animate={{ rotate: showCalendar ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.div>
                </div>
              </div>

              {/* Custom Calendar */}
              {showCalendar && (
                <motion.div
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <CustomCalendar
                    selectedDate={selectedDate}
                    onDateSelect={(date) => {
                      const selectedDay = new Date(date).toLocaleDateString(
                        "en-US",
                        { weekday: "long" }
                      );
                      const availableDays = availability?.days || [];
                      if (availableDays.includes(selectedDay)) {
                        setSelectedDate(date);
                        setSelectedTime("");
                        setDateError("");
                        setShowCalendar(false);
                      } else {
                        setDateError(
                          `${name} is not available on ${selectedDay}s`
                        );
                        setTimeout(() => setDateError(""), 4000);
                      }
                    }}
                    availableDays={availability?.days || []}
                    availability={availability}
                    minDate={new Date().toISOString().split("T")[0]}
                  />
                </motion.div>
              )}
            </div>
            <div className="mt-2">
              {/* <p className="text-sm text-gray-600">
                Available days: {(availability?.days || []).join(', ')}
              </p> */}
              {dateError && (
                <motion.div
                  className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <span className="text-red-500 text-lg">⚠️</span>
                  <div>
                    <p className="text-red-700 font-medium text-sm">
                      {dateError}
                    </p>
                    <p className="text-red-600 text-xs mt-1">
                      Please choose: {(availability?.days || []).join(", ")}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3">Select Time</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {timeSlots.map((time) => {
                const isAvailable =
                  selectedDate && availableSlots.includes(time);
                const isDisabled =
                  !selectedDate || !availableSlots.includes(time);
                return (
                  <button
                    key={time}
                    className={`p-2 text-xs md:text-sm border rounded-lg ${
                      selectedTime === time
                        ? "bg-blue-600 text-white border-blue-600"
                        : isAvailable
                          ? "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                          : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    }`}
                    onClick={() => {
                      if (isAvailable) {
                        setSelectedTime(time);
                      }
                    }}
                    disabled={isDisabled}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
            {!selectedDate && (
              <p className="text-gray-500 text-sm mt-2">
                Please select a date first to see available time slots
              </p>
            )}
            {availableSlots.length === 0 && selectedDate && (
              <p className="text-gray-500 text-sm mt-2">
                No available slots for selected date
              </p>
            )}
          </div>

          {isSignedIn ? (
            <button
              onClick={async () => {
                if (selectedDate && selectedTime) {
                  setIsCheckingConflict(true);

                  try {
                    // Convert YYYY-MM-DD to DD/MM/YYYY for API
                    const [year, month, day] = selectedDate.split("-");
                    const ddmmyyyy = `${day}/${month}/${year}`;

                    console.log("Final conflict check:", {
                      selectedDate,
                      ddmmyyyy,
                      selectedTime,
                      userId: user?.id,
                    });

                    // Check for conflicts before proceeding
                    const response = await fetch(
                      `/api/appointments/check?date=${ddmmyyyy}&userId=${user?.id}`
                    );
                    const data = await response.json();

                    console.log("Final conflict response:", data);

                    if (
                      data.success &&
                      data.bookedTimes.includes(selectedTime)
                    ) {
                      setConflictModal({ time: selectedTime, date: ddmmyyyy });
                      setSelectedTime("");
                      setIsCheckingConflict(false);
                      return;
                    }

                    // No conflict, proceed to booking (use original YYYY-MM-DD format for booking)
                    const params = new URLSearchParams({
                      consultancyId: id || "",
                      appointmentType,
                      date: selectedDate,
                      time: selectedTime,
                    });
                    window.location.href = `/book-appointment?${params.toString()}`;
                  } catch (error) {
                    console.error("Error checking conflicts:", error);
                    setIsCheckingConflict(false);
                  }
                } else {
                  // Show selection reminder without alert
                  const button = document.querySelector(".book-button");
                  if (button) {
                    button.classList.add("animate-pulse");
                    setTimeout(
                      () => button.classList.remove("animate-pulse"),
                      1000
                    );
                  }
                }
              }}
              disabled={isCheckingConflict}
              className={`book-button w-full py-3 rounded-lg font-semibold transition-all ${
                selectedDate && selectedTime && !isCheckingConflict
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 cursor-pointer"
                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
              }`}
            >
              {isCheckingConflict
                ? "Checking conflicts..."
                : "Book Appointment"}
            </button>
          ) : (
            <SignInButton>
              <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all">
                Sign In to Book Appointment
              </button>
            </SignInButton>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Contact Information</h2>

          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center">
              <Phone className="w-4 h-4 md:w-5 md:h-5 text-gray-500 mr-2 md:mr-3 flex-shrink-0" />
              <span className="text-sm md:text-base break-all">{contact?.phone || "Not provided"}</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 md:w-5 md:h-5 text-gray-500 mr-2 md:mr-3 flex-shrink-0" />
              <span className="text-sm md:text-base break-all">{contact?.email || "Not provided"}</span>
            </div>
            <div className="flex items-center">
              <Globe className="w-4 h-4 md:w-5 md:h-5 text-gray-500 mr-2 md:mr-3 flex-shrink-0" />
              <a
                href={contact?.website || "#"}
                className="text-blue-600 hover:underline text-sm md:text-base break-all"
              >
                {contact?.website || "Not provided"}
              </a>
            </div>
          </div>

          <div className="mt-6 md:mt-8">
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Availability</h3>
            <div className="flex items-center mb-2 md:mb-3">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-gray-500 mr-2 md:mr-3 flex-shrink-0" />
              <span className="text-sm md:text-base">{(availability?.days || []).join(", ")}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-gray-500 mr-2 md:mr-3 flex-shrink-0" />
              <span className="text-sm md:text-base">{availability?.hours || "Not specified"}</span>
            </div>
          </div>
          <div className="mt-6 md:mt-8">
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Why Choose Us</h3>
            {(() => {
              const items = Array.isArray(whyChooseUs)
                ? whyChooseUs
                : whyChooseUs
                  ? whyChooseUs.split(",").map((item) => item.trim())
                  : [
                      "Experienced professionals",
                      "Flexible scheduling",
                      "Personalized approach",
                      "Proven track record",
                    ];

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

      {/* Conflict Detection Modal */}
      {conflictModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setConflictModal(null)}
          onWheel={(e) => e.preventDefault()}
          onTouchMove={(e) => e.preventDefault()}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative overflow-hidden"
            initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotate: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 opacity-50" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full -translate-y-16 translate-x-16 opacity-30" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-100 rounded-full translate-y-12 -translate-x-12 opacity-30" />

            {/* Content */}
            <div className="relative z-10">
              {/* Animated Warning Icon */}
              <motion.div
                className="flex justify-center mb-6"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
              >
                <div className="relative">
                  <motion.div
                    className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center"
                    animate={{
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        "0 0 0 0 rgba(239, 68, 68, 0.4)",
                        "0 0 0 20px rgba(239, 68, 68, 0)",
                        "0 0 0 0 rgba(239, 68, 68, 0)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-white text-2xl font-bold">⚠</span>
                  </motion.div>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h3
                className="text-2xl font-bold text-center mb-4 text-gray-800"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Scheduling Conflict Detected!
              </motion.h3>

              {/* Message */}
              <motion.div
                className="text-center mb-6 space-y-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-gray-700 text-lg">
                  You already have an appointment at
                </p>
                <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                  <p className="font-bold text-red-800 text-xl">
                    {conflictModal.time} on {conflictModal.date}
                  </p>
                </div>
                <p className="text-gray-600">
                  You cannot be in two places at the same time! 🤷‍♂️
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                className="flex gap-3"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  onClick={() => setConflictModal(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Choose Different Time
                </button>
                <button
                  onClick={() => {
                    setConflictModal(null);
                    // Optionally navigate to dashboard to manage existing appointments
                    window.location.href = "/dashboard";
                  }}
                  className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  View My Appointments
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Why Choose Us Modal */}
      {showWhyChooseUsModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowWhyChooseUsModal(false)}
          onWheel={(e) => e.preventDefault()}
          onTouchMove={(e) => e.preventDefault()}
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
              Why Choose Us
            </motion.h3>
            <motion.ul
              className="space-y-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              {(Array.isArray(whyChooseUs)
                ? whyChooseUs
                : whyChooseUs
                  ? whyChooseUs.split(",").map((item) => item.trim())
                  : [
                      "Experienced professionals",
                      "Flexible scheduling",
                      "Personalized approach",
                      "Proven track record",
                    ]
              ).map((item, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>{item}</span>
                </li>
              ))}
            </motion.ul>
            <motion.button
              onClick={() => setShowWhyChooseUsModal(false)}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors mt-4"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Custom Calendar Component
const CustomCalendar = ({
  selectedDate,
  onDateSelect,
  availableDays,
  availability,
  minDate,
}: {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  availableDays: string[];
  availability?: { days: string[]; hours: string };
  minDate: string;
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());

  const days = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1 - firstDay.getDay() + i
    );
    days.push(date);
  }

  const isDateAvailable = (date: Date) => {
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    const isValidDay = availableDays.includes(dayName) && checkDate >= today;

    // If it's today, check if working hours are still available
    if (isToday(date) && isValidDay) {
      const now = new Date();
      const currentHour = now.getHours();

      // Parse consultancy hours (assuming format like "9:00 AM - 6:00 PM")
      const hours = availability?.hours || "9:00 AM - 6:00 PM";
      const [, endTime] = hours.split(" - ");
      const [time, period] = endTime.split(" ");
      const [endHour] = time.split(":").map(Number);
      let endHour24 = endHour;
      if (period === "PM" && endHour !== 12) endHour24 += 12;
      if (period === "AM" && endHour === 12) endHour24 = 0;

      // Return true only if current time is before end of working hours
      return currentHour < endHour24;
    }

    return isValidDay;
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    return selectedDate === dateStr;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  return (
    <div className="p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
            )
          }
          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <svg
            className="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h3>
        </div>

        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
            )
          }
          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <svg
            className="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const available = isDateAvailable(date);
          const today = isToday(date);
          const selected = isSelected(date);
          const currentMonth = isCurrentMonth(date);

          return (
            <button
              key={date.getTime()}
              onClick={(e) => {
                e.preventDefault();
                if (available) {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  const dateStr = `${year}-${month}-${day}`;
                  onDateSelect(dateStr);
                }
              }}
              className={`
                h-9 w-9 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  !currentMonth
                    ? "text-gray-300"
                    : available
                      ? "text-gray-900 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                      : "text-gray-400 cursor-not-allowed"
                }
                ${
                  selected
                    ? "bg-blue-500 text-white shadow-md"
                    : today && available
                      ? "bg-blue-100 text-blue-700 ring-2 ring-blue-200"
                      : ""
                }
              `}
              disabled={!available}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ConsultancyProfile;
