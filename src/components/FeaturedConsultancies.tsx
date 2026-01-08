"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ConsultancyCard from "./ConsultancyCard";
import OptimizedLoader from "./OptimizedLoader";
import { useDataLoading } from "../hooks/useDataLoading";
interface ConsultancyData {
  _id?: string;
  id?: string;
  name: string;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  description: string;
}

export default function FeaturedConsultancies() {
  const [consultancies, setConsultancies] = useState<ConsultancyData[]>([]);
  
  // Data loading state
  const featuredLoading = useDataLoading({ 
    dataType: 'featured-consultancies',
    minLoadingTime: 400 
  });

  useEffect(() => {
    const fetchFeaturedConsultancies = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(`/api/consultancies/top-rated?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();

        if (result.success && result.data) {
          setConsultancies(result.data);
          featuredLoading.setDataLoaded(true);
        } else {
          console.warn('No consultancies data received, using fallback');
          const { fallbackConsultancies } = await import('../data/fallback');
          setConsultancies(fallbackConsultancies);
          featuredLoading.setDataLoaded(true);
        }
      } catch (error: any) {
        if (error?.name === 'AbortError') {
          console.error('Request timed out, using fallback data');
        } else {
          console.error("Error fetching top-rated consultancies, using fallback:", error);
        }
        const { fallbackConsultancies } = await import('../data/fallback');
        setConsultancies(fallbackConsultancies);
        featuredLoading.setDataLoaded(true);
      }
    };

    fetchFeaturedConsultancies();
  }, []);

  return (
    <section className="bg-white dark:bg-dark-bg py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <h3 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center text-gray-900 dark:text-white">
          Top Rated Consultancies
        </h3>
        
        <OptimizedLoader 
          isLoading={!featuredLoading.isDataLoaded}
          error={featuredLoading.error}
          minHeight="300px"
        >
          {consultancies.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
          >
            {consultancies.map((consultancy, index) => (
              <motion.div
                key={consultancy._id || consultancy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <ConsultancyCard
                  _id={consultancy._id}
                  id={consultancy.id}
                  name={consultancy.name}
                  rating={consultancy.rating}
                  reviews={consultancy.reviews}
                  image={consultancy.image}
                  category={consultancy.category}
                  description={consultancy.description}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-8 md:py-12">
            <div className="text-gray-400 mb-3 md:mb-4">
              <span className="text-4xl md:text-6xl">🏆</span>
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No Top-Rated Consultancies Yet
            </h3>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 px-4">
              We're working on bringing you the best consultancy services. Check
              back soon!
            </p>
          </div>
        )}
        </OptimizedLoader>
      </div>
    </section>
  );
}
