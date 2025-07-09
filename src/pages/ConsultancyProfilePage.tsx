"use client";
import { useEffect, useState } from "react";
import ConsultancyProfile from "../components/ConsultancyProfile";
import ConsultancyReviews from "../components/ConsultancyReviews";
import LoadingScreen from "../components/LoadingScreen";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function ConsultancyProfilePage({ id }: { id: string }) {
  const [consultancy, setConsultancy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultancy = async () => {
      try {
        // First try to get consultancy by MongoDB _id
        const response = await fetch(`/api/consultancies/${id}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          console.log('Found consultancy by ID');
          setConsultancy(result.data);
        } else {
          console.log('Consultancy not found');
          setConsultancy(null);
        }
      } catch (error) {
        console.error("Error fetching consultancy:", error);
        setConsultancy(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConsultancy();
  }, [id]);

  if (loading) {
    return <LoadingScreen message="Loading consultancy profile..." />;
  }

  if (!consultancy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600 mb-4">Consultancy not found</div>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <Navbar />
      </header>

      <ConsultancyProfile {...consultancy} id={consultancy._id || consultancy.id} />

      <ConsultancyReviews
        consultancyId={consultancy._id || consultancy.id}
        reviews={consultancy.reviews}
      />

      <Footer />
    </div>
  );
}

export default ConsultancyProfilePage;