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
} from "lucide-react";
import { Link } from "react-router-dom";

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
  name,
  rating,
  reviews,
  image,
  category,
  description,
  location,
  expertise,
  price,
  availability,
  contact,
}) => {
  const [appointmentType, setAppointmentType] = useState<"online" | "offline">(
    "online"
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];

  const handleBookAppointment = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select both date and time for your appointment");
      return;
    }

    // Here we would typically make an API call to book the appointment
    console.log("Booking appointment:", {
      type: appointmentType,
      date: selectedDate,
      time: selectedTime,
    });

    alert("Appointment booked successfully!");
  };

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
                <span className="font-semibold">{rating}</span>
                <span className="text-gray-500">({reviews} reviews)</span>
                <span className="text-blue-600 ml-2">{category}</span>
              </div>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                {location}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{price}</p>
              <p className="text-gray-500">per session</p>
            </div>
          </div>

          <p className="text-gray-700 mb-6">{description}</p>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Areas of Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {expertise.map((skill, index) => (
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
              {timeSlots.map((time) => (
                <button
                  key={time}
                  className={`p-2 text-sm border rounded-lg ${
                    selectedTime === time
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                  }`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <button
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            // onClick={handleBookAppointment}
          >
            <Link to="/book-appointment">Book Appointment</Link>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-500 mr-3" />
              <span>{contact.phone}</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-500 mr-3" />
              <span>{contact.email}</span>
            </div>
            <div className="flex items-center">
              <Globe className="w-5 h-5 text-gray-500 mr-3" />
              <a
                href={contact.website}
                className="text-blue-600 hover:underline"
              >
                {contact.website}
              </a>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Availability</h3>
            <div className="flex items-center mb-3">
              <Calendar className="w-5 h-5 text-gray-500 mr-3" />
              <span>{availability.days.join(", ")}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-500 mr-3" />
              <span>{availability.hours}</span>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Why Choose Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>Experienced professionals</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>Flexible scheduling</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>Personalized approach</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>Proven track record</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultancyProfile;
