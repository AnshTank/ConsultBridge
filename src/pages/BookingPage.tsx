import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react"; // Clerk for user details
import { useNavigate } from "react-router-dom";

const BookingPage: React.FC = () => {
  const { user } = useUser(); // Get logged-in user details
  const navigate = useNavigate();

  // Pre-fill form details if user is signed in
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    date: "",
    time: "",
    paymentMethod: "Card", // Default payment option
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        contact: user.publicMetadata?.phone || "", // Assuming Clerk stores phone in publicMetadata
      }));
    }

    // Auto-select date & time (next available slot)
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30 - (now.getMinutes() % 30)); // Round to next 30 mins
    setFormData((prev) => ({
      ...prev,
      date: now.toISOString().split("T")[0], // Format: YYYY-MM-DD
      time: now.toTimeString().slice(0, 5), // Format: HH:MM
    }));
  }, [user]);

  // Handle form changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission (redirect to Home after successful payment)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Appointment booked successfully!");
    navigate("/");
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">
        Book Your Appointment
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block font-medium">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Contact */}
        <div>
          <label className="block font-medium">Contact Number</label>
          <input
            type="tel"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Date & Time */}
        <div className="flex gap-4">
          <div>
            <label className="block font-medium">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block font-medium">Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block font-medium">Payment Method</label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="Card">Credit/Debit Card</option>
            <option value="PayPal">PayPal</option>
            <option value="UPI">UPI</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Proceed to Payment
        </button>
      </form>
    </div>
  );
};

export default BookingPage;
