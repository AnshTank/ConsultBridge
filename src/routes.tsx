import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import ConsultancyProfilePage from "./pages/ConsultancyProfilePage";
import CategoriesPage from "./pages/CategoriesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import DashboardPage from "./pages/DashboardPage";
import BookingPage from "./pages/BookingPage"; // Import the booking page

const AppRoutes: React.FC = () => {
  const location = useLocation(); // Get current route

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageWrapper>
              <Home />
            </PageWrapper>
          }
        />
        <Route
          path="/category/:category"
          element={
            <PageWrapper>
              <CategoryPage />
            </PageWrapper>
          }
        />
        <Route
          path="/consultancy/:id"
          element={
            <PageWrapper>
              <ConsultancyProfilePage />
            </PageWrapper>
          }
        />
        <Route
          path="/categories"
          element={
            <PageWrapper>
              <CategoriesPage />
            </PageWrapper>
          }
        />
        <Route
          path="/about"
          element={
            <PageWrapper>
              <AboutPage />
            </PageWrapper>
          }
        />
        <Route
          path="/contact"
          element={
            <PageWrapper>
              <ContactPage />
            </PageWrapper>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PageWrapper>
              <DashboardPage />
            </PageWrapper>
          }
        />

        <Route
          path="/book-appointment"
          element={
            <PageWrapper>
              <BookingPage />
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

// 🔥 Fast & Creative Swipe + Fade Transition
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }} // Start slightly off-screen to the right
      animate={{ opacity: 1, x: 0 }} // Smoothly slide in
      exit={{ opacity: 0, x: -30 }} // Slide out to the left
      transition={{
        duration: 0.4, // Faster transition (0.4s)
        ease: "easeOut", // Smooth ending movement
      }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
};

export default AppRoutes;
