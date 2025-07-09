"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const BookingPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    // Get URL parameters
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    
    // Convert 12-hour time to 24-hour format for input
    const convertTo24Hour = (time12h) => {
      if (!time12h) return '';
      const [time, modifier] = time12h.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    };
    
    // Pre-fill form data
    setFormData(prev => ({
      ...prev,
      name: user?.fullName || user?.firstName || '',
      email: user?.emailAddresses?.[0]?.emailAddress || '',
      contact: user?.phoneNumbers?.[0]?.phoneNumber || '',
      date: date || '',
      time: convertTo24Hour(time) || ''
    }));
  }, [user, searchParams]);

  // Handle form changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const consultancyId = searchParams.get('consultancyId');
      const appointmentType = searchParams.get('appointmentType') || 'online';
      
      console.log('URL params:', {
        consultancyId,
        appointmentType,
        allParams: Object.fromEntries(searchParams.entries())
      });
      
      if (!consultancyId || consultancyId === 'undefined') {
        alert('Missing consultancy information. Please try again.');
        setIsSubmitting(false);
        return;
      }
      
      const appointmentData = {
        consultancyId,
        clientId: user?.id || 'guest',
        clientName: formData.name,
        clientEmail: formData.email,
        clientPhone: formData.contact,
        appointmentDate: new Date(formData.date),
        appointmentTime: formData.time,
        appointmentType,
        message: `Appointment booked via ${appointmentType} consultation`
      };
      
      console.log('Sending appointment data:', appointmentData);
      
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert("Appointment booked successfully!");
        router.push("/dashboard");
      } else {
        alert(`Failed to book appointment: ${result.error}`);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert("Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          disabled={isSubmitting}
          className={`w-full py-2 rounded-md transition ${
            isSubmitting 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
};

export default BookingPage;
