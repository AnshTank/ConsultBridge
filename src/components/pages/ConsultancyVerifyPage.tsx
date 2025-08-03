"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";

const ConsultancyVerifyPage: React.FC = () => {
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [consultancyId, setConsultancyId] = useState("");
  const [sentCodes, setSentCodes] = useState<{emailCode: string, phoneCode: string} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tempId = localStorage.getItem("tempConsultancyId");
    if (tempId) {
      setConsultancyId(tempId);
      sendVerificationCodes(tempId);
      localStorage.removeItem("tempConsultancyId");
    }
  }, []);

  const sendVerificationCodes = async (id: string) => {
    try {
      const response = await fetch("/api/consultancies/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultancyId: id })
      });
      
      const result = await response.json();
      if (result.success) {
        setSentCodes({
          emailCode: result.emailCode,
          phoneCode: result.phoneCode
        });
      }
    } catch (error) {
      console.error("Error sending codes:", error);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/consultancies/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultancyId, emailCode, phoneCode })
      });

      const result = await response.json();
      if (result.success) {
        localStorage.setItem("consultancyId", consultancyId);
        alert("✅ Verification successful! You can now access your admin panel.");
        window.location.href = "/consultancy-admin";
      } else {
        alert(result.error || "Verification failed. Please try again.");
      }
    } catch (error) {
      alert("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">📱</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Complete Verification
                </h1>
                <p className="text-gray-600">
                  Verify your email and phone to access your admin panel
                </p>
                
                {sentCodes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <p className="text-sm font-semibold text-yellow-800 mb-2">📝 Demo Codes:</p>
                    <div className="text-sm text-yellow-700">
                      <p><strong>Email Code:</strong> {sentCodes.emailCode}</p>
                      <p><strong>Phone Code:</strong> {sentCodes.phoneCode}</p>
                    </div>
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
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {loading ? "Verifying..." : "Verify & Continue"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultancyVerifyPage;