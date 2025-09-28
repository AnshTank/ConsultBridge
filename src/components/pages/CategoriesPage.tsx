"use client";
import { useRouter } from "next/navigation";
import Navbar from "../Navbar";
import Link from "next/link";
import PageTransition from "../PageTransition";
import Footer from "../Footer";
import SmartPageWrapper from "../SmartPageWrapper";

const categories = [
  {
    title: "Career Consultation",
    description:
      "Personalized career advice to help you achieve success in your field.",
    icon: "📖",
  },
  {
    title: "Legal Advisory",
    description:
      "Expert legal guidance for contracts, compliance, and corporate law.",
    icon: "⚖️",
  },
  {
    title: "Business Strategy",
    description:
      "Innovative strategies for scaling and optimizing your business operations.",
    icon: "📈",
  },
  {
    title: "Health & Wellness",
    description:
      "Comprehensive mental & physical well-being programs for a balanced life.",
    icon: "💆",
  },
  {
    title: "Technology",
    description:
      "Expert solutions for IT consulting, software development, and cloud integration.",
    icon: "💻",
  },
  {
    title: "Real Estate & Housing",
    description:
      "Insights into property investment, home buying, and rental solutions.",
    icon: "🏡",
  },
  {
    title: "Financial Services",
    description:
      "Tailored financial planning, investment advice, and wealth management.",
    icon: "💰",
  },
  {
    title: "Lifestyle & Personal Growth",
    description:
      "Coaching and guidance for self-improvement and personal development.",
    icon: "🌟",
  },
  {
    title: "Travel & Hospitality",
    description:
      "Exclusive travel planning, hotel bookings, and vacation packages.",
    icon: "✈️",
  },
  {
    title: "Miscellaneous",
    description: "Other unique consulting services tailored to your needs.",
    icon: "🔍",
  },
];

function CategoriesPage() {
  const router = useRouter();

  return (
    <SmartPageWrapper loadingMessage="🔍 Exploring all categories...">
      <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-all duration-300">
        <Navbar />

        {/* Main Content */}
        <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 text-center text-gray-900 dark:text-white transition-all duration-300">
            Explore All Categories
          </h2>
          <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 mb-8 md:mb-12 text-center max-w-3xl mx-auto px-4 transition-all duration-300">
            Browse through our comprehensive range of consultancy categories to
            find the perfect match for your specific needs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {categories.map((category, index) => (
              <div
                key={index}
                onClick={() => {
                  const categorySlug = category.title
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/&/g, "%26");
                  window.location.href = `/category/${categorySlug}`;
                }}
                className="bg-white dark:bg-black rounded-lg md:rounded-xl shadow-lg dark:shadow-2xl p-4 md:p-8 hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300 cursor-pointer transform hover:-translate-y-2 hover:scale-105 border dark:border-white/20"
              >
                <div className="text-4xl md:text-6xl mb-3 md:mb-4 text-center">{category.icon}</div>
                <h3 className="text-lg md:text-2xl font-bold mb-2 text-center md:text-left text-gray-900 dark:text-white transition-all duration-300">{category.title}</h3>
                <p className="text-gray-600 dark:text-white mb-3 md:mb-4 text-sm md:text-base leading-relaxed transition-all duration-300">{category.description}</p>
                <button className="text-blue-600 dark:text-blue-400 font-medium flex items-center justify-center md:justify-start w-full text-sm md:text-base transition-all duration-300">
                  <span className="hidden md:inline">Explore {category.title}</span>
                  <span className="md:hidden">Explore</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 md:h-5 md:w-5 ml-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </div>
      </PageTransition>
    </SmartPageWrapper>
  );
}

export default CategoriesPage;
