import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

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
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <Navbar />
      </header>

      {/* Main Content */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold mb-4 text-center">
          Explore All Categories
        </h2>
        <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
          Browse through our comprehensive range of consultancy categories to
          find the perfect match for your specific needs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              onClick={() =>
                navigate(
                  `/category/${category.title
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`
                )
              }
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer transform hover:-translate-y-1 transition-transform"
            >
              <div className="text-6xl mb-4">{category.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{category.title}</h3>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <button className="text-blue-600 font-medium flex items-center">
                Explore {category.title}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-1"
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">ConsultBridge</h4>
              <p className="text-gray-400">
                Connecting you with the right consultancy services
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Categories</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/category/business" className="hover:text-white">
                    Business
                  </Link>
                </li>
                <li>
                  <Link to="/category/finance" className="hover:text-white">
                    Finance
                  </Link>
                </li>
                <li>
                  <Link to="/category/legal" className="hover:text-white">
                    Legal
                  </Link>
                </li>
                <li>
                  <Link to="/category/technology" className="hover:text-white">
                    Technology
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Connect</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="https://twitter.com" className="hover:text-white">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com" className="hover:text-white">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="https://facebook.com" className="hover:text-white">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="https://instagram.com" className="hover:text-white">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ConsultBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CategoriesPage;
