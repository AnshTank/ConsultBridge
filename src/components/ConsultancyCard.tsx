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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <img src={image} alt={name} className="w-full h-48 object-cover" />
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-600">{category}</span>
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm font-medium">{realRating}</span>
            <span className="ml-1 text-sm text-gray-500">({realReviewCount})</span>
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2 overflow-hidden flex-grow">
          {description ? description : "No description available..."}
        </p>
        <button
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all mt-auto transform hover:scale-105 hover:shadow-lg"
          onClick={handleViewProfile}
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default ConsultancyCard;
