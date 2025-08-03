"use client";
import React, { useState } from "react";
import Navbar from "../Navbar";

const ConsultancyStatusPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/consultancies/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      setStatus(result);
    } catch (error) {
      setStatus({ success: false, error: "Failed to check status" });
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
                <div className="text-4xl mb-4">📊</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Check Status
                </h1>
                <p className="text-gray-600">
                  Enter your email to check verification status
                </p>
              </div>

              <form onSubmit={checkStatus}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {loading ? "Checking..." : "Check Status"}
                </button>
              </form>

              {status && (
                <div className="mt-6">
                  {status.success ? (
                    <div className={`p-4 rounded-lg ${
                      status.data.status === 'verified' 
                        ? 'bg-green-50 border border-green-200'
                        : status.data.status === 'rejected'
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <div className="text-center">
                        <div className="text-3xl mb-2">
                          {status.data.status === 'verified' ? '✅' : 
                           status.data.status === 'rejected' ? '❌' : '⏳'}
                        </div>
                        <h3 className="font-semibold mb-2">
                          Status: {status.data.status.toUpperCase()}
                        </h3>
                        {status.data.status === 'pending' && (
                          <p className="text-sm text-yellow-700">
                            Your consultancy is under review. Usually takes 2-3 working days.
                          </p>
                        )}
                        {status.data.status === 'verified' && (
                          <p className="text-sm text-green-700">
                            Congratulations! Your consultancy is verified and live.
                          </p>
                        )}
                        {status.data.status === 'rejected' && (
                          <div className="text-sm text-red-700">
                            <p>Your consultancy was not approved.</p>
                            {status.data.rejectionReason && (
                              <p className="mt-1">Reason: {status.data.rejectionReason}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
                      <p className="text-red-700">{status.error}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-2">
                  Need help? Contact us!
                </p>
                <button
                  onClick={() => window.location.href = "/contact"}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  📧 Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultancyStatusPage;