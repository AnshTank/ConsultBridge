"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ConsultancyCard from "./ConsultancyCard";
import LoadingScreen from "./LoadingScreen";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedConsultancies = async () => {
      try {
        const response = await fetch("/api/consultancies");
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
          // Get top 3 highest rated consultancies
          const featured = result.data
            .sort((a: ConsultancyData, b: ConsultancyData) => b.rating - a.rating)
            .slice(0, 3);
          setConsultancies(featured);
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

    fetchFeaturedConsultancies();
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold mb-12 text-center">
            Top Rated Consultancies
          </h3>
          <LoadingScreen variant="dots" message="Loading featured consultancies..." />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-6">
        <h3 className="text-3xl font-bold mb-12 text-center">
          Top Rated Consultancies
        </h3>
        {consultancies.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="text-6xl">🏆</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Top-Rated Consultancies Yet</h3>
            <p className="text-gray-500">
              We're working on bringing you the best consultancy services. Check back soon!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}