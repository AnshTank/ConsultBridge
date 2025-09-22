"use client";
import { useEffect, useState } from "react";
import ConsultancyProfile from "../ConsultancyProfile";
import ConsultancyReviews from "../ConsultancyReviews";
import LoadingScreen from "../LoadingScreen";
import Navbar from "../Navbar";
import Footer from "../Footer";
import SmartPageWrapper from "../SmartPageWrapper";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function ConsultancyProfilePage({ id }: { id: string }) {
  const [consultancy, setConsultancy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultancy = async () => {
      try {
        // First try to get consultancy by MongoDB _id
        const response = await fetch(`/api/consultancies/${id}`);
        const result = await response.json();

        if (result.success && result.data) {
          console.log("Found consultancy by ID");
          setConsultancy(result.data);
        } else {
          console.log("Consultancy not found");
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
    return null;
  }

  if (!consultancy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600 mb-4">
            Consultancy not found
          </div>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Check if consultancy is pending verification
  if (consultancy.status === 'pending' || !consultancy.status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-yellow-200">
          <div className="mb-6">
            <div className="text-6xl mb-4">🕐</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Hold Your Horses! 🐎
            </h2>
            <p className="text-gray-600 mb-4">
              This consultancy is currently under our super-secret verification process!
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl mr-2">🔍</span>
              <span className="font-semibold text-yellow-800">Verification in Progress</span>
            </div>
            <p className="text-sm text-yellow-700">
              Our team of expert detectives 🕵️‍♂️ are making sure this consultancy is absolutely amazing before we let them loose on the world!
            </p>
          </div>
          
          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <div className="flex items-center justify-center">
              <span className="mr-2">⏰</span>
              <span>Usually takes 24-48 hours</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="mr-2">📧</span>
              <span>We'll notify them once approved</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="mr-2">🎉</span>
              <span>Worth the wait, we promise!</span>
            </div>
          </div>
          
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🏠 Back to Home
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            Pro tip: Bookmark this page and check back later! 📖
          </p>
        </div>
      </div>
    );
  }

  // Check if consultancy is rejected
  if (consultancy.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-red-200">
          <div className="mb-6">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Oops! Not Available
            </h2>
            <p className="text-gray-600 mb-4">
              This consultancy is currently not available on our platform.
            </p>
          </div>
          
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🏠 Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <SmartPageWrapper loadingMessage="💼 Loading consultancy profile...">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <Navbar />
        </header>

        <ConsultancyProfile
          {...consultancy}
          id={consultancy._id || consultancy.id}
        />

        <ConsultancyReviews consultancyId={consultancy._id || consultancy.id} />
        
        <div className="py-16"></div>

        <Footer />
      </div>
    </SmartPageWrapper>
  );
}

export default ConsultancyProfilePage;
