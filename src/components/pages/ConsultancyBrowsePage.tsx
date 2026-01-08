"use client";
import React, { useState, useEffect } from "react";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../Navbar";
import ConsultancyCard from "../ConsultancyCard";
import PageTransition from "../PageTransition";
import GlobalLoader from "../GlobalLoader";
import Footer from "../Footer";
import { useDataLoading } from "../../hooks/useDataLoading";

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
  const itemsPerPage = 9;
  
  // Data loading state
  const consultanciesLoading = useDataLoading({ 
    dataType: 'consultancies',
    minLoadingTime: 500 
  });

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
          consultanciesLoading.setDataLoaded(true);
        } else {
          setConsultancies([]);
          setFilteredConsultancies([]);
          consultanciesLoading.setDataLoaded(true);
        }
      } catch (error) {
        console.error('Error loading consultancies:', error);
        consultanciesLoading.setError('Failed to load consultancies');
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
    <GlobalLoader 
      dataLoadingState={{
        isDataLoaded: consultanciesLoading.isDataLoaded,
        dataType: 'consultancies'
      }}
    >
      <PageTransition>
        <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-all duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:bg-gradient-to-br dark:from-slate-900 dark:via-gray-900 dark:to-black text-white py-12 md:py-16 section-stagger relative overflow-hidden">
          <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-blue-900/30 dark:via-purple-900/40 dark:to-pink-900/30"></div>
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 dark:text-white transition-all duration-300">Browse Consultancies</h1>
            <p className="text-base md:text-xl text-indigo-100 dark:text-gray-300 transition-all duration-300">
              Discover top-rated consultancy services from verified professionals
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 section-stagger">
          {/* Search and Filter */}
          <div className="bg-white dark:bg-dark-card dark:border dark:border-dark-border rounded-xl shadow-lg dark:shadow-neon-sm p-4 md:p-6 mb-6 md:mb-8 transition-all duration-300">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 transition-all duration-300" />
                <input
                  type="text"
                  placeholder="Search consultancies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-neon-blue text-sm md:text-base bg-white dark:bg-dark-surface dark:text-white transition-all duration-300"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 transition-all duration-300" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 md:py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-neon-blue bg-white dark:bg-dark-surface dark:text-white text-sm md:text-base transition-all duration-300"
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
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 transition-all duration-300">
              Showing {filteredConsultancies.length} consultanc{filteredConsultancies.length === 1 ? 'y' : 'ies'}
              {selectedCategory && ` in ${selectedCategory}`}
            </p>
          </div>

          {consultanciesLoading.error ? (
            <div className="text-center py-16">
              <div className="text-xl text-red-600 dark:text-red-400 transition-all duration-300">
                {consultanciesLoading.error}
              </div>
            </div>
          ) : !consultanciesLoading.isDataLoaded ? (
            <div className="text-center py-16">
              <div className="text-xl text-gray-600 dark:text-gray-300 transition-all duration-300">
                Loading consultancies...
              </div>
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
                  <div className="bg-gradient-to-r from-white to-indigo-50 dark:bg-dark-card dark:border dark:border-dark-border rounded-2xl md:rounded-3xl shadow-2xl dark:shadow-neon-md p-4 md:p-8 border border-indigo-100 dark:border-dark-border transition-all duration-300">
                    <div className="flex flex-col items-center gap-4 md:gap-6">
                      <motion.div 
                        className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium text-center transition-all duration-300"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        Showing <span className="font-bold text-indigo-600 dark:text-neon-blue">{startIndex + 1}</span> to{' '}
                        <span className="font-bold text-indigo-600 dark:text-neon-blue">
                          {Math.min(startIndex + itemsPerPage, filteredConsultancies.length)}
                        </span>{' '}
                        of <span className="font-bold text-indigo-600 dark:text-neon-blue">{filteredConsultancies.length}</span> consultancies
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
                          className="flex items-center px-3 md:px-5 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface border-2 border-indigo-200 dark:border-dark-border rounded-lg md:rounded-xl hover:bg-indigo-50 dark:hover:bg-dark-card hover:border-indigo-300 dark:hover:border-neon-blue hover:text-indigo-700 dark:hover:text-neon-blue disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg dark:shadow-neon-sm"
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
                                  <span key={`dots-${index}`} className="px-2 py-2 text-gray-400 dark:text-gray-500 text-xs md:text-sm transition-all duration-300">
                                    ...
                                  </span>
                                );
                              }
                              
                              return (
                                <motion.button
                                  key={page}
                                  onClick={() => handlePageChange(page as number)}
                                  className={`px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-bold rounded-lg md:rounded-xl transition-all shadow-lg dark:shadow-neon-sm min-w-[32px] md:min-w-[40px] ${
                                    currentPage === page
                                      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:bg-gradient-to-r dark:from-neon-blue dark:to-neon-purple text-white shadow-xl dark:shadow-neon-lg border-2 border-transparent'
                                      : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface border-2 border-gray-200 dark:border-dark-border hover:bg-indigo-50 dark:hover:bg-dark-card hover:border-indigo-300 dark:hover:border-neon-blue hover:text-indigo-700 dark:hover:text-neon-blue'
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
                          className="flex items-center px-3 md:px-5 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface border-2 border-indigo-200 dark:border-dark-border rounded-lg md:rounded-xl hover:bg-indigo-50 dark:hover:bg-dark-card hover:border-indigo-300 dark:hover:border-neon-blue hover:text-indigo-700 dark:hover:text-neon-blue disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg dark:shadow-neon-sm"
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
              <div className="text-gray-400 dark:text-gray-500 mb-4 transition-all duration-300">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2 transition-all duration-300">No consultancies found</h3>
              <p className="text-gray-500 dark:text-gray-400 transition-all duration-300">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
      </PageTransition>
    </GlobalLoader>
  );
};

export default ConsultancyBrowsePage;