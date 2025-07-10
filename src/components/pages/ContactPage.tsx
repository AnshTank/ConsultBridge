"use client";
import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, User, Building, Send } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Navbar from "../Navbar";
import PageTransition from "../PageTransition";

function ContactPage() {
  const { user } = useUser();
  const [name, setName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(
    user?.emailAddresses?.[0]?.emailAddress || ""
  );
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [userType, setUserType] = useState<
    "user" | "consultancy" | "enterprise"
  >(user?.publicMetadata?.role === "consultancy" ? "consultancy" : "user");
  const [inquiryType, setInquiryType] = useState("General Inquiry");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [preferredContactMethod, setPreferredContactMethod] = useState("Email");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name || !email || !subject || !message) {
      alert("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          company,
          userType,
          inquiryType,
          subject,
          message,
          priority,
          preferredContactMethod,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        setName(user?.fullName || "");
        setEmail(user?.emailAddresses?.[0]?.emailAddress || "");
        setPhone("");
        setCompany("");
        setInquiryType("General Inquiry");
        setSubject("");
        setMessage("");
        setPriority("Medium");
        setPreferredContactMethod("Email");

        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
          <Navbar />
        </header>

        <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
              <p className="text-xl text-indigo-100 leading-relaxed">
                Have questions or feedback? We'd love to hear from you.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-8 flex flex-col h-full">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">
                  Contact Information
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <MapPin className="w-6 h-6 text-indigo-500 mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-800">
                        Our Office
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        123 Innovation Drive
                        <br />
                        Vadodara, P.C. 391760
                        <br />
                        India
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="w-6 h-6 text-purple-500 mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-800">
                        Phone Support
                      </h4>
                      <p className="text-gray-600">+91 95102-99313</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Available 24/7 for urgent matters
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="w-6 h-6 text-pink-500 mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-800">
                        Email Support
                      </h4>
                      <p className="text-gray-600">support@consultbridge.com</p>
                      <p className="text-sm text-gray-500 mt-1">
                        We respond within 24 hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="w-6 h-6 text-indigo-600 mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-800">
                        Business Hours
                      </h4>
                      <p className="text-gray-600">
                        Monday - Friday: 9:00 AM - 6:00 PM PST
                        <br />
                        Saturday: 10:00 AM - 4:00 PM PST
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-grow flex items-center justify-center mt-8">
                  <div className="text-center p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 rounded-2xl border border-slate-200 w-full">
                    <div className="text-base text-slate-600 font-light leading-relaxed space-y-2">
                      <p className="text-blue-600">
                        "Where expertise meets opportunity,
                      </p>
                      <p className="text-slate-700">
                        Every connection sparks innovation,
                      </p>
                      <p className="text-purple-600">
                        Building bridges to your success,
                      </p>
                      <p className="text-slate-800 font-medium">
                        ConsultBridge - Your growth partner."
                      </p>
                    </div>
                    <div className="mt-6 w-20 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mx-auto rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6">Send Us a Message</h3>
                {submitted && (
                  <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6">
                    <p className="font-semibold">
                      Message sent successfully! 🎉
                    </p>
                    <p>We'll get back to you within 24 hours.</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* User Type Selection */}
                  <div>
                    <label className="text-gray-700 text-sm font-semibold mb-3 block">
                      I am contacting as a:
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setUserType("user")}
                        className={`flex items-center px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                          userType === "user"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Individual User
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType("consultancy")}
                        className={`flex items-center px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                          userType === "consultancy"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        <Building className="w-4 h-4 mr-2" />
                        Consultancy
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType("enterprise")}
                        className={`flex items-center px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                          userType === "enterprise"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        <Building className="w-4 h-4 mr-2" />
                        Enterprise
                      </button>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-700 text-sm font-semibold mb-2 block">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 text-sm font-semibold mb-2 block">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-700 text-sm font-semibold mb-2 block">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 text-sm font-semibold mb-2 block">
                        Company/Organization
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter company name (optional)"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Inquiry Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-700 text-sm font-semibold mb-2 block">
                        Inquiry Type *
                      </label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={inquiryType}
                        onChange={(e) => setInquiryType(e.target.value)}
                        required
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Partnership">
                          Partnership Opportunity
                        </option>
                        <option value="Technical Support">
                          Technical Support
                        </option>
                        <option value="Business Development">
                          Business Development
                        </option>
                        <option value="Media Inquiry">Media Inquiry</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-700 text-sm font-semibold mb-2 block">
                        Priority Level
                      </label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-700 text-sm font-semibold mb-2 block">
                      Subject *
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Brief subject of your inquiry"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-gray-700 text-sm font-semibold mb-2 block">
                      Message *
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      rows={5}
                      placeholder="Please provide detailed information about your inquiry..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    ></textarea>
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {message.length}/1000 characters
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-700 text-sm font-semibold mb-2 block">
                      Preferred Contact Method
                    </label>
                    <div className="flex gap-4">
                      {["Email", "Phone", "Either"].map((method) => (
                        <label key={method} className="flex items-center">
                          <input
                            type="radio"
                            name="contactMethod"
                            value={method}
                            checked={preferredContactMethod === method}
                            onChange={(e) =>
                              setPreferredContactMethod(e.target.value)
                            }
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">
                            {method}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setName(user?.fullName || "");
                        setEmail(user?.emailAddresses?.[0]?.emailAddress || "");
                        setPhone("");
                        setCompany("");
                        setInquiryType("General Inquiry");
                        setSubject("");
                        setMessage("");
                        setPriority("Medium");
                        setPreferredContactMethod("Email");
                      }}
                      className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                    >
                      Reset Form
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                      <Send className="ml-2 w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default ContactPage; // ✅ Fix: Added default export
