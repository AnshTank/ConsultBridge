"use client";
import React from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface ConsultancyCardProps {
  name: string;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  description: string;
}

const ConsultancyCard: React.FC<ConsultancyCardProps> = ({
  name,
  rating,
  reviews,
  image,
  category,
  description,
}) => {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img src={image} alt={name} className="w-full h-40 md:h-48 object-cover" />
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs md:text-sm font-medium text-blue-600 truncate">{category}</span>
          <div className="flex items-center flex-shrink-0">
            <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-current" />
            <span className="ml-1 text-xs md:text-sm font-medium">{rating}</span>
            <span className="ml-1 text-xs md:text-sm text-gray-500">({reviews})</span>
          </div>
        </div>
        <h3 className="text-lg md:text-xl font-semibold mb-2 line-clamp-2">{name}</h3>
        <p className="text-gray-600 mb-4 text-sm md:text-base line-clamp-2">{description}</p>
        <button
          className="w-full bg-blue-600 text-white py-2 md:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base font-medium"
          onClick={() =>
            router.push(`/consultancy/${name.toLowerCase().replace(/\s+/g, "-")}`)
          }
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default ConsultancyCard;
