"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Tag,
  DollarSign,
  FileText,
  Globe,
  Star,
  Clock,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../Navbar";

const ConsultancySetupForm: React.FC = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formType, setFormType] = useState<"new" | "existing">("new");

  const [formData, setFormData] = useState({
    // Basic info
    name: "",
    category: "",
    description: "",
    location: "",
    price: "",
    whyChooseUs: "",
    image:
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=60", // Default image

    // Contact info
    phone: "",
    email: "",
    website: "",
    password: "",

    // Expertise (comma separated)
    expertise: "",

    // Availability
    availableDays: [] as string[],
    availableHours: "",

    // For existing consultancy
    existingEmail: "",
    existingPassword: "",
  });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const categories = [
    "Business Strategy",
    "Financial Services",
    "Legal Advisory",
    "Technology",
    "Health & Wellness",
    "Real Estate & Housing",
    "Career Consultation",
    "Lifestyle & Personal Growth",
    "Travel & Hospitality",
    "Miscellaneous",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (day: string) => {
    setFormData((prev) => {
      const updatedDays = prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day];

      return { ...prev, availableDays: updatedDays };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (formType === "new") {
        // Format data according to schema
        const consultancyData = {
          name: formData.name,
          rating: 0, // Default for new consultancy
          reviews: 0, // Default for new consultancy
          image: formData.image,
          category: formData.category,
          description: formData.description,
          location: formData.location,
          expertise: formData.expertise.split(",").map((item) => item.trim()),
          price: formData.price,
          whyChooseUs: formData.whyChooseUs,
          availability: {
            days: formData.availableDays,
            hours: formData.availableHours,
          },
          contact: {
            phone: formData.phone,
            email: formData.email,
            website: formData.website,
            password: formData.password,
          },
        };

        // Register new consultancy via API
        const response = await fetch("/api/consultancies/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(consultancyData),
        });

        const result = await response.json();

        if (result.success) {
          // Save consultancyId to localStorage
          if (result.consultancyId) {
            localStorage.setItem("consultancyId", result.consultancyId);
          }

          alert("Consultancy registered successfully!");
          window.location.href = "/consultancy-admin";
        } else {
          alert(result.error || "Registration failed. Please try again.");
        }
      } else {
        // For existing consultancy sign in
        const response = await fetch("/api/consultancies/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.existingEmail,
            password: formData.existingPassword,
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Save consultancyId to localStorage
          if (result.consultancyId) {
            localStorage.setItem("consultancyId", result.consultancyId);
          }

          alert("Login successful!");
          window.location.href = "/consultancy-admin";
        } else {
          alert(result.error || "Invalid email or password.");
        }
      }
    } catch (error) {
      console.error("Error in consultancy setup:", error);
      alert("There was an error processing your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center mb-2">
              Consultancy Setup
            </h1>
            <p className="text-gray-600 text-center mb-8">
              {formType === "new"
                ? "Register your consultancy to start offering services"
                : "Sign in to your existing consultancy account"}
            </p>

            <div className="flex justify-center mb-8">
              <div className="relative bg-gray-100 p-1 rounded-lg">
                <motion.div
                  className="absolute top-1 bottom-1 bg-indigo-600 rounded-md shadow-lg"
                  initial={false}
                  animate={{
                    left: formType === "new" ? "4px" : "50%",
                    width: "calc(50% - 4px)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <button
                  type="button"
                  onClick={() => setFormType("new")}
                  className={`relative z-10 px-6 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    formType === "new"
                      ? "text-white"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  New Consultancy
                </button>
                <button
                  type="button"
                  onClick={() => setFormType("existing")}
                  className={`relative z-10 px-6 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    formType === "existing"
                      ? "text-white"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Existing Consultancy
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {formType === "new" ? (
                  <motion.div
                    key="new"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <>
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                          Basic Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Consultancy Name*
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Building className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Your consultancy name"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Category*
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Tag className="h-5 w-5 text-gray-400" />
                              </div>
                              <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                              >
                                <option value="">Select a category</option>
                                {categories.map((category) => (
                                  <option key={category} value={category}>
                                    {category}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Location*
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="City, State"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Price (per session)*
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <DollarSign className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="$250/hour"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description*
                          </label>
                          <div className="relative">
                            <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                              <FileText className="h-5 w-5 text-gray-400" />
                            </div>
                            <textarea
                              name="description"
                              value={formData.description}
                              onChange={handleChange}
                              required
                              rows={3}
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Tell potential clients about your consultancy services..."
                            ></textarea>
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Why Choose Us (comma separated)*
                          </label>
                          <textarea
                            name="whyChooseUs"
                            value={formData.whyChooseUs}
                            onChange={handleChange}
                            rows={2}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="What makes your consultancy stand out..."
                          ></textarea>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Image URL*
                          </label>
                          <input
                            type="url"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expertise (comma separated)*
                          </label>
                          <input
                            type="text"
                            name="expertise"
                            value={formData.expertise}
                            onChange={handleChange}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Business Strategy, Market Analysis, Financial Planning"
                          />
                        </div>
                      </div>

                      <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                          Contact Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email Address*
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="contact@example.com"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number*
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="+1 (555) 123-4567"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Website
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Globe className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="https://example.com"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Password*
                            </label>
                            <input
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              required
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                          Availability
                        </h2>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Available Days*
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {daysOfWeek.map((day) => (
                              <div key={day} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={day}
                                  checked={formData.availableDays.includes(day)}
                                  onChange={() => handleCheckboxChange(day)}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label
                                  htmlFor={day}
                                  className="ml-2 block text-sm text-gray-700"
                                >
                                  {day}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Available Hours*
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Clock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              name="availableHours"
                              value={formData.availableHours}
                              onChange={handleChange}
                              required
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="9:00 AM - 5:00 PM"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  </motion.div>
                ) : (
                  <motion.div
                    key="existing"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="existingEmail"
                            value={formData.existingEmail}
                            onChange={handleChange}
                            required
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="contact@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          name="existingPassword"
                          value={formData.existingPassword}
                          onChange={handleChange}
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    "Processing..."
                  ) : (
                    <>
                      {formType === "new" ? "Register Consultancy" : "Sign In"}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultancySetupForm;
