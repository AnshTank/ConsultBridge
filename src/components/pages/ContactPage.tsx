"use client";
import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, User, Building, Send } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Navbar from "../Navbar";
import PageTransition from "../PageTransition";
import Footer from "../Footer";
import SmartPageWrapper from "../SmartPageWrapper";

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
    <SmartPageWrapper loadingMessage="📞 Connecting you to our support team...">
      <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-all duration-300">
        <Navbar />

        <section className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:bg-gradient-to-br dark:from-slate-900 dark:via-gray-900 dark:to-black text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-blue-900/30 dark:via-purple-900/40 dark:to-pink-900/30"></div>
          <div className="relative z-10">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
              <p className="text-xl text-indigo-100 leading-relaxed">
                Have questions or feedback? We'd love to hear from you.
              </p>
            </div>
          </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-white dark:bg-black rounded-xl shadow-lg dark:shadow-2xl p-8 flex flex-col h-full border dark:border-white/20 transition-all duration-300">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white transition-all duration-300">
                  Contact Information
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <MapPin className="w-6 h-6 text-indigo-500 mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-800 dark:text-white transition-all duration-300">
                        Our Office
                      </h4>
                      <p className="text-gray-600 dark:text-white leading-relaxed transition-all duration-300">
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
                      <h4 className="font-semibold mb-2 text-gray-800 dark:text-white transition-all duration-300">
                        Phone Support
                      </h4>
                      <p className="text-gray-600 dark:text-white transition-all duration-300">+91 95102-99313</p>
                      <p className="text-sm text-gray-500 dark:text-gray-300 mt-1 transition-all duration-300">
                        Available 24/7 for urgent matters
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="w-6 h-6 text-pink-500 mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-800 dark:text-white transition-all duration-300">
                        Email Support
                      </h4>
                      <p className="text-gray-600 dark:text-white transition-all duration-300">support@consultbridge.com</p>
                      <p className="text-sm text-gray-500 dark:text-gray-300 mt-1 transition-all duration-300">
                        We respond within 24 hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="w-6 h-6 text-indigo-600 mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-800 dark:text-white transition-all duration-300">
                        Business Hours
                      </h4>
                      <p className="text-gray-600 dark:text-white transition-all duration-300">
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
                  <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-white/20 w-full transition-all duration-300">
                    <div className="text-base text-gray-600 dark:text-white font-light leading-relaxed space-y-2 transition-all duration-300">
                      <p className="text-blue-600 dark:text-blue-400">
                        "Where expertise meets opportunity,
                      </p>
                      <p className="text-gray-700 dark:text-white">
                        Every connection sparks innovation,
                      </p>
                      <p className="text-purple-600 dark:text-purple-400">
                        Building bridges to your success,
                      </p>
                      <p className="text-gray-800 dark:text-white font-medium">
                        ConsultBridge - Your growth partner."
                      </p>
                    </div>
                    <div className="mt-6 w-20 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mx-auto rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white dark:bg-black rounded-xl shadow-lg dark:shadow-2xl p-8 border dark:border-white/20 transition-all duration-300">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white transition-all duration-300">Send Us a Message</h3>
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
                    <label className="text-gray-700 dark:text-white text-sm font-semibold mb-3 block transition-all duration-300">
                      I am contacting as a:
                    </label>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      <button
                        type="button"
                        onClick={() => setUserType("user")}
                        className={`flex items-center px-3 md:px-4 py-2 rounded-lg border-2 transition-all text-xs md:text-sm ${
                          userType === "user"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : "border-gray-300 dark:border-white/20 bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:border-gray-400 dark:hover:border-white/30"
                        }`}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Individual User
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType("consultancy")}
                        className={`flex items-center px-3 md:px-4 py-2 rounded-lg border-2 transition-all text-xs md:text-sm ${
                          userType === "consultancy"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : "border-gray-300 dark:border-white/20 bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:border-gray-400 dark:hover:border-white/30"
                        }`}
                      >
                        <Building className="w-4 h-4 mr-2" />
                        Consultancy
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType("enterprise")}
                        className={`flex items-center px-3 md:px-4 py-2 rounded-lg border-2 transition-all text-xs md:text-sm ${
                          userType === "enterprise"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : "border-gray-300 dark:border-white/20 bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:border-gray-400 dark:hover:border-white/30"
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
                      <label className="text-gray-700 dark:text-white text-sm font-semibold mb-2 block transition-all duration-300">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 dark:border-white/20 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 dark:text-white text-sm font-semibold mb-2 block transition-all duration-300">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        className="w-full p-3 border border-gray-300 dark:border-white/20 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-700 dark:text-white text-sm font-semibold mb-2 block transition-all duration-300">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="w-full p-3 border border-gray-300 dark:border-white/20 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 dark:text-white text-sm font-semibold mb-2 block transition-all duration-300">
                        Company/Organization
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 dark:border-white/20 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter company name (optional)"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Inquiry Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-700 dark:text-white text-sm font-semibold mb-2 block transition-all duration-300">
                        Inquiry Type *
                      </label>
                      <select
                        className="w-full p-3 border border-gray-300 dark:border-white/20 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                      <label className="text-gray-700 dark:text-white text-sm font-semibold mb-2 block transition-all duration-300">
                        Priority Level
                      </label>
                      <select
                        className="w-full p-3 border border-gray-300 dark:border-white/20 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    <label className="text-gray-700 dark:text-white text-sm font-semibold mb-2 block transition-all duration-300">
                      Subject *
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 dark:border-white/20 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Brief subject of your inquiry"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-gray-700 dark:text-white text-sm font-semibold mb-2 block transition-all duration-300">
                      Message *
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 dark:border-white/20 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      rows={5}
                      placeholder="Please provide detailed information about your inquiry..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    ></textarea>
                    <div className="text-right text-sm text-gray-500 dark:text-gray-300 mt-1 transition-all duration-300">
                      {message.length}/1000 characters
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-700 dark:text-white text-sm font-semibold mb-2 block transition-all duration-300">
                      Preferred Contact Method
                    </label>
                    <div className="flex flex-wrap gap-3 md:gap-4">
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
                          <span className="text-sm text-gray-700 dark:text-white transition-all duration-300">
                            {method}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
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
                      className="w-full sm:w-auto px-6 md:px-8 py-3 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white dark:bg-gray-800 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-center"
                    >
                      Reset Form
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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

        <Footer />
      </div>
      </PageTransition>
    </SmartPageWrapper>
  );
}

export default ContactPage; // ✅ Fix: Added default export
