"use client";
import React, { useState } from "react";
import { Send, Star, User, Building } from "lucide-react";
import { useUser } from "@clerk/nextjs";

const FeedbackForm: React.FC = () => {
  const { user } = useUser();
  const [name, setName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.emailAddresses?.[0]?.emailAddress || "");
  const [userType, setUserType] = useState<'user' | 'consultancy'>(user?.publicMetadata?.role === 'consultancy' ? 'consultancy' : 'user');
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState("Medium");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !topic || !feedback) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          userType,
          topic,
          category,
          priority,
          rating,
          feedback,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        setName(user?.fullName || "");
        setEmail(user?.emailAddresses?.[0]?.emailAddress || "");
        setTopic("");
        setCategory("General");
        setPriority("Medium");
        setRating(0);
        setFeedback("");

        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      } else {
        alert("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert("Failed to submit feedback. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      <div className="relative bg-white dark:bg-dark-card shadow-2xl dark:shadow-neon-lg rounded-2xl p-6 md:p-10 border border-gray-200 dark:border-dark-border transition-all duration-300 hover:shadow-3xl dark:hover:shadow-neon-lg">
        {submitted && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 shadow-md animate-fade-in">
            <p className="font-semibold">Thank you for your feedback! 🎉</p>
            <p>Your insights help us improve our platform.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-6 md:mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Share Your Experience
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg">
              Your feedback helps us improve our platform and services
            </p>
          </div>

          {/* User Type Selection */}
          <div className="mb-6">
            <label className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-3 block">
              I am a:
            </label>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setUserType('user')}
                className={`flex items-center justify-center px-4 md:px-6 py-3 rounded-lg border-2 transition-all text-sm md:text-base ${
                  userType === 'user'
                    ? 'border-blue-500 dark:border-neon-blue bg-blue-50 dark:bg-neon-blue/20 text-blue-700 dark:text-neon-blue'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <User className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Service User
              </button>
              <button
                type="button"
                onClick={() => setUserType('consultancy')}
                className={`flex items-center justify-center px-4 md:px-6 py-3 rounded-lg border-2 transition-all text-sm md:text-base ${
                  userType === 'consultancy'
                    ? 'border-blue-500 dark:border-neon-blue bg-blue-50 dark:bg-neon-blue/20 text-blue-700 dark:text-neon-blue'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <Building className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Consultancy Provider
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 block">
                Full Name *
              </label>
              <input
                type="text"
                className="w-full bg-white dark:bg-dark-surface text-gray-800 dark:text-white px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-neon-blue focus:border-transparent transition-all"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 block">
                Email Address *
              </label>
              <input
                type="email"
                className="w-full bg-white dark:bg-dark-surface text-gray-800 dark:text-white px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-neon-blue focus:border-transparent transition-all"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 block">
              Feedback Topic *
            </label>
            <input
              type="text"
              className="w-full bg-white dark:bg-dark-surface text-gray-800 dark:text-white px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-neon-blue focus:border-transparent transition-all"
              placeholder="Brief description of your feedback topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 block">
                Category *
              </label>
              <select
                className="w-full bg-white dark:bg-dark-surface text-gray-800 dark:text-white px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-neon-blue focus:border-transparent transition-all"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="General">General Feedback</option>
                <option value="UI/UX">UI/UX Design</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Service Quality">Service Quality</option>
                <option value="Platform Performance">Platform Performance</option>
              </select>
            </div>

            <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 block">
                Priority Level
              </label>
              <select
                className="w-full bg-white dark:bg-dark-surface text-gray-800 dark:text-white px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-neon-blue focus:border-transparent transition-all"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 block">
                Overall Rating *
              </label>
              <div className="flex gap-1 items-center justify-center sm:justify-start">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 md:w-8 md:h-8 cursor-pointer transition-all hover:scale-110 ${
                      rating >= star 
                        ? "text-yellow-400 fill-current" 
                        : "text-gray-300 hover:text-yellow-300"
                    }`}
                    onClick={() => setRating(star)}
                  />
                ))}
                <span className="ml-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  {rating > 0 && `${rating}/5`}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 block">
              Detailed Feedback *
            </label>
            <textarea
              rows={6}
              className="w-full bg-white dark:bg-dark-surface text-gray-800 dark:text-white px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-neon-blue focus:border-transparent transition-all resize-none"
              placeholder="Please provide detailed feedback about your experience..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
            ></textarea>
            <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
              {feedback.length}/500 characters
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                setName(user?.fullName || "");
                setEmail(user?.emailAddresses?.[0]?.emailAddress || "");
                setTopic("");
                setCategory("General");
                setPriority("Medium");
                setRating(0);
                setFeedback("");
              }}
              className="px-6 md:px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm md:text-base"
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm md:text-base"
            >
              Submit Feedback
              <Send className="ml-2 w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
