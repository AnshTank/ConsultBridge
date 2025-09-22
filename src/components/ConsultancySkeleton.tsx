import { motion } from "framer-motion";

export default function ConsultancySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, index) => (
        <motion.div
          key={index}
          className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          {/* Image skeleton */}
          <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
          
          <div className="p-6 flex-grow flex flex-col">
            {/* Category and rating skeleton */}
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="flex items-center">
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              </div>
            </div>
            
            {/* Title skeleton */}
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
            
            {/* Description skeleton */}
            <div className="space-y-2 mb-4 flex-grow">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
            
            {/* Button skeleton */}
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse mt-auto"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}