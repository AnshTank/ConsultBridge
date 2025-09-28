"use client";
import { useState, useEffect } from "react";
import {
  Search,
  Star,
  MessageCircle,
  Calendar,
  ArrowRight,
} from "lucide-react";
import ConsultancyCard from "../ConsultancyCard";
import TestimonialCard from "../TestimonialCard";
import FeedbackForm from "../FeedbackForm";
import FeaturedConsultancies from "../FeaturedConsultancies";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

import { Navigation, EffectCoverflow } from "swiper/modules";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Navbar from "../Navbar";
// import PageTransition from "../PageTransition";
import LoadingScreen from "../LoadingScreen";
import Footer from "../Footer";
import SmartPageWrapper from "../SmartPageWrapper";
import { createSlug } from "./../../utils/urlUtils";

function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Ensure component is mounted on client immediately
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .swiper-slide {
        width: auto !important;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: visible;
      }
      .swiper {
        overflow: visible;
        padding: 2rem 0;
      }
      .swiper-wrapper {
        overflow: visible;
      }
      
      /* Jessica Page Transition */
      .jessica-transition {
        animation: jessicaFadeIn 1.2s ease-out;
      }
      
      @keyframes jessicaFadeIn {
        0% {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        50% {
          opacity: 0.7;
          transform: translateY(15px) scale(0.98);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      .jessica-section {
        animation: jessicaSectionSlide 0.8s ease-out;
        animation-fill-mode: both;
      }
      
      @keyframes jessicaSectionSlide {
        0% {
          opacity: 0;
          transform: translateX(-50px);
        }
        100% {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role === "consultancy") {
      router.replace("/consultancy-dashboard");
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Set loading to false immediately to show page
        setCategoriesLoading(false);
        
        const response = await fetch("/api/categories");
        const result = await response.json();

        if (result.success && result.data) {
          const formattedCategories = result.data.map((cat: any) => ({
            title: cat.name,
            description: cat.description,
            icon: cat.emoji,
          }));
          setCategories(formattedCategories);
          const middleIndex = Math.floor(formattedCategories.length / 2);
          setActiveIndex(middleIndex);
        } else {
          // Use fallback data when database is unavailable
          const { fallbackCategories } = await import('../../data/fallback');
          const formattedCategories = fallbackCategories.map((cat: any) => ({
            title: cat.name,
            description: cat.description,
            icon: cat.emoji,
          }));
          setCategories(formattedCategories);
          const middleIndex = Math.floor(formattedCategories.length / 2);
          setActiveIndex(middleIndex);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Use fallback data on error
        const { fallbackCategories } = await import('../../data/fallback');
        const formattedCategories = fallbackCategories.map((cat: any) => ({
          title: cat.name,
          description: cat.description,
          icon: cat.emoji,
        }));
        setCategories(formattedCategories);
        const middleIndex = Math.floor(formattedCategories.length / 2);
        setActiveIndex(middleIndex);
      }
    };

    fetchCategories();
  }, []);

  // Don't render until everything is ready - SmartPageWrapper handles loading
  if (!mounted || !isLoaded || categoriesLoading) {
    return null;
  }

  const isConsultancy = user?.publicMetadata?.role === "consultancy";

  if (isConsultancy) {
    return (
      <SmartPageWrapper loadingMessage="💼 Loading Dashboard...">
        <div className="min-h-screen bg-gray-50">
          <Navbar />
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-500 dark:via-purple-500 dark:to-pink-500 text-white py-20">
              <div className="container mx-auto px-6 text-center">
                <h1 className="text-5xl font-bold mb-6">
                  Welcome to Your Consultancy Hub
                </h1>
                <p className="text-xl mb-8 text-indigo-100 max-w-2xl mx-auto">
                  Manage your consultancy services, appointments, and grow your
                  business with ConsultBridge.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push("/consultancy-dashboard")}
                    className="bg-white dark:bg-neon-green text-indigo-600 dark:text-dark-bg px-8 py-3 rounded-lg font-medium hover:bg-indigo-50 dark:hover:bg-neon-yellow inline-flex items-center justify-center shadow-sm dark:shadow-neon-sm transition-all"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2" />
                  </button>
                  <button
                    onClick={() => router.push("/consultancy-setup")}
                    className="bg-indigo-600 dark:bg-neon-orange text-white border border-white dark:border-neon-orange px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-neon-red inline-flex items-center justify-center shadow-sm dark:shadow-neon-sm transition-all"
                  >
                    Manage Profile
                    <ArrowRight className="ml-2" />
                  </button>
                </div>
              </div>
            </div>

            <section className="container mx-auto px-6 py-16">
              <h3 className="text-3xl font-bold mb-12 text-center">
                Manage Your Consultancy
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6 bg-white dark:bg-dark-card rounded-xl shadow-lg dark:shadow-neon-sm dark:border dark:border-dark-border">
                  <Calendar className="w-12 h-12 text-indigo-500 dark:text-neon-blue mx-auto mb-4" />
                  <h4 className="text-xl font-semibold mb-2 dark:text-white">
                    Appointment Management
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Track and manage all your client appointments
                  </p>
                </div>
                <div className="text-center p-6 bg-white dark:bg-dark-card rounded-xl shadow-lg dark:shadow-neon-purple dark:border dark:border-dark-border">
                  <Star className="w-12 h-12 text-purple-500 dark:text-neon-purple mx-auto mb-4" />
                  <h4 className="text-xl font-semibold mb-2 dark:text-white">
                    Profile & Reviews
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Manage your profile and client feedback
                  </p>
                </div>
                <div className="text-center p-6 bg-white dark:bg-dark-card rounded-xl shadow-lg dark:shadow-neon-pink dark:border dark:border-dark-border">
                  <MessageCircle className="w-12 h-12 text-pink-500 dark:text-neon-pink mx-auto mb-4" />
                  <h4 className="text-xl font-semibold mb-2 dark:text-white">
                    Client Communication
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Stay connected with your clients
                  </p>
                </div>
              </div>
            </section>

            <footer className="bg-gray-900 text-white py-12">
              <div className="container mx-auto px-6 text-center">
                <h4 className="text-xl font-bold mb-4">ConsultBridge</h4>
                <p className="text-gray-400 mb-6">
                  Empowering consultancies to grow their business
                </p>
                <div className="flex justify-center gap-8">
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8">
                  <p>&copy; 2025 ConsultBridge. All rights reserved.</p>
                </div>
              </div>
            </footer>
        </div>
      </SmartPageWrapper>
    );
  }

  return (
    <SmartPageWrapper isHomePage={true} loadingMessage="🏠 Welcome to ConsultBridge...">
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col page-transition transition-all duration-300">
        <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:bg-gradient-to-br dark:from-slate-900 dark:via-gray-900 dark:to-black text-white relative overflow-hidden">
          <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-blue-900/30 dark:via-purple-900/40 dark:to-pink-900/30"></div>
          <div className="relative z-10">
          <Navbar />

            <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
              <div className="max-w-2xl text-center md:text-left">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
                  Find the Perfect Consultancy Services
                </h2>
                <p className="text-lg md:text-xl mb-6 md:mb-8 text-indigo-100">
                  Connect with top-rated consultancy agencies based on
                  expertise, ratings, and quality of service.
                </p>
                <div className="flex justify-center md:justify-start">
                  <Link
                    href="/consultancies"
                    className="bg-white dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500 text-indigo-600 dark:text-white px-6 md:px-8 py-3 rounded-lg hover:bg-indigo-50 dark:hover:from-cyan-600 dark:hover:to-blue-600 font-semibold transition-all shadow-lg dark:shadow-xl flex items-center gap-2 text-sm md:text-base"
                  >
                    <Search className="w-4 h-4 md:w-5 md:h-5" />
                    Browse All Consultancies
                  </Link>
                </div>
              </div>
            </div>
          </div>
          </header>

          <section className="py-12 md:py-20 bg-white dark:bg-dark-bg overflow-hidden transition-all duration-300">
            <div className="container mx-auto px-4 md:px-6 overflow-hidden">
              <div className="text-center mb-8 md:mb-16">
                <h3 className="text-2xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white transition-all duration-300">
                  Our Service Categories
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg max-w-3xl mx-auto leading-relaxed px-4 transition-all duration-300">
                  Comprehensive consultancy solutions across diverse industries,
                  delivered by certified experts with proven track records
                </p>
              </div>

              <div className="relative max-w-7xl mx-auto px-2 md:px-8 overflow-hidden">
                <div className="h-[400px] md:h-[550px] flex items-center justify-center py-12 md:py-24 overflow-hidden">
                  <Swiper
                    effect="coverflow"
                    grabCursor={true}
                    centeredSlides={true}
                    slidesPerView="auto"
                    spaceBetween={-90}
                    loop={true}
                    speed={800}
                    coverflowEffect={{
                      rotate: 0,
                      stretch: 0,
                      depth: 250,
                      modifier: 1.5,
                      slideShadows: false,
                    }}
                    navigation={{
                      nextEl: ".swiper-button-next-custom",
                      prevEl: ".swiper-button-prev-custom",
                    }}
                    modules={[EffectCoverflow, Navigation]}
                    className="w-full max-w-6xl"
                    onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                    onSwiper={(swiper) => {
                      setTimeout(() => {
                        const middleIndex = Math.floor(categories.length / 2);
                        swiper.slideToLoop(middleIndex, 0);
                        setActiveIndex(middleIndex);
                      }, 100);
                    }}
                  >
                    {categories.length > 0 &&
                      categories.map((category, index) => {
                        const isActive = index === activeIndex;

                        return (
                          <SwiperSlide
                            key={index}
                            className="transition-all duration-1000 ease-in-out flex justify-center items-center"
                          >
                            <div
                              onClick={
                                isActive
                                  ? () => {
                                      const categorySlug = createSlug(
                                        category.title
                                      );
                                      window.location.href = `/category/${categorySlug}`;
                                    }
                                  : undefined
                              }
                              className={`w-[280px] md:w-[520px] h-[200px] md:h-[300px] p-4 md:p-8 bg-white dark:bg-black rounded-2xl md:rounded-3xl flex flex-col items-center text-center transition-all duration-500 ease-out transform ${
                                isActive
                                  ? "shadow-xl dark:shadow-2xl scale-110 opacity-100 blur-0 cursor-pointer hover:scale-[1.15] hover:shadow-2xl hover:-translate-y-4 hover:rotate-1 z-30 group border border-blue-200 dark:border-white/30"
                                  : "shadow-md dark:shadow-lg scale-90 opacity-60 blur-sm cursor-default z-10 pointer-events-none border border-gray-200 dark:border-gray-700/50"
                              }`}

                            >
                              <div className="relative overflow-hidden rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-400/30 dark:from-blue-500/40 dark:to-pink-500/40 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"></div>
                                <span
                                  className={`relative z-10 transition-all duration-700 ease-out group-hover:scale-110 ${
                                    isActive
                                      ? "text-4xl md:text-8xl"
                                      : "text-3xl md:text-6xl opacity-70"
                                  }`}
                                >
                                  {category.icon}
                                </span>
                              </div>
                              <h4
                                className={`font-bold ${
                                  isActive
                                    ? "text-lg md:text-3xl text-gray-800 dark:text-white"
                                    : "text-base md:text-2xl text-gray-500 dark:text-white"
                                }`}
                              >
                                {category.title}
                              </h4>
                              <p
                                className={`mt-2 md:mt-3 text-xs md:text-base leading-tight md:leading-relaxed ${
                                  isActive
                                    ? "md:text-lg text-gray-600 dark:text-white"
                                    : "text-gray-600 dark:text-white opacity-60"
                                }`}
                              >
                                {category.description}
                              </p>

                              {isActive && (
                                <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400 dark:group-hover:border-purple-400 rounded-3xl transition-all duration-500 dark:shadow-[inset_0_0_20px_rgba(168,85,247,0.3)]"></div>
                              )}
                            </div>
                          </SwiperSlide>
                        );
                      })}
                  </Swiper>
                </div>

                <button className="swiper-button-prev-custom absolute left-1 md:left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-neon-blue dark:to-neon-purple text-white rounded-full shadow-2xl dark:shadow-neon-md flex items-center justify-center hover:from-blue-700 hover:to-purple-700 dark:hover:from-neon-cyan dark:hover:to-neon-pink transition-all duration-300 hover:scale-110">
                  <ArrowRight className="w-4 h-4 md:w-6 md:h-6 rotate-180" />
                </button>
                <button className="swiper-button-next-custom absolute right-1 md:right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-neon-blue dark:to-neon-purple text-white rounded-full shadow-2xl dark:shadow-neon-md flex items-center justify-center hover:from-blue-700 hover:to-purple-700 dark:hover:from-neon-cyan dark:hover:to-neon-pink transition-all duration-300 hover:scale-110">
                  <ArrowRight className="w-4 h-4 md:w-6 md:h-6" />
                </button>
              </div>

              <div className="flex justify-center mt-12">
                <div className="flex items-center space-x-2">
                  {categories.length > 0 &&
                    categories.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === activeIndex
                            ? "w-8 bg-slate-900 dark:bg-neon-blue dark:shadow-neon-sm"
                            : "w-2 bg-slate-300 dark:bg-gray-600"
                        }`}
                      />
                    ))}
                </div>
              </div>
            </div>
          </section>

          <FeaturedConsultancies />

          <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
            <h3 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center text-gray-900 dark:text-white transition-all duration-300">
              Why Choose ConsultBridge?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center p-4">
                <Star className="w-10 h-10 md:w-12 md:h-12 text-indigo-500 dark:text-neon-blue mx-auto mb-4" />
                <h4 className="text-lg md:text-xl font-semibold mb-2 text-gray-900 dark:text-white transition-all duration-300">Verified Reviews</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base transition-all duration-300">
                  Authentic feedback from real clients
                </p>
              </div>
              <div className="text-center p-4">
                <MessageCircle className="w-10 h-10 md:w-12 md:h-12 text-purple-500 dark:text-neon-purple mx-auto mb-4" />
                <h4 className="text-lg md:text-xl font-semibold mb-2 text-gray-900 dark:text-white transition-all duration-300">
                  AI-Powered Chatbot
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base transition-all duration-300">
                  Get personalized recommendations
                </p>
              </div>
              <div className="text-center p-4">
                <Calendar className="w-10 h-10 md:w-12 md:h-12 text-pink-500 dark:text-neon-pink mx-auto mb-4" />
                <h4 className="text-lg md:text-xl font-semibold mb-2 text-gray-900 dark:text-white transition-all duration-300">Easy Booking</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base transition-all duration-300">
                  Schedule consultations effortlessly
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-100 dark:bg-dark-bg py-12 md:py-16 transition-all duration-300">
            <div className="container mx-auto px-4 md:px-6">
              <h3 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center text-gray-900 dark:text-white transition-all duration-300">
                What Our Users Say
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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

          <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
            <div className="max-w-4xl mx-auto">
              <FeedbackForm />
            </div>
          </section>

          <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:bg-dark-card dark:border dark:border-dark-border text-white rounded-2xl p-6 md:p-12 text-center shadow-xl">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Find Your Perfect Consultant?
              </h3>
              <p className="text-lg md:text-xl mb-6 md:mb-8">
                Join thousands of satisfied clients who found the right
                expertise
              </p>
              <SignedOut>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      localStorage.setItem("signup_mode", "user");
                      router.push("/sign-up?mode=user");
                    }}
                    className="bg-white dark:bg-gradient-to-r dark:from-green-500 dark:to-blue-500 text-indigo-600 dark:text-white px-6 md:px-8 py-3 rounded-lg font-medium hover:bg-indigo-50 dark:hover:from-green-600 dark:hover:to-blue-600 inline-flex items-center justify-center shadow-sm dark:shadow-lg transition-all text-sm md:text-base"
                  >
                    Join as User
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      router.push("/consultancy-setup");
                    }}
                    className="bg-indigo-600 dark:bg-gradient-to-r dark:from-purple-500 dark:to-pink-500 text-white border border-white dark:border-transparent px-6 md:px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 dark:hover:from-purple-600 dark:hover:to-pink-600 inline-flex items-center justify-center shadow-sm dark:shadow-lg transition-all text-sm md:text-base"
                  >
                    <span className="hidden sm:inline">Start Service as Consultancy</span>
                    <span className="sm:hidden">Join as Consultancy</span>
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="flex justify-center">
                  <div className="flex justify-center">
                    <Link
                      href="/categories"
                      className="bg-white dark:bg-gradient-to-r dark:from-blue-500 dark:to-purple-500 text-indigo-600 dark:text-white px-6 md:px-8 py-3 rounded-lg font-medium hover:bg-indigo-50 dark:hover:from-blue-600 dark:hover:to-purple-600 inline-flex items-center shadow-sm dark:shadow-lg transition-all text-sm md:text-base"
                    >
                      Browse Categories
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </SignedIn>
            </div>
          </section>

        <Footer />
      </div>
    </SmartPageWrapper>
  );
}

export default Home;
