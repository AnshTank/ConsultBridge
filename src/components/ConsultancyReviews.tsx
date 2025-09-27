"use client";
import { useState, useEffect } from "react";
import { Star, ThumbsUp, Reply, ChevronLeft, ChevronRight, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, SignInButton } from "@clerk/nextjs";

interface ReviewSectionProps {
  consultancyId: string;
}

const ReviewSection = ({ consultancyId }: ReviewSectionProps) => {
  const { user, isSignedIn } = useUser();
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [userLikes, setUserLikes] = useState(new Set());
  const reviewsPerPage = 5;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews/${consultancyId}`);
        const result = await response.json();
        if (result.success) {
          setReviews(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [consultancyId]);

  const handleReviewSubmit = async () => {
    if (!newReview.trim() || !isSignedIn) return;
    
    const newReviewData = {
      id: Date.now().toString(),
      text: newReview,
      rating: newRating,
      user: user?.firstName || user?.username || 'User',
      userId: user?.id,
      likes: 0,
      replies: [],
      createdAt: new Date().toISOString()
    };
    
    try {
      setSubmitting(true);
      
      // Add review immediately for real-time update
      setReviews([newReviewData, ...reviews]);
      setNewReview("");
      setNewRating(5);
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultancyId,
          rating: newRating,
          text: newReview,
          user: user?.firstName || user?.username || 'User',
          userId: user?.id
        })
      });
      
      const result = await response.json();
      if (!result.success) {
        // Remove the optimistic update if API fails
        setReviews(reviews);
        setNewReview(newReview);
        setNewRating(newRating);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      // Revert optimistic update on error
      setReviews(reviews);
      setNewReview(newReview);
      setNewRating(newRating);
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, startIndex + reviewsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim() || !isSignedIn) return;
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          action: 'reply',
          userId: user?.id,
          user: user?.firstName || user?.username || 'User',
          text: replyText
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setReviews(reviews.map(review => 
          (review.id === reviewId || review._id === reviewId)
            ? result.data
            : review
        ));
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
    
    setReplyText("");
    setReplyingTo(null);
  };

  const handleLike = async (reviewId: string) => {
    if (!isSignedIn) return;
    
    const hasLiked = userLikes.has(reviewId);
    const action = hasLiked ? 'unlike' : 'like';
    
    // Optimistic update
    const newUserLikes = new Set(userLikes);
    if (hasLiked) {
      newUserLikes.delete(reviewId);
    } else {
      newUserLikes.add(reviewId);
    }
    setUserLikes(newUserLikes);
    
    setReviews(reviews.map(review => 
      (review.id === reviewId || review._id === reviewId)
        ? { ...review, likes: (review.likes || 0) + (hasLiked ? -1 : 1) }
        : review
    ));
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          action,
          userId: user?.id
        })
      });
      
      const result = await response.json();
      if (!result.success) {
        // Revert on error
        setUserLikes(userLikes);
        setReviews(reviews);
      }
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert on error
      setUserLikes(userLikes);
      setReviews(reviews);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-10 mt-6 w-full max-w-[1248px] mx-auto border border-gray-200">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-xl p-4 md:p-10 mt-6 w-full max-w-[1248px] mx-auto border border-gray-200">
      <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6 text-gray-800 text-center">
        User Reviews
      </h2>

      {/* Review Input */}
      <div className="border-2 border-dashed border-gray-200 p-4 md:p-8 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
        {isSignedIn ? (
          <>
            <div className="flex items-center mb-4 md:mb-6">
              <User className="w-4 h-4 md:w-5 md:h-5 text-indigo-600 mr-2 md:mr-3" />
              <span className="text-base md:text-lg font-semibold text-gray-800">
                Writing as {user?.firstName || user?.username || 'User'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-2">
              <span className="text-gray-700 font-medium text-sm md:text-base">Your Rating:</span>
              <div className="flex items-center space-x-1 md:space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 md:w-6 md:h-6 cursor-pointer transition-all hover:scale-110 ${
                      star <= newRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300 hover:text-yellow-400"
                    }`}
                    onClick={() => setNewRating(star)}
                  />
                ))}
                <span className="ml-2 md:ml-3 text-xs md:text-sm text-gray-600">({newRating} star{newRating !== 1 ? 's' : ''})</span>
              </div>
            </div>
            <textarea
              className="w-full border-2 border-gray-200 rounded-lg p-3 md:p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-lg resize-none"
              rows={4}
              placeholder="Share your experience with this consultancy..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              disabled={submitting}
            ></textarea>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-3">
              <span className="text-xs md:text-sm text-gray-500">
                {newReview.length}/500 characters
              </span>
              <button
                className={`px-4 md:px-8 py-2 md:py-3 rounded-lg font-semibold text-sm md:text-lg transition-all ${
                  newReview.trim() && !submitting
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={handleReviewSubmit}
                disabled={!newReview.trim() || submitting}
              >
                {submitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-6 md:py-8">
            <User className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 md:mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2 md:mb-3">
              Sign in to leave a review
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 px-4">
              Share your experience and help others make informed decisions
            </p>
            <SignInButton mode="modal">
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 md:px-8 py-2 md:py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-sm md:text-base">
                Sign In to Review
              </button>
            </SignInButton>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {currentReviews.length > 0 ? (
              currentReviews.map((review, index) => (
                <motion.div
                  key={review.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border p-4 md:p-6 rounded-lg shadow-md bg-white hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="font-semibold text-lg md:text-xl text-gray-800">
                      {review.user || 'Anonymous'}
                    </span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 md:w-5 md:h-5 ${
                            star <= (review.rating || 5)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 mt-2 md:mt-3 text-sm md:text-lg leading-relaxed">{review.text}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center mt-3 gap-3 sm:gap-8 text-gray-500 text-sm md:text-lg">
                    <motion.button 
                      onClick={() => handleLike(review.id || review._id)}
                      whileTap={{ scale: 0.9 }}
                      className={`flex items-center min-w-[80px] transition-all ${
                        isSignedIn 
                          ? userLikes.has(review.id || review._id)
                            ? 'text-blue-600 cursor-pointer'
                            : 'hover:text-blue-600 cursor-pointer text-gray-500'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!isSignedIn}
                    >
                      <motion.div
                        animate={{ 
                          scale: userLikes.has(review.id || review._id) ? [1, 1.4, 1] : 1,
                          rotate: userLikes.has(review.id || review._id) ? [0, 15, -10, 0] : 0
                        }}
                        transition={{ 
                          duration: 0.6,
                          type: "spring",
                          stiffness: 300,
                          damping: 15
                        }}
                        key={`${review.id || review._id}-${userLikes.has(review.id || review._id)}`}
                      >
                        <ThumbsUp className={`w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 transition-all duration-300 ${
                          userLikes.has(review.id || review._id) 
                            ? 'text-blue-600 fill-blue-600 drop-shadow-sm' 
                            : 'hover:scale-110'
                        }`} />
                      </motion.div>
                      <motion.span
                        layout
                        className="font-medium"
                      >
                        {review.likes || 0} Like{(review.likes || 0) === 1 ? '' : 's'}
                      </motion.span>
                    </motion.button>
                    {isSignedIn ? (
                      <button 
                        onClick={() => setReplyingTo(replyingTo === (review.id || review._id) ? null : (review.id || review._id))}
                        className="flex items-center hover:text-blue-600 transition-all min-w-[70px]"
                      >
                        <Reply className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Reply
                      </button>
                    ) : (
                      <span className="flex items-center text-gray-400 min-w-[120px] text-xs md:text-sm">
                        <Reply className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Sign in to reply
                      </span>
                    )}
                  </div>
                  {replyingTo === (review.id || review._id) && isSignedIn && (
                    <div className="mt-4 pl-8 border-l-2 border-blue-200 bg-blue-50 p-4 rounded-lg">
                      <textarea
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Write your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className="flex justify-end space-x-2 mt-3">
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText("");
                          }}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReply(review.id || review._id)}
                          disabled={!replyText.trim()}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {review.replies && review.replies.length > 0 && (
                    <div className="mt-4 pl-8 border-l-2 border-gray-200 space-y-3">
                      {review.replies.map((reply: any, replyIndex: number) => (
                        <div key={replyIndex} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center mb-1">
                            <span className="font-semibold text-gray-800 text-sm">{reply.user}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No reviews yet. Be the first to leave a review!</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Enterprise Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 font-medium">
                  Showing <span className="text-indigo-600 font-semibold">{startIndex + 1}</span> to{' '}
                  <span className="text-indigo-600 font-semibold">
                    {Math.min(startIndex + reviewsPerPage, reviews.length)}
                  </span>{' '}
                  of <span className="text-indigo-600 font-semibold">{reviews.length}</span> reviews
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-3 h-3 mr-1" />
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    Next
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
