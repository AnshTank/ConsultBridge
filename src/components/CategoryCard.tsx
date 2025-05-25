import React from "react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img src={image} alt={name} className="w-full h-48 object-cover" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-600">{category}</span>
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm font-medium">{rating}</span>
            <span className="ml-1 text-sm text-gray-500">({reviews})</span>
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <button
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() =>
            navigate(`/consultancy/${name.toLowerCase().replace(/\s+/g, "-")}`)
          }
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default ConsultancyCard;
