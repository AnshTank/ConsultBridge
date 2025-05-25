import { useState } from "react";
import { FaStar, FaThumbsUp, FaReply } from "react-icons/fa";

const ReviewSection = () => {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      user: "John Doe",
      rating: 4,
      text: "Great service, very professional and helpful!",
      likes: 12,
      replies: [
        { user: "ConsultBridge", text: "Thank you for your feedback!" },
      ],
    },
    {
      id: 2,
      user: "Jane Smith",
      rating: 5,
      text: "Absolutely amazing experience! Highly recommended.",
      likes: 20,
      replies: [],
    },
  ]);

  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);

  const handleReviewSubmit = () => {
    if (!newReview.trim()) return;
    const newEntry = {
      id: reviews.length + 1,
      user: "Anonymous",
      rating: newRating,
      text: newReview,
      likes: 0,
      replies: [],
    };
    setReviews([newEntry, ...reviews]);
    setNewReview("");
    setNewRating(5);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-10 mt-6 w-full max-w-[1248px] mx-auto border border-gray-200">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800 text-center">
        User Reviews
      </h2>

      {/* Review Input */}
      <div className="border p-6 rounded-lg bg-gray-50">
        <div className="flex items-center mb-3 space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`text-3xl cursor-pointer transition-all ${
                star <= newRating ? "text-yellow-500" : "text-gray-300"
              }`}
              onClick={() => setNewRating(star)}
            />
          ))}
        </div>
        <textarea
          className="w-full border rounded-md p-4 focus:ring focus:ring-blue-300 text-lg"
          rows={4}
          placeholder="Write your review..."
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
        ></textarea>
        <button
          className="mt-4 w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-all text-lg"
          onClick={handleReviewSubmit}
        >
          Submit Review
        </button>
      </div>

      {/* Reviews List */}
      <div className="mt-8 space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border p-6 rounded-lg shadow-md bg-white"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xl text-gray-800">
                {review.user}
              </span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`text-xl ${
                      star <= review.rating
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-700 mt-3 text-lg">{review.text}</p>
            <div className="flex items-center mt-3 space-x-8 text-gray-500 text-lg">
              <button className="flex items-center hover:text-blue-600 transition-all">
                <FaThumbsUp className="mr-2" /> {review.likes} Likes
              </button>
              <button className="flex items-center hover:text-blue-600 transition-all">
                <FaReply className="mr-2" /> Reply
              </button>
            </div>
            {review.replies.length > 0 && (
              <div className="mt-4 pl-8 border-l-2 border-gray-200">
                {review.replies.map((reply, index) => (
                  <p key={index} className="text-gray-600 text-md">
                    <span className="font-semibold">{reply.user}: </span>
                    {reply.text}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;
