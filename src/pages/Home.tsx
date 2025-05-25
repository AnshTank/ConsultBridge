import { useState } from "react";
import {
  Search,
  Star,
  MessageCircle,
  Calendar,
  ArrowRight,
} from "lucide-react";
import ConsultancyCard from "../components/ConsultancyCard";
// import CategoryCard from "../components/CategoryCard";
import TestimonialCard from "../components/TestimonialCard";
import FeedbackForm from "../components/FeedbackForm";
import { useNavigate, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import { Navigation, EffectCoverflow } from "swiper/modules";
import Navbar from "../components/Navbar";

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

function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <Navbar />

        <div className="container mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-bold mb-6">
              Find the Perfect Consultancy Services
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Connect with top-rated consultancy agencies based on expertise,
              ratings, and quality of service.
            </p>
            <div className="bg-white rounded-lg p-2 flex items-center gap-4 max-w-xl">
              <Search className="text-gray-400 ml-2" />
              <input
                type="text"
                placeholder="Search for consultancy services..."
                className="flex-1 border-none outline-none text-gray-800"
              />
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Search
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Categories Section */}
      <section className="container mx-auto px-6 py-16 flex flex-col items-center">
        <h3 className="text-4xl font-bold mb-12 text-center">
          Browse by Category
        </h3>
        <div className="relative flex justify-center w-full min-h-[350px]">
          <Swiper
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            spaceBetween={-90}
            loop={true}
            speed={600}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 250,
              modifier: 1.5,
              slideShadows: false,
            }}
            navigation={true}
            modules={[EffectCoverflow, Navigation]}
            className="w-[80%]"
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          >
            {categories.map((category, index) => {
              const blurClass =
                index === activeIndex
                  ? "blur-0 opacity-100 scale-110"
                  : "blur-[20%] opacity-70 scale-90";

              return (
                <SwiperSlide
                  key={index}
                  className={`transition-all duration-500 flex justify-center items-center ${blurClass}`}
                >
                  <div
                    onClick={() =>
                      navigate(
                        `/category/${category.title
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`
                      )
                    }
                    className="w-[500px] h-[280px] p-8 bg-white shadow-xl rounded-2xl flex flex-col items-center text-center cursor-pointer transition-transform hover:scale-105 hover:shadow-2xl"
                  >
                    <span className="text-8xl">{category.icon}</span>
                    <h4 className="mt-4 font-bold text-3xl">
                      {category.title}
                    </h4>
                    <p className="text-lg text-gray-600 mt-3">
                      {category.description}
                    </p>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </section>

      {/* Featured Consultancies */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold mb-12 text-center">
            Top Rated Consultancies
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ConsultancyCard
              name="Global Strategy Partners"
              rating={4.9}
              reviews={128}
              image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60"
              category="Business"
              description="Expert business strategy and growth consulting"
            />
            <ConsultancyCard
              name="Financial Wisdom Group"
              rating={4.8}
              reviews={96}
              image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60"
              category="Finance"
              description="Comprehensive financial advisory services"
            />
            <ConsultancyCard
              name="Tech Innovation Labs"
              rating={4.9}
              reviews={156}
              image="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60"
              category="Technology"
              description="Digital transformation and IT solutions"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold mb-12 text-center">
          Why Choose ConsultBridge?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <Star className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h4 className="text-xl font-semibold mb-2">Verified Reviews</h4>
            <p className="text-gray-600">
              Authentic feedback from real clients
            </p>
          </div>
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h4 className="text-xl font-semibold mb-2">AI-Powered Chatbot</h4>
            <p className="text-gray-600">Get personalized recommendations</p>
          </div>
          <div className="text-center">
            <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h4 className="text-xl font-semibold mb-2">Easy Booking</h4>
            <p className="text-gray-600">Schedule consultations effortlessly</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold mb-12 text-center">
            What Our Users Say
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              name="Sarah Johnson"
              role="CEO, TechStart"
              image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60"
              content="ConsultBridge helped us find the perfect strategic advisor for our startup. The process was seamless!"
            />
            <TestimonialCard
              name="Michael Chen"
              role="Finance Director"
              image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60"
              content="The quality of financial consultants on this platform is exceptional. Highly recommended!"
            />
            <TestimonialCard
              name="Emily Brown"
              role="Legal Manager"
              image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&auto=format&fit=crop&q=60"
              content="Found an excellent legal consultant through ConsultBridge. The verified reviews were very helpful."
            />
          </div>
        </div>
      </section>

      {/* Feedback Form Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <FeedbackForm />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="bg-blue-600 text-white rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Find Your Perfect Consultant?
          </h3>
          <p className="text-xl mb-8">
            Join thousands of satisfied clients who found the right expertise
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 inline-flex items-center">
            Get Started
            <ArrowRight className="ml-2" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
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

export default Home;
