import React from 'react';
import { Quote } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  role: string;
  image: string;
  content: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  role,
  image,
  content,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <Quote className="w-8 h-8 text-blue-600 mb-4" />
      <p className="text-gray-600 mb-6">{content}</p>
      <div className="flex items-center">
        <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover" />
        <div className="ml-4">
          <h4 className="font-semibold">{name}</h4>
          <p className="text-gray-600 text-sm">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;