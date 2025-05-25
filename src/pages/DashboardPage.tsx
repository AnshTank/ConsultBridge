import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Video,
  Users,
  XCircle,
  Trash2,
  X,
  CheckCircle,
} from "lucide-react";
import Navbar from "../components/Navbar";

// Appointment type
interface Appointment {
  id: string;
  consultancyName: string;
  category: string;
  date: string;
  time: string;
  location: string;
  mode: "Online" | "Offline";
  status: "Confirmed" | "Pending" | "Cancelled";
}

// Dummy data
const dummyAppointments: Appointment[] = [
  {
    id: "1",
    consultancyName: "Career Boosters",
    category: "Career Consultancy",
    date: "March 10, 2025",
    time: "2:00 PM",
    location: "New York, USA",
    mode: "Online",
    status: "Confirmed",
  },
  {
    id: "2",
    consultancyName: "Wealth Advisors",
    category: "Financial Consultancy",
    date: "March 15, 2025",
    time: "4:30 PM",
    location: "San Francisco, USA",
    mode: "Offline",
    status: "Pending",
  },
  {
    id: "3",
    consultancyName: "Legal Experts",
    category: "Legal Consultancy",
    date: "March 18, 2025",
    time: "11:00 AM",
    location: "London, UK",
    mode: "Online",
    status: "Cancelled",
  },
];

const DashboardPage: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [appointments, setAppointments] =
    useState<Appointment[]>(dummyAppointments);
  const [modal, setModal] = useState<{
    id: string | null;
    action: "cancel" | "remove" | null;
  }>({ id: null, action: null });

  if (!user) {
    navigate("/");
    return <p className="text-center text-gray-600">Redirecting...</p>;
  }

  // Handle appointment cancellation
  const cancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === id ? { ...appt, status: "Cancelled" } : appt
      )
    );
    setModal({ id: null, action: null });
  };

  // Handle appointment removal
  const removeAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((appt) => appt.id !== id));
    setModal({ id: null, action: null });
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        {/* Dashboard Header */}
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-3xl shadow-xl flex items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col">
            <h2 className="text-4xl font-bold">Welcome, {user.fullName}!</h2>
            <p className="text-lg text-white/80">
              Manage your appointments easily.
            </p>
          </div>
        </motion.div>

        {/* Appointments Section */}
        <div className="mt-10">
          <h3 className="text-3xl font-semibold text-gray-800 mb-6">
            Your Appointments
          </h3>

          <AnimatePresence>
            {appointments.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {appointments.map((appointment) => (
                  <motion.div
                    key={appointment.id}
                    className={`relative bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200 hover:scale-105 transition-all ${
                      appointment.status === "Cancelled" ? "opacity-60" : ""
                    }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{
                      opacity: 0,
                      scale: 0.8,
                      transition: { duration: 0.3 },
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <h4 className="text-xl font-semibold text-gray-900">
                      {appointment.consultancyName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {appointment.category}
                    </p>

                    {/* Date and Time */}
                    <div className="flex items-center gap-2 text-gray-600 mt-2">
                      <CalendarDays className="w-5 h-5 text-blue-500" />
                      <p className="text-lg">{appointment.date}</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <Clock className="w-5 h-5 text-purple-500" />
                      <p className="text-lg">{appointment.time}</p>
                    </div>

                    {/* Mode (Online/Offline) */}
                    <div className="mt-2 flex items-center gap-2">
                      {appointment.mode === "Online" ? (
                        <Video className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Users className="w-5 h-5 text-orange-600" />
                      )}
                      <p
                        className={`text-lg font-semibold ${
                          appointment.mode === "Online"
                            ? "text-blue-600"
                            : "text-orange-600"
                        }`}
                      >
                        {appointment.mode}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="mt-3 flex items-center gap-2">
                      {appointment.status === "Confirmed" ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : appointment.status === "Pending" ? (
                        <Clock className="w-6 h-6 text-yellow-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                      <p
                        className={`text-lg font-semibold ${
                          appointment.status === "Confirmed"
                            ? "text-green-600"
                            : appointment.status === "Pending"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {appointment.status}
                      </p>
                    </div>

                    {/* Buttons */}
                    <div className="mt-4 flex gap-3">
                      {appointment.status !== "Cancelled" && (
                        <button
                          onClick={() =>
                            setModal({ id: appointment.id, action: "cancel" })
                          }
                          className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 flex items-center gap-1"
                        >
                          <X className="w-4 h-4" /> Cancel
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setModal({ id: appointment.id, action: "remove" })
                        }
                        className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center text-lg">
                No appointments yet.
              </p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {modal.id && (
        <motion.div
          className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg">
              Are you sure you want to {modal.action} this appointment?
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() =>
                  modal.action === "cancel"
                    ? cancelAppointment(modal.id!)
                    : removeAppointment(modal.id!)
                }
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Yes
              </button>
              <button
                onClick={() => setModal({ id: null, action: null })}
                className="bg-gray-300 px-4 py-2 rounded-lg"
              >
                No
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default DashboardPage;
