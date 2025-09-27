"use client";
import React, { useState, useEffect } from "react";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../Navbar";
import LoadingScreen from "../LoadingScreen";
import ConsultancyCard from "../ConsultancyCard";
import PageTransition from "../PageTransition";
import SmartPageWrapper from "../SmartPageWrapper";
import Footer from "../Footer";

interface ConsultancyProfile {
  id: string;
  _id?: string;
  name: string;
  category: string;
  description: string;
  location: string;
  price: string;
  image: string;
  rating: number;
  reviews: number;
}

const ConsultancyBrowsePage: React.FC = () => {
  const [consultancies, setConsultancies] = useState<ConsultancyProfile[]>([]);
  const [filteredConsultancies, setFilteredConsultancies] = useState<ConsultancyProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 9;

  const categories = [
    "Business Strategy",
    "Legal Advisory", 
    "Financial Services",
    "Technology",
    "Career Consultation",
    "Health & Wellness",
    "Real Estate",
    "Marketing",
    "Education",
    "Other"
  ];

  useEffect(() => {
    const loadConsultancies = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/consultancies?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        const result = await response.json();
        
        if (result.success && result.data) {
          // Filter out invalid consultancies on client side too
          const validConsultancies = result.data.filter((c: ConsultancyProfile) => 
            c && c.id && c.name && typeof c.name === 'string' && c.name.trim() !== ''
          );
          setConsultancies(validConsultancies);
          setFilteredConsultancies(validConsultancies);
        } else {
          setConsultancies([]);
          setFilteredConsultancies([]);
        }
      } catch (error) {
        console.error('Error loading consultancies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConsultancies();
  }, []);

  useEffect(() => {
    let filtered = consultancies;

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    setFilteredConsultancies(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, consultancies]);

  const totalPages = Math.ceil(filteredConsultancies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentConsultancies = filteredConsultancies.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <SmartPageWrapper loadingMessage="🔍 Loading consultancies...">
      <PageTransition>
        <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-12 md:py-16 section-stagger">
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">Browse Consultancies</h1>
            <p className="text-base md:text-xl text-indigo-100">
              Discover top-rated consultancy services from verified professionals
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 section-stagger">
          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search consultancies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm md:text-base"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-4 md:mb-6">
            <p className="text-sm md:text-base text-gray-600">
              Showing {filteredConsultancies.length} consultanc{filteredConsultancies.length === 1 ? 'y' : 'ies'}
              {selectedCategory && ` in ${selectedCategory}`}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="text-xl text-gray-600">Loading consultancies...</div>
            </div>
          ) : filteredConsultancies.length > 0 ? (
            <>
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentPage}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 stagger-container"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {currentConsultancies.map((consultancy, index) => (
                    <motion.div
                      key={consultancy.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <ConsultancyCard
                        id={consultancy.id}
                        _id={consultancy._id}
                        name={consultancy.name}
                        rating={consultancy.rating}
                        reviews={consultancy.reviews}
                        image={consultancy.image}
                        category={consultancy.category}
                        description={consultancy.description}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
              
              {totalPages > 1 && (
                <motion.div 
                  className="mt-8 md:mt-16"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="bg-gradient-to-r from-white to-indigo-50 rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 border border-indigo-100">
                    <div className="flex flex-col items-center gap-4 md:gap-6">
                      <motion.div 
                        className="text-xs md:text-sm text-gray-600 font-medium text-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        Showing <span className="font-bold text-indigo-600">{startIndex + 1}</span> to{' '}
                        <span className="font-bold text-indigo-600">
                          {Math.min(startIndex + itemsPerPage, filteredConsultancies.length)}
                        </span>{' '}
                        of <span className="font-bold text-indigo-600">{filteredConsultancies.length}</span> consultancies
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-center justify-center gap-2 flex-wrap"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <motion.button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="flex items-center px-3 md:px-5 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-700 bg-white border-2 border-indigo-200 rounded-lg md:rounded-xl hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                          <span className="hidden sm:inline">Previous</span>
                          <span className="sm:hidden">Prev</span>
                        </motion.button>
                        
                        <div className="flex items-center gap-1">
                          {(() => {
                            const getPageNumbers = () => {
                              const delta = 2;
                              const range = [];
                              const rangeWithDots = [];
                              
                              for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
                                range.push(i);
                              }
                              
                              if (currentPage - delta > 2) {
                                rangeWithDots.push(1, '...');
                              } else {
                                rangeWithDots.push(1);
                              }
                              
                              rangeWithDots.push(...range);
                              
                              if (currentPage + delta < totalPages - 1) {
                                rangeWithDots.push('...', totalPages);
                              } else if (totalPages > 1) {
                                rangeWithDots.push(totalPages);
                              }
                              
                              return rangeWithDots;
                            };
                            
                            return getPageNumbers().map((page, index) => {
                              if (page === '...') {
                                return (
                                  <span key={`dots-${index}`} className="px-2 py-2 text-gray-400 text-xs md:text-sm">
                                    ...
                                  </span>
                                );
                              }
                              
                              return (
                                <motion.button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-bold rounded-lg md:rounded-xl transition-all shadow-lg min-w-[32px] md:min-w-[40px] ${
                                    currentPage === page
                                      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl border-2 border-transparent'
                                      : 'text-gray-700 bg-white border-2 border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700'
                                  }`}
                                  whileHover={{ 
                                    scale: currentPage === page ? 1.1 : 1.05, 
                                    y: -3
                                  }}
                                  whileTap={{ scale: 0.95 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                  {page}
                                </motion.button>
                              );
                            });
                          })()
                          }
                        </div>
                        
                        <motion.button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="flex items-center px-3 md:px-5 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-700 bg-white border-2 border-indigo-200 rounded-lg md:rounded-xl hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <span className="hidden sm:inline">Next</span>
                          <span className="sm:hidden">Next</span>
                          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                        </motion.button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No consultancies found</h3>
              <p className="text-gray-500">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
      </PageTransition>
    </SmartPageWrapper>
  );
};

export default ConsultancyBrowsePage;