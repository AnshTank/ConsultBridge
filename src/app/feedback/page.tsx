import FeedbackForm from '../../components/FeedbackForm'
import Navbar from '../../components/Navbar'

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
        <Navbar />
      </header>
      
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Share Your Feedback</h2>
          <p className="text-xl text-indigo-100">Help us improve our platform with your valuable insights</p>
        </div>
      </section>

      <section className="py-16 flex-grow">
        <FeedbackForm />
      </section>

      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; 2025 ConsultBridge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}