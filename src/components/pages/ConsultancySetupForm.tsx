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
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../Navbar";

const ConsultancySetupForm: React.FC = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formType, setFormType] = useState<"new" | "existing">("new");
  const [verificationStep, setVerificationStep] = useState<"form" | "verify" | "complete">("form");
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [consultancyId, setConsultancyId] = useState("");
  const [sentCodes, setSentCodes] = useState<{emailCode: string, phoneCode: string} | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showExistingPassword, setShowExistingPassword] = useState(false);

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
    confirmPassword: "",

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
    
    // Validate password confirmation for new consultancy
    if (formType === "new" && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match. Please check and try again.");
      return;
    }
    
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
          whyChooseUs: formData.whyChooseUs.split(",").map((item) => item.trim()).filter(item => item.length > 0),
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
          setConsultancyId(result.consultancyId);
          
          // Send verification codes
          const codeResponse = await fetch("/api/consultancies/send-verification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ consultancyId: result.consultancyId })
          });
          
          const codeResult = await codeResponse.json();
          if (codeResult.success) {
            setSentCodes({
              emailCode: codeResult.emailCode,
              phoneCode: codeResult.phoneCode
            });
            setVerificationStep("verify");
          }
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
          localStorage.setItem("consultancyId", result.consultancyId);
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

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/consultancies/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultancyId,
          emailCode,
          phoneCode
        })
      });

      const result = await response.json();

      if (result.success) {
        setVerificationStep("complete");
      } else {
        alert(result.error || "Verification failed. Please try again.");
      }
    } catch (error) {
      alert("Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verificationStep === "verify") {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">📱</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Details</h2>
                <p className="text-gray-600">We've sent verification codes to your email and phone</p>
                
                {/* Demo: Show codes for testing */}
                {sentCodes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <p className="text-sm font-semibold text-yellow-800 mb-2">📝 Demo Codes (For Testing):</p>
                    <div className="text-sm text-yellow-700">
                      <p><strong>Email Code:</strong> {sentCodes.emailCode}</p>
                      <p><strong>Phone Code:</strong> {sentCodes.phoneCode}</p>
                    </div>
                    <p className="text-xs text-yellow-600 mt-2">
                      In production, these would be sent via SMS/Email
                    </p>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleVerification}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Verification Code
                  </label>
                  <input
                    type="text"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Verification Code
                  </label>
                  <input
                    type="text"
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {isSubmitting ? "Verifying..." : "Verify Codes"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStep === "complete") {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-green-200">
            <div className="mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Woohoo! You're In! 🚀
              </h2>
              <p className="text-gray-600 mb-4">
                Your consultancy has been successfully registered and is now under our super-duper verification process!
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl mr-2">⏳</span>
                <span className="font-semibold text-yellow-800">Status: Under Verification</span>
              </div>
              <p className="text-sm text-yellow-700 mb-2">
                Our team of expert ninjas 🥷 are reviewing your application with the precision of a Swiss watch!
              </p>
              <p className="text-xs text-yellow-600">
                • Usually takes 2-3 working days<br/>
                • We'll notify you once approved<br/>
                • You can check status anytime
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => window.location.href = "/consultancy-status"}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                📈 Check Status
              </button>
              
              <button
                onClick={() => window.location.href = "/"}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
              >
                🏠 Back to Home
              </button>
            </div>
            
            <p className="text-xs text-gray-500">
              Questions? We're here to help! Contact us anytime 💬
            </p>
          </div>
        </div>
      </div>
    );
  }

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

            {/* Status Check Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Already Registered?
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Check your consultancy verification status
                </p>
                <button
                  type="button"
                  onClick={() => window.location.href = "/consultancy-status"}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  🔍 Check Status
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
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="block w-full px-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="••••••••"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-indigo-600 transition-colors"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <Eye className="h-5 w-5 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Confirm Password*
                            </label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className={`block w-full px-3 pr-10 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                                  formData.confirmPassword && formData.password !== formData.confirmPassword
                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                    : "border-gray-300"
                                }`}
                                placeholder="••••••••"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-indigo-600 transition-colors"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <Eye className="h-5 w-5 text-gray-400" />
                                )}
                              </button>
                            </div>
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                              <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                            )}
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
                        <div className="relative">
                          <input
                            type={showExistingPassword ? "text" : "password"}
                            name="existingPassword"
                            value={formData.existingPassword}
                            onChange={handleChange}
                            required
                            className="block w-full px-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowExistingPassword(!showExistingPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-indigo-600 transition-colors"
                          >
                            {showExistingPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
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
