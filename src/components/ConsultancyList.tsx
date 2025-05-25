import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ConsultancyCard from "./ConsultancyCard";

const consultancies = [
  {
    name: "Global Strategy Partners",
    rating: 4.9,
    reviews: 128,
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60",
    category: "Business",
    description: "Expert business strategy and growth consulting",
  },
  {
    name: "Financial Wisdom Group",
    rating: 4.8,
    reviews: 96,
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60",
    category: "Finance",
    description: "Comprehensive financial advisory services",
  },
  {
    name: "Tech Innovation Labs",
    rating: 4.9,
    reviews: 156,
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60",
    category: "Technology",
    description: "Digital transformation and IT solutions",
  },
  {
    name: "Legal Advisors Ltd.",
    rating: 4.7,
    reviews: 85,
    image:
      "https://images.unsplash.com/photo-1596541325742-4625eb10a458?w=800&auto=format&fit=crop&q=60",
    category: "Legal",
    description: "Corporate and individual legal consulting",
  },
  {
    name: "HR Excellence Group",
    rating: 4.6,
    reviews: 74,
    image:
      "https://images.unsplash.com/photo-1573497491208-6b1acb260507?w=800&auto=format&fit=crop&q=60",
    category: "Human Resources",
    description: "Talent acquisition and HR strategy consulting",
  },
  {
    name: "Marketing Masters",
    rating: 4.8,
    reviews: 98,
    image:
      "https://images.unsplash.com/photo-1562572159-7fc0204eb80e?w=800&auto=format&fit=crop&q=60",
    category: "Marketing",
    description: "Digital marketing and branding strategies",
  },
  {
    name: "Healthcare Consulting Group",
    rating: 4.7,
    reviews: 112,
    image:
      "https://images.unsplash.com/photo-1586773860411-d37222d8fce3?w=800&auto=format&fit=crop&q=60",
    category: "Healthcare",
    description: "Medical business and policy consulting",
  },
  {
    name: "Real Estate Experts",
    rating: 4.9,
    reviews: 120,
    image:
      "https://images.unsplash.com/photo-1570126618953-9eb61a174e21?w=800&auto=format&fit=crop&q=60",
    category: "Real Estate",
    description: "Property investment and management consulting",
  },
  {
    name: "Startup Success Hub",
    rating: 4.8,
    reviews: 89,
    image:
      "https://images.unsplash.com/photo-1597262975002-c5c3b14bbd62?w=800&auto=format&fit=crop&q=60",
    category: "Startups",
    description: "Business development for startups",
  },
  {
    name: "AI Strategy Group",
    rating: 4.9,
    reviews: 150,
    image:
      "https://images.unsplash.com/photo-1581092795360-89d7d24b02db?w=800&auto=format&fit=crop&q=60",
    category: "Technology",
    description: "AI-driven business consulting",
  },
  {
    name: "Tax & Audit Solutions",
    rating: 4.6,
    reviews: 102,
    image:
      "https://images.unsplash.com/photo-1597156962893-bf38fc01a1f2?w=800&auto=format&fit=crop&q=60",
    category: "Finance",
    description: "Tax planning and financial auditing",
  },
  {
    name: "CyberSecurity Experts",
    rating: 4.7,
    reviews: 140,
    image:
      "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&auto=format&fit=crop&q=60",
    category: "Technology",
    description: "Enterprise security and risk management",
  },
  {
    name: "Educational Advisory",
    rating: 4.8,
    reviews: 77,
    image:
      "https://images.unsplash.com/photo-1543269865-4430f94492b8?w=800&auto=format&fit=crop&q=60",
    category: "Education",
    description: "Education and career counseling",
  },
  {
    name: "E-commerce Growth Experts",
    rating: 4.7,
    reviews: 132,
    image:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&auto=format&fit=crop&q=60",
    category: "Business",
    description: "E-commerce scaling and marketing strategies",
  },
  {
    name: "Freelance Network Hub",
    rating: 4.5,
    reviews: 65,
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
    category: "Freelancing",
    description: "Freelancer growth and portfolio building",
  },
  {
    name: "Green Energy Consulting",
    rating: 4.9,
    reviews: 115,
    image:
      "https://images.unsplash.com/photo-1558980664-1a0002f99846?w=800&auto=format&fit=crop&q=60",
    category: "Environment",
    description: "Sustainable energy and eco-friendly business solutions",
  },
  {
    name: "Investment Advisory Group",
    rating: 4.6,
    reviews: 108,
    image:
      "https://images.unsplash.com/photo-1519120126473-8be7aedcd6c6?w=800&auto=format&fit=crop&q=60",
    category: "Finance",
    description: "Investment strategy and wealth management",
  },
];

const ITEMS_PER_PAGE = 9;

function ConsultancyList() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(consultancies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentConsultancies = consultancies.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto px-6 py-16">
      <h2 className="text-4xl font-bold mb-8 text-center">Consultancies</h2>

      {/* Smooth Page Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage} // Ensures animation runs on page change
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {currentConsultancies.map((consultancy, index) => (
            <ConsultancyCard key={index} {...consultancy} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination Buttons */}
      <div className="flex justify-center mt-8 space-x-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Previous
        </button>

        <span className="px-4 py-2 bg-gray-200 rounded-lg">{`Page ${currentPage} of ${totalPages}`}</span>

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg ${
            currentPage === totalPages
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default ConsultancyList;
