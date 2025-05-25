import React, { useState } from "react";
import {
  Calendar,
  Clock,
  CreditCard,
  Users,
  MessageSquare,
  CheckCircle,
} from "lucide-react";

interface AppointmentBookingProps {
  price: string;
  availability: {
    days: string[];
    hours: string;
  };
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  price,
  availability,
}) => {
  const [appointmentType, setAppointmentType] = useState<"online" | "offline">(
    "online"
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [participants, setParticipants] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const [step, setStep] = useState<number>(1);

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];

  const handleNextStep = () => {
    if (step === 1 && (!selectedDate || !selectedTime)) {
      alert("Please select both date and time for your appointment");
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      handleBookAppointment();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleBookAppointment = () => {
    // Here we would typically make an API call to book the appointment
    console.log("Booking appointment:", {
      type: appointmentType,
      date: selectedDate,
      time: selectedTime,
      participants,
      notes,
      paymentMethod,
    });

    alert("Appointment booked successfully!");

    // Reset form
    setSelectedDate("");
    setSelectedTime("");
    setParticipants(1);
    setNotes("");
    setStep(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">Schedule an Appointment</h2>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            1
          </div>
          <div
            className={`h-1 w-12 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}
          ></div>
        </div>
        <div className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            2
          </div>
          <div
            className={`h-1 w-12 ${step >= 3 ? "bg-blue-600" : "bg-gray-200"}`}
          ></div>
        </div>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
          }`}
        >
          3
        </div>
      </div>

      {/* Step 1: Select Date & Time */}
      {step === 1 && (
        <div className="transition-opacity duration-300">
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
            <div className="flex items-center mb-3">
              <Calendar className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">Select Date</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg mb-3">
              <p className="text-sm text-gray-600 mb-2">Available days:</p>
              <p className="font-medium">{availability.days.join(", ")}</p>
            </div>
            <input
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-3">
              <Clock className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">Select Time</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg mb-3">
              <p className="text-sm text-gray-600 mb-2">Working hours:</p>
              <p className="font-medium">{availability.hours}</p>
            </div>
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
        </div>
      )}

      {/* Step 2: Additional Details */}
      {step === 2 && (
        <div className="transition-opacity duration-300">
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">Number of Participants</h3>
            </div>
            <div className="flex items-center">
              <button
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center"
                onClick={() => setParticipants(Math.max(1, participants - 1))}
              >
                -
              </button>
              <span className="mx-4 text-lg font-medium w-8 text-center">
                {participants}
              </span>
              <button
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center"
                onClick={() => setParticipants(participants + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-3">
              <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">Additional Notes</h3>
            </div>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Any specific topics you'd like to discuss or questions you have..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div className="transition-opacity duration-300">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Appointment Summary</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">
                  {appointmentType === "online"
                    ? "Online Meeting"
                    : "Office Visit"}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Participants:</span>
                <span className="font-medium">{participants}</span>
              </div>
              <div className="border-t border-gray-200 my-3 pt-3 flex justify-between">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-blue-600">{price}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
            <div className="flex gap-4 mb-4">
              <button
                className={`flex-1 py-3 px-4 rounded-lg border ${
                  paymentMethod === "card"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                }`}
                onClick={() => setPaymentMethod("card")}
              >
                Credit Card
              </button>
              <button
                className={`flex-1 py-3 px-4 rounded-lg border ${
                  paymentMethod === "paypal"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                }`}
                onClick={() => setPaymentMethod("paypal")}
              >
                PayPal
              </button>
            </div>

            {paymentMethod === "card" && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <button
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            onClick={handlePrevStep}
          >
            Back
          </button>
        ) : (
          <div></div> // Empty div to maintain flex spacing
        )}

        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          onClick={handleNextStep}
        >
          {step < 3 ? "Continue" : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
};

export default AppointmentBooking;
