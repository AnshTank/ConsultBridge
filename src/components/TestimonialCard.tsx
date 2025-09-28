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
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md dark:shadow-neon-sm p-4 md:p-6 dark:border dark:border-dark-border">
      <Quote className="w-6 h-6 md:w-8 md:h-8 text-blue-600 dark:text-neon-blue mb-3 md:mb-4" />
      <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-6 text-sm md:text-base leading-relaxed">{content}</p>
      <div className="flex items-center">
        <img src={image} alt={name} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0" />
        <div className="ml-3 md:ml-4 min-w-0">
          <h4 className="font-semibold text-sm md:text-base truncate text-gray-900 dark:text-white">{name}</h4>
          <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm truncate">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;