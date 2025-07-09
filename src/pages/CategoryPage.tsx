"use client";
import { useParams } from "next/navigation";
import Navbar from "../components/Navbar";
import LoadingScreen from "../components/LoadingScreen";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createSlug } from "../utils/urlUtils";

function CategoryPage() {
  const params = useParams();
  const category = params?.category as string;
  const [consultancies, setConsultancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewStats, setReviewStats] = useState({});

  useEffect(() => {
    const fetchConsultancies = async () => {
      try {
        // Get consultancies filtered by category from API (MongoDB)
        const response = await fetch(`/api/consultancies`);
        const result = await response.json();
        
        if (result.success && result.data) {
          // Filter consultancies by category
          let categoryName = category
            .replace(/-/g, ' ')
            .replace(/%26/g, '&')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          const filteredConsultancies = result.data.filter(consultancy => 
            consultancy.category === categoryName
          );
          
          setConsultancies(filteredConsultancies);
          // Fetch review stats for each consultancy
          const stats = {};
          for (const consultancy of result.data) {
            try {
              const statsResponse = await fetch(`/api/reviews/stats/${consultancy._id || consultancy.id}`);
              const statsResult = await statsResponse.json();
              if (statsResult.success) {
                stats[consultancy._id || consultancy.id] = statsResult.data;
              }
            } catch (error) {
              console.error('Error fetching stats for consultancy:', error);
            }
          }
          setReviewStats(stats);
        } else {
          setConsultancies([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching consultancies:', error);
        setConsultancies([]);
        setLoading(false);
      }
    };

    fetchConsultancies();
  }, [category]);

  const handleViewProfile = (consultancy) => {
    // Use the MongoDB _id if available, otherwise use category
    const consultancyId = consultancy._id || consultancy.id || createSlug(consultancy.category);
    window.location.href = `/consultancy/${consultancyId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col page-transition">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white section-stagger">
        <Navbar />
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16 flex-grow section-stagger">
        <h2 className="text-3xl font-bold mb-8 text-center">
          {category?.replace(/-/g, " ").replace(/%26/g, "&").split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Consultancies
        </h2>
        
        {loading ? (
          <LoadingScreen variant="pulse" message="Loading consultancies..." />
        ) : consultancies.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
          >
            {consultancies.map((consultancy, index) => (
              <motion.div 
                key={index} 
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all h-full flex flex-col transform hover:scale-105"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <img 
                  src={consultancy.image} 
                  alt={consultancy.name} 
                  className="w-full h-48 object-cover" 
                />
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-indigo-600">{consultancy.category}</span>
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 text-sm font-medium">
                        {reviewStats[consultancy._id || consultancy.id]?.averageRating || 5.0}
                      </span>
                      <span className="ml-1 text-sm text-gray-500">
                        ({reviewStats[consultancy._id || consultancy.id]?.totalReviews || 0})
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{consultancy.name}</h3>
                  <p className="text-gray-600 mb-4 flex-grow line-clamp-2 overflow-hidden">
                    {consultancy.description || "No description available..."}
                  </p>
                  <button 
                    onClick={() => handleViewProfile(consultancy)}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all mt-auto"
                  >
                    View Profile
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No consultancies found for this category.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default CategoryPage;