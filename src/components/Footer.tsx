"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto section-stagger">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h4 className="text-xl font-bold mb-4">ConsultBridge</h4>
            <p className="text-gray-400">
              Connecting you with the right consultancy services
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h5 className="font-semibold mb-4">Categories</h5>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/categories" className="hover:text-white transition-colors">
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link href="/consultancies" className="hover:text-white transition-colors">
                  All Consultancies
                </Link>
              </li>
              <li>
                <Link href="/category/business-strategy" className="hover:text-white transition-colors">
                  Business Strategy
                </Link>
              </li>
              <li>
                <Link href="/category/technology" className="hover:text-white transition-colors">
                  Technology
                </Link>
              </li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <h5 className="font-semibold mb-4">Company</h5>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <h5 className="font-semibold mb-4">Connect</h5>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/coming-soon?platform=twitter" className="hover:text-white transition-colors">
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="/coming-soon?platform=linkedin" className="hover:text-white transition-colors">
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link href="/coming-soon?platform=facebook" className="hover:text-white transition-colors">
                  Facebook
                </Link>
              </li>
              <li>
                <Link href="/coming-soon?platform=instagram" className="hover:text-white transition-colors">
                  Instagram
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>
        
        <motion.div 
          className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <p>&copy; 2025 ConsultBridge. All rights reserved. | Founded by Ansh Tank</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;