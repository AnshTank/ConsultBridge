"use client";
import { useState, useEffect } from "react";
import { BarChart3, Download, Calendar, Users } from "lucide-react";

interface AdminData {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  popularConsultancies: { _id: string; count: number }[];
}

export default function AdminDashboard() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "admin report" }),
      });
      const data = await res.json();
      setAdminData(data.adminData);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!adminData) return;
    
    const csvContent = `Metric,Value
Total Bookings,${adminData.totalBookings}
Confirmed Bookings,${adminData.confirmedBookings}
Cancelled Bookings,${adminData.cancelledBookings}
${adminData.popularConsultancies.map(c => `${c._id},${c.count}`).join('\n')}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultbridge-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 /> Admin Dashboard
          </h1>
          <button
            onClick={exportToCSV}
            disabled={!adminData}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : adminData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center gap-3">
                <Calendar className="text-blue-500" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold">{adminData.totalBookings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center gap-3">
                <Users className="text-green-500" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-green-600">{adminData.confirmedBookings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center gap-3">
                <Users className="text-red-500" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{adminData.cancelledBookings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-purple-500" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round((adminData.confirmedBookings / adminData.totalBookings) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {adminData && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Popular Consultancies</h2>
            <div className="space-y-3">
              {adminData.popularConsultancies.map((consultancy, index) => (
                <div key={consultancy._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="font-medium">{consultancy._id}</span>
                  </div>
                  <span className="text-gray-600">{consultancy.count} bookings</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}