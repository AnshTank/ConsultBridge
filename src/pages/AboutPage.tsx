import Link from "next/link";
import { Users, Award, TrendingUp, Shield } from "lucide-react";
import Navbar from "../components/Navbar";
import PageTransition from "../components/PageTransition";
import Footer from "../components/Footer";
function AboutPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
        <Navbar />
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">About ConsultBridge</h2>
            <p className="text-xl text-indigo-100 leading-relaxed">
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
              <Users className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-3">Client-Centered</h4>
              <p className="text-gray-600">
                We put our users first, ensuring every feature and service is
                designed with their needs in mind.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <Award className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-3">Excellence</h4>
              <p className="text-gray-600">
                We maintain the highest standards in every aspect of our
                platform and services.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <TrendingUp className="w-12 h-12 text-pink-500 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-3">Innovation</h4>
              <p className="text-gray-600">
                We continuously evolve and improve our platform to stay ahead of
                industry trends.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <Shield className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
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
                <p className="text-indigo-600 mb-4">CEO & Co-Founder</p>
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
                <p className="text-purple-600 mb-4">COO & Co-Founder</p>
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
                <p className="text-pink-600 mb-4">CTO</p>
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
      <section className="py-16 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
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
                href="/categories"
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg"
              >
                Explore Services
              </Link>
              <Link
                href="/contact"
                className="bg-white text-indigo-600 border border-indigo-300 px-8 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors shadow-sm"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </PageTransition>
  );
}

export default AboutPage;
