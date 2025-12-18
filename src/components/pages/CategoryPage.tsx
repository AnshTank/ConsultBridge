"use client";
import { useParams } from "next/navigation";
import Navbar from "../Navbar";
import LoadingScreen from "../LoadingScreen";
import ConsultancySkeleton from "../ConsultancySkeleton";
import Footer from "../Footer";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { createSlug } from "../../utils/urlUtils";
import PerformanceMonitor from "../PerformanceMonitor";
import PageTransition from "../PageTransition";
import SmartPageWrapper from "../SmartPageWrapper";

function CategoryPage() {
  const params = useParams();
  const category = params?.category as string;
  const [consultancies, setConsultancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const startTimeRef = useRef<number>(Date.now());
  const [endTime, setEndTime] = useState<number>();

  useEffect(() => {
    const fetchConsultancies = async () => {
      try {
        setLoading(true);
        
        // Add 2-second delay for smooth user experience
        const [response] = await Promise.all([
          fetch(`/api/category/${category}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache'
            }
          }),
          new Promise(resolve => setTimeout(resolve, 2000))
        ]);
        
        const result = await response.json();

        if (result.success && result.data) {
          setConsultancies(result.data);
          setCategoryName(result.category);
        } else {
          setConsultancies([]);
          setCategoryName(category
            .replace(/-/g, " ")
            .replace(/%26/g, "&")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "));
        }
      } catch (error) {
        console.error("Error fetching consultancies:", error);
        setConsultancies([]);
        setCategoryName(category
          .replace(/-/g, " ")
          .replace(/%26/g, "&")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "));
      } finally {
        setLoading(false);
        setEndTime(Date.now());
      }
    };

    if (category) {
      fetchConsultancies();
    }
  }, [category]);

  const handleViewProfile = (consultancy: any) => {
    // Use the MongoDB _id if available, otherwise use category
    const consultancyId =
      consultancy._id || consultancy.id || createSlug(consultancy.category);
    window.location.href = `/consultancy/${consultancyId}`;
  };

  return (
    <SmartPageWrapper loadingMessage="🎯 Loading category...">
      <PageTransition>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col transition-all duration-300">
      <PerformanceMonitor 
        pageName={`Category: ${categoryName}`}
        startTime={startTimeRef.current}
        endTime={endTime}
      />
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white section-stagger">
        <Navbar />
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16 flex-grow section-stagger">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white transition-all duration-300">
          {categoryName} Consultancies
        </h2>

        {loading ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-4 transition-all duration-300">🎯 Finding the best consultancies for you...</p>
            </div>
            <ConsultancySkeleton />
          </div>
        ) : consultancies.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
          >
            {consultancies.map((consultancy: any, index: number) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-black rounded-xl shadow-lg dark:shadow-2xl overflow-hidden hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all h-full flex flex-col transform hover:scale-105 border dark:border-white/20"
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
                    <span className="text-sm font-medium text-indigo-600">
                      {consultancy.category}
                    </span>
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 text-sm font-medium">
                        {consultancy.reviewStats?.averageRating || 5.0}
                      </span>
                      <span className="ml-1 text-sm text-gray-500">
                        ({consultancy.reviewStats?.totalReviews || 0})
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white transition-all duration-300">
                    {consultancy.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow line-clamp-2 overflow-hidden transition-all duration-300">
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
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 transition-all duration-300">
                No consultancies found
              </h3>
              <p className="text-gray-500 dark:text-gray-300 text-lg mb-6 transition-all duration-300">
                We couldn't find any consultancies in the {categoryName} category at the moment.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => (window.location.href = "/categories")}
                  className="w-full px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Browse All Categories
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

        <Footer />
      </div>
      </PageTransition>
    </SmartPageWrapper>
  );
}

export default CategoryPage;
