import { Link } from "react-router-dom";
import { Users, Award, TrendingUp, Shield } from "lucide-react";
import Navbar from "../components/Navbar";
function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <Navbar />
      </header>

      {/* Hero Section */}
      <section className="bg-blue-700 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">About ConsultBridge</h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              We're on a mission to connect individuals and businesses with the
              perfect consultancy services, making expert advice accessible to
              everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-8 text-center">Our Story</h3>
            <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                ConsultBridge was founded in 2023 with a simple yet powerful
                vision: to bridge the gap between those seeking expert guidance
                and the consultants who provide it. Our founders, having
                experienced firsthand the challenges of finding the right
                consultancy services, set out to create a platform that would
                revolutionize the industry.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                What began as a small startup has quickly grown into a trusted
                marketplace connecting thousands of clients with top-rated
                consultants across various fields. Our commitment to quality,
                transparency, and user satisfaction has been the cornerstone of
                our success.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Today, ConsultBridge stands as a testament to our belief that
                everyone deserves access to expert advice that can transform
                their personal and professional lives. We continue to innovate
                and expand our services, always keeping our users' needs at the
                heart of everything we do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold mb-12 text-center">
            Our Core Values
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-3">Client-Centered</h4>
              <p className="text-gray-600">
                We put our users first, ensuring every feature and service is
                designed with their needs in mind.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <Award className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-3">Excellence</h4>
              <p className="text-gray-600">
                We maintain the highest standards in every aspect of our
                platform and services.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-3">Innovation</h4>
              <p className="text-gray-600">
                We continuously evolve and improve our platform to stay ahead of
                industry trends.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-3">Trust</h4>
              <p className="text-gray-600">
                We foster a transparent environment where users can make
                confident decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold mb-12 text-center">
            Meet Our Leadership Team
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=60"
                alt="CEO"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h4 className="text-xl font-bold mb-1">David Mitchell</h4>
                <p className="text-blue-600 mb-4">CEO & Co-Founder</p>
                <p className="text-gray-600">
                  With over 15 years of experience in the consultancy industry,
                  David brings vision and strategic leadership to ConsultBridge.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60"
                alt="COO"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h4 className="text-xl font-bold mb-1">Sarah Johnson</h4>
                <p className="text-blue-600 mb-4">COO & Co-Founder</p>
                <p className="text-gray-600">
                  Sarah's background in operations and technology has been
                  instrumental in building our efficient and user-friendly
                  platform.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=60"
                alt="CTO"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h4 className="text-xl font-bold mb-1">Michael Chen</h4>
                <p className="text-blue-600 mb-4">CTO</p>
                <p className="text-gray-600">
                  Michael leads our technology team, ensuring ConsultBridge
                  remains at the cutting edge of innovation and user experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-6">
              Join Our Growing Community
            </h3>
            <p className="text-xl text-gray-700 mb-8">
              Whether you're seeking expert advice or looking to offer your
              consultancy services, ConsultBridge is the platform for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/categories"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Explore Services
              </Link>
              <Link
                to="/contact"
                className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">ConsultBridge</h4>
              <p className="text-gray-400">
                Connecting you with the right consultancy services
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Categories</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/category/business" className="hover:text-white">
                    Business
                  </Link>
                </li>
                <li>
                  <Link to="/category/finance" className="hover:text-white">
                    Finance
                  </Link>
                </li>
                <li>
                  <Link to="/category/legal" className="hover:text-white">
                    Legal
                  </Link>
                </li>
                <li>
                  <Link to="/category/technology" className="hover:text-white">
                    Technology
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Connect</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="https://twitter.com" className="hover:text-white">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com" className="hover:text-white">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="https://facebook.com" className="hover:text-white">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="https://instagram.com" className="hover:text-white">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ConsultBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AboutPage;
