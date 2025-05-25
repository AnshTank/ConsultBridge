import { useNavigate } from "react-router-dom";

const BookAppointment: React.FC = () => {
  const navigate = useNavigate();

  const handleAppointmentBooking = async () => {
    try {
      // Simulating an API call to book an appointment
      const response = await fetch("/api/book-appointment", {
        method: "POST",
        body: JSON.stringify({
          /* appointment details */
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        // Redirect to success page
        navigate("/appointment-success");
      } else {
        console.error("Failed to book appointment");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
    }
  };

  return (
    <button
      onClick={handleAppointmentBooking}
      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
    >
      Book Appointment
    </button>
  );
};

export default BookAppointment;
