"use client";
import { useState, useEffect } from "react";
import {
  Search,
  Star,
  MessageCircle,
  Calendar,
  ArrowRight,
} from "lucide-react";
import ConsultancyCard from "../components/ConsultancyCard";
import TestimonialCard from "../components/TestimonialCard";
import FeedbackForm from "../components/FeedbackForm";
import FeaturedConsultancies from "../components/FeaturedConsultancies";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";


import { Navigation, EffectCoverflow } from "swiper/modules";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Navbar from "../components/Navbar";
import PageTransition from "../components/PageTransition";
import LoadingScreen from "../components/LoadingScreen";
import Footer from "../components/Footer";
import { createSlug } from "../utils/urlUtils";



function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  useEffect(() => {
    const style = document.createElement('style');
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
    setIsClient(true);
    
    if (isLoaded && user?.publicMetadata?.role === "consultancy") {
      router.replace("/consultancy-dashboard");
    }
  }, [isLoaded, user, router]);



  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const result = await response.json();
        
        if (result.success && result.data) {
          const formattedCategories = result.data.map((cat: any) => ({
            title: cat.name,
            description: cat.description,
            icon: cat.emoji
          }));
          setCategories(formattedCategories);
          const middleIndex = Math.floor(formattedCategories.length / 2);
          setActiveIndex(middleIndex);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);
  

  if (!isClient || !isLoaded || categoriesLoading) {
    return <LoadingScreen message="Initializing ConsultBridge..." />;
  }
  
  const isConsultancy = user?.publicMetadata?.role === "consultancy";


  if (isConsultancy) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-20">
            <div className="container mx-auto px-6 text-center">
              <h1 className="text-5xl font-bold mb-6">Welcome to Your Consultancy Hub</h1>
              <p className="text-xl mb-8 text-indigo-100 max-w-2xl mx-auto">
                Manage your consultancy services, appointments, and grow your business with ConsultBridge.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => router.push('/consultancy-dashboard')}
                  className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-medium hover:bg-indigo-50 inline-flex items-center justify-center shadow-sm transition-all"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2" />
                </button>
                <button 
                  onClick={() => router.push('/consultancy-setup')}
                  className="bg-indigo-600 text-white border border-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 inline-flex items-center justify-center shadow-sm transition-all"
                >
                  Manage Profile
                  <ArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          </div>
          

          <section className="container mx-auto px-6 py-16">
            <h3 className="text-3xl font-bold mb-12 text-center">Manage Your Consultancy</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <Calendar className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Appointment Management</h4>
                <p className="text-gray-600">Track and manage all your client appointments</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <Star className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Profile & Reviews</h4>
                <p className="text-gray-600">Manage your profile and client feedback</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <MessageCircle className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Client Communication</h4>
                <p className="text-gray-600">Stay connected with your clients</p>
              </div>
            </div>
          </section>


          <footer className="bg-gray-900 text-white py-12">
            <div className="container mx-auto px-6 text-center">
              <h4 className="text-xl font-bold mb-4">ConsultBridge</h4>
              <p className="text-gray-400 mb-6">Empowering consultancies to grow their business</p>
              <div className="flex justify-center gap-8">
                <Link href="/about" className="hover:text-white">About Us</Link>
                <Link href="/contact" className="hover:text-white">Contact</Link>
              </div>
              <div className="border-t border-gray-800 mt-8 pt-8">
                <p>&copy; 2025 ConsultBridge. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden page-transition">

      <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
        <Navbar />

        <div className="container mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-bold mb-6">
              Find the Perfect Consultancy Services
            </h2>
            <p className="text-xl mb-8 text-indigo-100">
              Connect with top-rated consultancy agencies based on expertise,
              ratings, and quality of service.
            </p>
            <div className="flex justify-start">
              <Link 
                href="/consultancies"
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg hover:bg-indigo-50 font-semibold transition-all shadow-lg flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Browse All Consultancies
              </Link>
            </div>
          </div>
        </div>
      </header>


      <section className="py-20 bg-white overflow-visible">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4 text-gray-900">
              Our Service Categories
            </h3>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
              Comprehensive consultancy solutions across diverse industries, delivered by certified experts with proven track records
            </p>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-8">
            <div className="h-[550px] flex items-center justify-center py-24 overflow-hidden">
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
                  nextEl: '.swiper-button-next-custom',
                  prevEl: '.swiper-button-prev-custom',
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
              {categories.length > 0 && categories.map((category, index) => {
                const isActive = index === activeIndex;
                
                return (
                  <SwiperSlide
                    key={index}
                    className="transition-all duration-1000 ease-in-out flex justify-center items-center"
                  >
                    <div
                      onClick={isActive ? () => {
                        const categorySlug = createSlug(category.title);
                        window.location.href = `/category/${categorySlug}`;
                      } : undefined}
                      className={`w-[520px] h-[300px] p-8 bg-white rounded-3xl flex flex-col items-center text-center transition-all duration-700 ease-out transform group ${
                        isActive 
                          ? 'shadow-2xl scale-105 opacity-100 blur-0 cursor-pointer hover:scale-110 hover:shadow-3xl hover:-translate-y-4 hover:rotate-1 z-20' 
                          : 'shadow-lg scale-90 opacity-60 blur-[1px] cursor-default z-10'
                      }`}
                      style={{
                        border: 'none',
                        outline: 'none',
                        boxShadow: isActive ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <div className="relative overflow-hidden rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-400/30 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"></div>
                        <span className={`relative z-10 transition-all duration-700 ease-out group-hover:scale-110 ${
                          isActive ? 'text-8xl' : 'text-6xl opacity-70'
                        }`}>
                          {category.icon}
                        </span>
                      </div>
                      <h4 className={`font-bold transition-all duration-700 ease-out group-hover:text-blue-600 group-hover:scale-105 ${
                        isActive ? 'text-3xl text-gray-800' : 'text-2xl text-gray-500'
                      }`}>
                        {category.title}
                      </h4>
                      <p className={`text-gray-600 mt-3 transition-all duration-700 ease-out group-hover:text-gray-800 ${
                        isActive ? 'text-lg opacity-100' : 'text-base opacity-60'
                      }`}>
                        {category.description}
                      </p>
                      
                      {isActive && (
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-300 rounded-3xl transition-all duration-500"></div>
                      )}
                    </div>
                  </SwiperSlide>
                );
              })}
              </Swiper>
            </div>
            

            <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-30 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-110">
              <ArrowRight className="w-6 h-6 rotate-180" />
            </button>
            <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-30 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-110">
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
          

          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-2">
              {categories.length > 0 && categories.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex 
                      ? 'w-8 bg-slate-900' 
                      : 'w-2 bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <FeaturedConsultancies />


      <section className="container mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold mb-12 text-center">
          Why Choose ConsultBridge?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <Star className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
            <h4 className="text-xl font-semibold mb-2">Verified Reviews</h4>
            <p className="text-gray-600">
              Authentic feedback from real clients
            </p>
          </div>
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h4 className="text-xl font-semibold mb-2">AI-Powered Chatbot</h4>
            <p className="text-gray-600">Get personalized recommendations</p>
          </div>
          <div className="text-center">
            <Calendar className="w-12 h-12 text-pink-500 mx-auto mb-4" />
            <h4 className="text-xl font-semibold mb-2">Easy Booking</h4>
            <p className="text-gray-600">Schedule consultations effortlessly</p>
          </div>
        </div>
      </section>


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


      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <FeedbackForm />
        </div>
      </section>


      <section className="container mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl p-12 text-center shadow-xl">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Find Your Perfect Consultant?
          </h3>
          <p className="text-xl mb-8">
            Join thousands of satisfied clients who found the right expertise
          </p>
          <SignedOut>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  localStorage.setItem('signup_mode', 'user');
                  router.push('/sign-up?mode=user');
                }}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-medium hover:bg-indigo-50 inline-flex items-center shadow-sm transition-all"
              >
                Join as User
                <ArrowRight className="ml-2" />
              </button>
              <button 
                onClick={() => {

                  router.push('/consultancy-setup');
                }}
                className="bg-indigo-600 text-white border border-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 inline-flex items-center shadow-sm transition-all"
              >
                Start Service as Consultancy
                <ArrowRight className="ml-2" />
              </button>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex justify-center">
              <div className="flex justify-center">
                <Link 
                  href="/categories"
                  className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-medium hover:bg-indigo-50 inline-flex items-center shadow-sm transition-all"
                >
                  Browse Categories
                  <ArrowRight className="ml-2" />
                </Link>
              </div>
            </div>
          </SignedIn>
        </div>
      </section>


      <Footer />
      </div>
    </PageTransition>
  );
}

export default Home;
