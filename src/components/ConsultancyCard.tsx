"use client";
import React from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { createSlug } from "../utils/urlUtils";
import { useState, useEffect } from "react";

interface ConsultancyCardProps {
  id?: string;
  _id?: string;
  name: string;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  description: string;
}

const ConsultancyCard: React.FC<ConsultancyCardProps> = ({
  id,
  _id,
  name,
  rating,
  reviews,
  image,
  category,
  description,
}) => {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [realRating, setRealRating] = useState(rating || 5.0);
  const [realReviewCount, setRealReviewCount] = useState(reviews || 0);

  useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        const consultancyId = _id || id;
        if (consultancyId) {
          const response = await fetch(`/api/reviews/stats/${consultancyId}`);
          const result = await response.json();
          if (result.success) {
            setRealRating(result.data.averageRating || 5.0);
            setRealReviewCount(result.data.totalReviews || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching review stats:', error);
      }
    };
    
    fetchReviewStats();
  }, [id, _id]);

  const handleViewProfile = () => {
    // Use MongoDB _id if available, otherwise use id
    const consultancyId = _id || id;
    
    // Add smooth transition before navigation
    const targetUrl = consultancyId 
      ? `/consultancy/${consultancyId}` 
      : `/consultancy/${createSlug(category)}`;
    
    // Smooth navigation with router
    router.push(targetUrl);
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md dark:shadow-lg overflow-hidden hover:shadow-lg dark:hover:shadow-xl transition-shadow h-full flex flex-col dark:border dark:border-dark-border">
      <img src={image} alt={name} className="w-full h-40 md:h-48 object-cover" />
      <div className="p-4 md:p-6 flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs md:text-sm font-medium text-blue-600 dark:text-blue-400 truncate">{category}</span>
          <div className="flex items-center flex-shrink-0">
            <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-current" />
            <span className="ml-1 text-xs md:text-sm font-medium text-gray-900 dark:text-white">{realRating}</span>
            <span className="ml-1 text-xs md:text-sm text-gray-500 dark:text-gray-400">({realReviewCount})</span>
          </div>
        </div>
        <h3 className="text-lg md:text-xl font-semibold mb-2 line-clamp-2 text-gray-900 dark:text-white">{name}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 overflow-hidden flex-grow text-sm md:text-base">
          {description ? description : "No description available..."}
        </p>
        <button
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-500 dark:to-purple-500 text-white py-2 md:py-3 rounded-lg hover:from-indigo-600 hover:to-purple-600 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all mt-auto transform hover:scale-105 hover:shadow-lg text-sm md:text-base font-medium"
          onClick={handleViewProfile}
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default ConsultancyCard;
