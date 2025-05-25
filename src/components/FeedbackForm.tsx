import React, { useState } from "react";
import { Send, Star } from "lucide-react";

const FeedbackForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("General");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !topic || !feedback) {
      alert("Please fill in all fields");
      return;
    }

    console.log("Feedback submitted:", {
      name,
      email,
      topic,
      category,
      rating,
      feedback,
    });

    setSubmitted(true);
    setName("");
    setEmail("");
    setTopic("");
    setCategory("General");
    setRating(0);
    setFeedback("");

    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-10">
      <div className="relative bg-white/10 shadow-lg rounded-3xl p-10 border border-gray-700 transition-all duration-300 hover:border-blue-500 hover:shadow-blue-500/30 hover:-translate-y-1">
        {submitted && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 shadow-md animate-fade-in">
            <p className="font-semibold">Thank you for your feedback! 🎉</p>
            <p>Your insights help us improve our platform.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-3xl font-bold text-black text-center mb-6 tracking-wide">
            ✨ We Value Your Feedback
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-white text-sm font-semibold mb-1 block">
                Your Name
              </label>
              <input
                type="text"
                className="w-full bg-transparent text-white placeholder-gray-400 px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-white text-sm font-semibold mb-1 block">
                Your Email
              </label>
              <input
                type="email"
                className="w-full bg-transparent text-white placeholder-gray-400 px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-white text-sm font-semibold mb-1 block">
              What is your feedback about?
            </label>
            <input
              type="text"
              className="w-full bg-transparent text-white placeholder-gray-400 px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="E.g., Website performance, new feature request..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-white text-sm font-semibold mb-1 block">
                Category
              </label>
              <select
                className="w-full bg-transparent text-white placeholder-gray-400 px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option className="text-black" value="General">
                  📢 General Feedback
                </option>
                <option className="text-black" value="UI/UX">
                  🎨 UI/UX Design
                </option>
                <option className="text-black" value="Bug Report">
                  🐞 Bug Report
                </option>
                <option className="text-black" value="Feature Request">
                  🚀 Feature Request
                </option>
              </select>
            </div>

            <div>
              <label className="text-white text-sm font-semibold mb-1 block">
                Rate Us
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 cursor-pointer transition-all ${
                      rating >= star ? "text-yellow-400" : "text-gray-500"
                    }`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-white text-sm font-semibold mb-1 block">
              Your Feedback
            </label>
            <textarea
              rows={5}
              className="w-full bg-transparent text-white placeholder-gray-400 px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Please share your thoughts..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:scale-105 transition-transform flex items-center justify-center shadow-lg hover:shadow-blue-500/50 hover:from-blue-600 hover:to-purple-700 active:scale-95"
          >
            Submit Feedback
            <Send className="ml-2 w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
