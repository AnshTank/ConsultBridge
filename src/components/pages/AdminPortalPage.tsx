"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Mail,
  Phone,
  MapPin,
  Star,
  Users,
  Filter,
  Search,
} from "lucide-react";
import Navbar from "../Navbar";

interface Consultancy {
  _id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  price?: string;
  contact: {
    email: string;
    phone: string;
    website: string;
  };
  status: "pending" | "verified" | "rejected";
  rejectionReason?: string;
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  rating: number;
  reviews: number;
  createdAt: string;
  image?: string;
  expertise?: string[];
  availability?: {
    days: string[];
    hours: string;
  };
  whyChooseUs?: string[];
}

const AdminPortalPage: React.FC = () => {
  const router = useRouter();
  const [consultancies, setConsultancies] = useState<Consultancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "verified" | "rejected"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedConsultancyId, setSelectedConsultancyId] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedConsultancy, setSelectedConsultancy] =
    useState<Consultancy | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationNote, setVerificationNote] = useState('');
  const [selectedVerificationType, setSelectedVerificationType] = useState<'email' | 'phone'>('email');
  const [currentPage, setCurrentPage] = useState(1);
  const consultanciesPerPage = 20;

  useEffect(() => {
    // Check localStorage for authentication
    const savedAuth = localStorage.getItem('adminAuthenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConsultancies();
    }
  }, [isAuthenticated]);



  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "ansh" && password === "ansh") {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
      setAuthError("");
    } else {
      setAuthError("Invalid username or password");
    }
  };

  const fetchConsultancies = async () => {
    try {
      const response = await fetch("/api/consultancies");
      const data = await response.json();
      console.log('API Response:', data); // Debug log
      if (data.success) {
        setConsultancies(data.consultancies || data.data || []);
      } else {
        console.error('API Error:', data.error);
        setConsultancies([]);
      }
    } catch (error) {
      console.error("Error fetching consultancies:", error);
      setConsultancies([]);
    }
    setLoading(false);
  };

  const updateStatus = async (
    id: string,
    status: "verified" | "rejected",
    reason?: string
  ) => {
    try {
      const response = await fetch("/api/admin/consultancies/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultancyId: id,
          status,
          rejectionReason: reason,
        }),
      });

      if (response.ok) {
        setConsultancies((prev) =>
          prev.map((c) =>
            c._id === id ? { ...c, status, rejectionReason: reason } : c
          )
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleReject = (id: string) => {
    setSelectedConsultancyId(id);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (rejectReason.trim()) {
      updateStatus(selectedConsultancyId, "rejected", rejectReason);
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedConsultancyId("");
    }
  };

  const handleSendVerificationNote = (id: string, type: 'email' | 'phone') => {
    setSelectedConsultancyId(id);
    setSelectedVerificationType(type);
    setVerificationNote('Please verify your phone number and email address to resubmit your application.');
    setShowVerificationModal(true);
  };

  const confirmSendVerificationNote = async () => {
    if (verificationNote.trim()) {
      try {
        const consultancy = consultancies.find(c => c._id === selectedConsultancyId);
        const response = await fetch('/api/admin/send-verification-note', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            consultancyId: selectedConsultancyId, 
            verificationNote: verificationNote,
            verificationType: selectedVerificationType,
            contact: selectedVerificationType === 'email' ? consultancy?.contact?.email : consultancy?.contact?.phone
          })
        });

        if (response.ok) {
          setConsultancies(prev => 
            prev.map(c => c._id === selectedConsultancyId ? { ...c, status: 'rejected', rejectionReason: verificationNote } : c)
          );
          alert('Verification note sent! Status changed to rejected - consultancy must verify to resubmit.');
        }
      } catch (error) {
        console.error('Error sending verification note:', error);
      }
      
      setShowVerificationModal(false);
      setVerificationNote('');
      setSelectedConsultancyId('');
    }
  };

  const removeConsultancy = async (id: string) => {
    if (
      confirm("Are you sure you want to permanently remove this consultancy?")
    ) {
      try {
        const response = await fetch(`/api/consultancies/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setConsultancies((prev) => prev.filter((c) => c._id !== id));
        }
      } catch (error) {
        console.error("Error removing consultancy:", error);
      }
    }
  };

  const viewDetails = (consultancy: Consultancy) => {
    setSelectedConsultancy(consultancy);
    setShowDetailsModal(true);
  };

  const viewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const filteredConsultancies = consultancies.filter((consultancy) => {
    const matchesFilter = filter === "all" || consultancy.status === filter;
    const matchesSearch =
      searchTerm === "" ||
      consultancy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultancy.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredConsultancies.length / consultanciesPerPage);
  const startIndex = (currentPage - 1) * consultanciesPerPage;
  const paginatedConsultancies = filteredConsultancies.slice(
    startIndex,
    startIndex + consultanciesPerPage
  );

  const stats = {
    total: consultancies.length,
    pending: consultancies.filter((c) => c.status === "pending" || !c.status)
      .length,
    verified: consultancies.filter((c) => c.status === "verified").length,
    rejected: consultancies.filter((c) => c.status === "rejected").length,
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center transition-all duration-300">
        <div className="bg-white dark:bg-dark-card dark:border dark:border-dark-border rounded-xl shadow-lg dark:shadow-neon-lg p-8 w-96 transition-all duration-300">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 transition-all duration-300">
              Admin Login
            </h1>
            <p className="text-gray-600 dark:text-gray-300 transition-all duration-300">Access ConsultBridge Admin Portal</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-all duration-300">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-neon-blue bg-white dark:bg-dark-surface dark:text-white transition-all duration-300"
                placeholder="Enter username"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-all duration-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-neon-blue bg-white dark:bg-dark-surface dark:text-white transition-all duration-300"
                placeholder="Enter password"
                required
              />
            </div>
            {authError && (
              <div className="mb-4 text-red-600 text-sm text-center">
                {authError}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-indigo-600 dark:bg-neon-blue text-white py-2 px-4 rounded-lg hover:bg-indigo-700 dark:hover:bg-neon-cyan transition-all duration-300"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center transition-all duration-300">
        <div className="text-xl text-gray-600 dark:text-gray-300 transition-all duration-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-dark-bg dark:via-dark-bg dark:to-dark-bg transition-all duration-300">
      {/* Move modals outside of .container */}
      {showDetailsModal && selectedConsultancy && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-40" />
          <div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden"
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">
                    {selectedConsultancy.name}
                  </h3>
                  <p className="text-indigo-100">
                    {selectedConsultancy.category}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:text-gray-200 text-3xl font-light"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-5 border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                      📊 Basic Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-semibold text-gray-700">
                          Location:
                        </span>{" "}
                        {selectedConsultancy.location}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">
                          Price:
                        </span>{" "}
                        {selectedConsultancy.price}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">
                          Rating:
                        </span>{" "}
                        {selectedConsultancy.rating}/5 (
                        {selectedConsultancy.reviews} reviews)
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">
                          Status:
                        </span>
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            selectedConsultancy.status === "verified"
                              ? "bg-green-100 text-green-800"
                              : selectedConsultancy.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {selectedConsultancy.status?.toUpperCase() ||
                            "PENDING"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-5 border border-green-200">
                    <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                      📞 Contact Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-semibold text-gray-700">
                          Email:
                        </span>{" "}
                        {selectedConsultancy.contact?.email}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">
                          Phone:
                        </span>{" "}
                        {selectedConsultancy.contact?.phone}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">
                          Website:
                        </span>{" "}
                        {selectedConsultancy.contact?.website || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-5 border border-purple-200">
                    <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                      📅 Availability
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">
                          Days:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedConsultancy.availability?.days?.map(
                            (day, index) => (
                              <span
                                key={index}
                                className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs"
                              >
                                {day}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                      <p>
                        <span className="font-semibold text-gray-700">
                          Hours:
                        </span>{" "}
                        {selectedConsultancy.availability?.hours}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Expertise */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl p-5 border border-orange-200">
                    <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                      🎆 Expertise
                    </h4>
                    <div className="space-y-2">
                      {selectedConsultancy.expertise?.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          <span className="text-sm text-gray-700">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl p-5 border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      📝 Description
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedConsultancy.description}
                    </p>
                  </div>

                  {/* Why Choose Us */}
                  {selectedConsultancy.whyChooseUs &&
                    selectedConsultancy.whyChooseUs.length > 0 && (
                      <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-xl p-5 border border-teal-200">
                        <h4 className="font-bold text-teal-800 mb-3 flex items-center gap-2">
                          ✨ Why Choose Us
                        </h4>
                        <div className="space-y-2">
                          {Array.isArray(selectedConsultancy.whyChooseUs) ? (
                            selectedConsultancy.whyChooseUs.map(
                              (reason, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></span>
                                  <span className="text-sm text-gray-700">
                                    {reason}
                                  </span>
                                </div>
                              )
                            )
                          ) : (
                            <div className="text-sm text-gray-500">
                              No reasons provided
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={() => viewImage(selectedConsultancy.image || '')}
                    className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                  >
                    🖼️ View Image
                  </button>
                  {(selectedConsultancy.status === "pending" ||
                    !selectedConsultancy.status) && (
                    <>
                      <button
                        onClick={() => {
                          updateStatus(selectedConsultancy._id, "verified");
                          setShowDetailsModal(false);
                        }}
                        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          handleReject(selectedConsultancy._id);
                          setShowDetailsModal(false);
                        }}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {showImageModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowImageModal(false)}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-[90vw] mx-4 overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">🖼️ Consultancy Image</h3>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="text-white hover:text-gray-200 text-2xl font-light"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="p-4">
              <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={selectedImage}
                  alt="Consultancy"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=60";
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowImageModal(false)}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      {showRejectModal && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg p-6 w-96 max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Reject Consultancy</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejection:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setSelectedConsultancyId("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Verification Note Modal */}
      {showVerificationModal && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg p-6 w-96 max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-blue-600">📧 Send Verification Note</h3>
            <p className="text-gray-600 mb-4">
              Send a verification note for {selectedVerificationType} verification:
            </p>
            <textarea
              value={verificationNote}
              onChange={(e) => setVerificationNote(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please verify your phone number and email address to resubmit your application."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  setVerificationNote('');
                  setSelectedConsultancyId('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmSendVerificationNote}
                disabled={!verificationNote.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Note
              </button>
            </div>
          </div>
        </>
      )}
      
      <div className="container mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <motion.div
          className="bg-white dark:bg-dark-card dark:border dark:border-dark-border rounded-2xl shadow-xl dark:shadow-neon-lg border border-indigo-100 dark:border-dark-border p-8 mb-8 relative overflow-hidden transition-all duration-300"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full -translate-y-16 translate-x-16 opacity-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-full translate-y-12 -translate-x-12 opacity-10"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-neon-blue dark:to-neon-purple bg-clip-text text-transparent mb-3">
                🏢 ConsultBridge Admin
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg transition-all duration-300">
                Advanced Consultancy Management System
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400 transition-all duration-300">System Online</span>
              </div>
            </div>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                localStorage.removeItem('adminAuthenticated');
              }}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              🚪 Logout
            </button>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
          <motion.div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl md:rounded-2xl shadow-xl dark:shadow-neon-md p-3 md:p-6 border border-blue-200 dark:border-blue-700 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-xs md:text-sm font-medium transition-all duration-300">📊 Total</p>
                <p className="text-xl md:text-3xl font-bold text-blue-800 dark:text-blue-300 transition-all duration-300">
                  {stats.total}
                </p>
              </div>
              <div className="bg-blue-500 dark:bg-blue-600 p-3 rounded-full transition-all duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div className="bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl shadow-xl dark:shadow-neon-md p-6 border border-yellow-200 dark:border-yellow-700 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium transition-all duration-300">
                  ⏳ Pending
                </p>
                <p className="text-3xl font-bold text-yellow-800 dark:text-yellow-300 transition-all duration-300">
                  {stats.pending}
                </p>
              </div>
              <div className="bg-yellow-500 dark:bg-yellow-600 p-3 rounded-full transition-all duration-300">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-xl dark:shadow-neon-md p-6 border border-green-200 dark:border-green-700 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium transition-all duration-300">
                  ✅ Verified
                </p>
                <p className="text-3xl font-bold text-green-800 dark:text-green-300 transition-all duration-300">
                  {stats.verified}
                </p>
              </div>
              <div className="bg-green-500 dark:bg-green-600 p-3 rounded-full transition-all duration-300">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl shadow-xl dark:shadow-neon-md p-6 border border-red-200 dark:border-red-700 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 dark:text-red-400 text-sm font-medium transition-all duration-300">❌ Rejected</p>
                <p className="text-3xl font-bold text-red-800 dark:text-red-300 transition-all duration-300">
                  {stats.rejected}
                </p>
              </div>
              <div className="bg-red-500 dark:bg-red-600 p-3 rounded-full transition-all duration-300">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-dark-card dark:border dark:border-dark-border rounded-xl shadow-lg dark:shadow-neon-lg p-6 mb-8 transition-all duration-300">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 transition-all duration-300" />
              <input
                type="text"
                placeholder="Search consultancies..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-neon-blue bg-white dark:bg-dark-surface dark:text-white transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {(["all", "pending", "verified", "rejected"] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      filter === status
                        ? "bg-indigo-500 dark:bg-neon-blue text-white"
                        : "bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-bg"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Consultancies List */}
        <div className="space-y-4">
          {paginatedConsultancies.map((consultancy) => (
            <motion.div
              key={consultancy._id}
              className="bg-white dark:bg-dark-card dark:border dark:border-dark-border rounded-xl shadow-lg dark:shadow-neon-lg p-6 border border-gray-200 dark:border-dark-border transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white transition-all duration-300">
                      {consultancy.name}
                    </h3>
                    <div className="flex flex-col items-start gap-1">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          consultancy.status === "verified"
                            ? "bg-green-100 text-green-800"
                            : consultancy.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {consultancy.status?.toUpperCase() || "PENDING"}
                      </span>
                      {consultancy.status === "rejected" &&
                        consultancy.rejectionReason && (
                          <span className="text-xs text-red-600 italic">
                            Reason: {consultancy.rejectionReason}
                          </span>
                        )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 transition-all duration-300">
                        <span className="font-medium">Category:</span>
                        <span>{consultancy.category || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 transition-all duration-300">
                        <MapPin className="w-4 h-4" />
                        <span>{consultancy.location || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 transition-all duration-300">
                        <Star className="w-4 h-4" />
                        <span>
                          {consultancy.rating || 0}/5 (
                          {consultancy.reviews || 0} reviews)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 transition-all duration-300">
                        <Mail className="w-4 h-4" />
                        <span>{consultancy.contact?.email || "N/A"}</span>
                        {consultancy.verification?.emailVerified && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 transition-all duration-300">
                        <Phone className="w-4 h-4" />
                        <span>{consultancy.contact?.phone || "N/A"}</span>
                        {consultancy.verification?.phoneVerified && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 transition-all duration-300">
                        Registered:{" "}
                        {consultancy.createdAt
                          ? new Date(consultancy.createdAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 transition-all duration-300">
                    {consultancy.description || "No description available"}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-2 md:ml-4">
                  {(consultancy.status === "pending" ||
                    !consultancy.status) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          updateStatus(consultancy._id, "verified")
                        }
                        className="bg-green-500 dark:bg-green-600 border border-green-500 dark:border-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-all duration-300 flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(consultancy._id)}
                        className="bg-red-500 dark:bg-red-600 border border-red-500 dark:border-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-all duration-300 flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        localStorage.setItem('adminAuthenticated', 'true');
                        router.push(`/admin-portal/details/${consultancy._id}`);
                      }}
                      className="bg-blue-500 dark:bg-blue-600 border border-blue-500 dark:border-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-300 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={(e) => {
                        const btn = e.currentTarget;
                        if (btn.classList.contains('confirm-delete')) {
                          removeConsultancy(consultancy._id);
                        } else {
                          btn.classList.add('confirm-delete');
                          btn.innerHTML = '⚠️ Click Again';
                          btn.className = 'bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center gap-2 animate-pulse';
                          setTimeout(() => {
                            btn.classList.remove('confirm-delete');
                            btn.innerHTML = '🗑️ Remove';
                            btn.className = 'bg-gray-500 dark:bg-gray-600 border border-gray-500 dark:border-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-300 flex items-center gap-2';
                          }, 3000);
                        }
                      }}
                      className="bg-gray-500 dark:bg-gray-600 border border-gray-500 dark:border-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-300 flex items-center gap-2"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {paginatedConsultancies.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 text-lg transition-all duration-300">
                No consultancies found matching your criteria.
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              {(() => {
                const maxVisible = 5;
                const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                const end = Math.min(totalPages, start + maxVisible - 1);
                const pages = [];
                
                if (start > 1) {
                  pages.push(1);
                  if (start > 2) pages.push('...');
                }
                
                for (let i = start; i <= end; i++) {
                  pages.push(i);
                }
                
                if (end < totalPages) {
                  if (end < totalPages - 1) pages.push('...');
                  pages.push(totalPages);
                }
                
                return pages.map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500 dark:text-gray-400">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                        currentPage === page
                          ? "bg-indigo-500 dark:bg-neon-blue text-white"
                          : "bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-card"
                      }`}
                    >
                      {page}
                    </button>
                  )
                ));
              })()}
              <button
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPortalPage;
