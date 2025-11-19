import Link from "next/link";
import { Users, Award, TrendingUp, Shield } from "lucide-react";
import Navbar from "../Navbar";
import PageTransition from "../PageTransition";
import Footer from "../Footer";
import SmartPageWrapper from "../SmartPageWrapper";
function AboutPage() {
  return (
    <SmartPageWrapper loadingMessage="📚 Learning about ConsultBridge...">
      <PageTransition>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-all duration-300">
          <Navbar />

          {/* Hero Section */}
          <section className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:bg-gradient-to-br dark:from-slate-900 dark:via-gray-900 dark:to-black text-white py-12 md:py-20 relative overflow-hidden">
            <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-blue-900/30 dark:via-purple-900/40 dark:to-pink-900/30"></div>
            <div className="relative z-10">
              <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-3xl mx-auto text-center">
                  <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">
                    About ConsultBridge
                  </h2>
                  <p className="text-lg md:text-xl text-indigo-100 leading-relaxed">
                    We're on a mission to connect individuals and businesses
                    with the perfect consultancy services, making expert advice
                    accessible to everyone.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Our Story */}
          <section className="py-8 md:py-16">
            <div className="container mx-auto px-4 md:px-6">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-gray-900 dark:text-white transition-all duration-300">
                  Our Story
                </h3>
                <div className="bg-white dark:bg-black rounded-xl shadow-lg dark:shadow-2xl p-4 md:p-8 mb-8 md:mb-12 border dark:border-white/20 transition-all duration-300">
                  <p className="text-sm md:text-lg text-gray-700 dark:text-white leading-relaxed mb-4 md:mb-6 transition-all duration-300">
                    ConsultBridge was founded in 2023 with a simple yet powerful
                    vision: to bridge the gap between those seeking expert
                    guidance and the consultants who provide it. Our founders,
                    having experienced firsthand the challenges of finding the
                    right consultancy services, set out to create a platform
                    that would revolutionize the industry.
                  </p>
                  <p className="text-sm md:text-lg text-gray-700 dark:text-white leading-relaxed mb-4 md:mb-6 transition-all duration-300">
                    What began as a small startup has quickly grown into a
                    trusted marketplace connecting thousands of clients with
                    top-rated consultants across various fields. Our commitment
                    to quality, transparency, and user satisfaction has been the
                    cornerstone of our success.
                  </p>
                  <p className="text-sm md:text-lg text-gray-700 dark:text-white leading-relaxed transition-all duration-300">
                    Today, ConsultBridge stands as a testament to our belief
                    that everyone deserves access to expert advice that can
                    transform their personal and professional lives. We continue
                    to innovate and expand our services, always keeping our
                    users' needs at the heart of everything we do.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Our Values */}
          <section className="py-8 md:py-16 bg-gray-100 dark:bg-dark-bg transition-all duration-300">
            <div className="container mx-auto px-4 md:px-6">
              <h3 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center text-gray-900 dark:text-white transition-all duration-300">
                Our Core Values
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                <div className="bg-white dark:bg-black rounded-xl shadow-md dark:shadow-2xl p-4 md:p-8 text-center border dark:border-white/20 transition-all duration-300">
                  <Users className="w-8 h-8 md:w-12 md:h-12 text-indigo-500 dark:text-indigo-400 mx-auto mb-3 md:mb-4" />
                  <h4 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900 dark:text-white transition-all duration-300">
                    Client-Centered
                  </h4>
                  <p className="text-sm md:text-base text-gray-600 dark:text-white transition-all duration-300">
                    We put our users first, ensuring every feature and service
                    is designed with their needs in mind.
                  </p>
                </div>
                <div className="bg-white dark:bg-black rounded-xl shadow-md dark:shadow-2xl p-4 md:p-8 text-center border dark:border-white/20 transition-all duration-300">
                  <Award className="w-8 h-8 md:w-12 md:h-12 text-purple-500 dark:text-purple-400 mx-auto mb-3 md:mb-4" />
                  <h4 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900 dark:text-white transition-all duration-300">
                    Excellence
                  </h4>
                  <p className="text-sm md:text-base text-gray-600 dark:text-white transition-all duration-300">
                    We maintain the highest standards in every aspect of our
                    platform and services.
                  </p>
                </div>
                <div className="bg-white dark:bg-black rounded-xl shadow-md dark:shadow-2xl p-4 md:p-8 text-center border dark:border-white/20 transition-all duration-300">
                  <TrendingUp className="w-8 h-8 md:w-12 md:h-12 text-pink-500 dark:text-pink-400 mx-auto mb-3 md:mb-4" />
                  <h4 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900 dark:text-white transition-all duration-300">
                    Innovation
                  </h4>
                  <p className="text-sm md:text-base text-gray-600 dark:text-white transition-all duration-300">
                    We continuously evolve and improve our platform to stay
                    ahead of industry trends.
                  </p>
                </div>
                <div className="bg-white dark:bg-black rounded-xl shadow-md dark:shadow-2xl p-4 md:p-8 text-center border dark:border-white/20 transition-all duration-300">
                  <Shield className="w-8 h-8 md:w-12 md:h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-3 md:mb-4" />
                  <h4 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900 dark:text-white transition-all duration-300">
                    Trust
                  </h4>
                  <p className="text-sm md:text-base text-gray-600 dark:text-white transition-all duration-300">
                    We foster a transparent environment where users can make
                    confident decisions.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="py-8 md:py-16 bg-gray-50 dark:bg-dark-bg transition-all duration-300">
            <div className="container mx-auto px-4 md:px-6">
              <h3 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center text-gray-900 dark:text-white transition-all duration-300">
                Meet Our Leadership Team
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                <div className="bg-white dark:bg-black rounded-xl shadow-lg dark:shadow-2xl overflow-hidden border dark:border-white/20 transition-all duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=60"
                    alt="CEO"
                    className="w-full h-48 md:h-64 object-cover"
                    style={{ objectPosition: "50% 15%" }}
                  />
                  <div className="p-4 md:p-6">
                    <h4 className="text-lg md:text-xl font-bold mb-1 text-gray-900 dark:text-white transition-all duration-300">
                      David Mitchell
                    </h4>
                    <p className="text-indigo-600 dark:text-indigo-400 mb-3 md:mb-4 text-sm md:text-base transition-all duration-300">
                      CEO & Co-Founder
                    </p>
                    <p className="text-sm md:text-base text-gray-600 dark:text-white transition-all duration-300">
                      With over 15 years of experience in the consultancy
                      industry, David brings vision and strategic leadership to
                      ConsultBridge.
                    </p>
                  </div>
                </div>
                <div className="bg-white dark:bg-black rounded-xl shadow-lg dark:shadow-2xl overflow-hidden border dark:border-white/20 transition-all duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60"
                    alt="COO"
                    className="w-full h-48 md:h-64 object-cover"
                    style={{ objectPosition: "50% 25%" }}
                  />
                  <div className="p-4 md:p-6">
                    <h4 className="text-lg md:text-xl font-bold mb-1 text-gray-900 dark:text-white transition-all duration-300">
                      Sarah Johnson
                    </h4>
                    <p className="text-purple-600 dark:text-purple-400 mb-3 md:mb-4 text-sm md:text-base transition-all duration-300">
                      COO & Co-Founder
                    </p>
                    <p className="text-sm md:text-base text-gray-600 dark:text-white transition-all duration-300">
                      Sarah's background in operations and technology has been
                      instrumental in building our efficient and user-friendly
                      platform.
                    </p>
                  </div>
                </div>
                <div className="bg-white dark:bg-black rounded-xl shadow-lg dark:shadow-2xl overflow-hidden border dark:border-white/20 transition-all duration-300">
                  <img
                    src="/ansh.jpg"
                    alt="CTO"
                    className="w-full h-48 md:h-64 object-cover"
                    style={{ objectPosition: "50% 35%" }}
                  />
                  <div className="p-4 md:p-6">
                    <h4 className="text-lg md:text-xl font-bold mb-1 text-gray-900 dark:text-white transition-all duration-300">
                      Ansh Tank
                    </h4>
                    <p className="text-pink-600 dark:text-pink-400 mb-3 md:mb-4 text-sm md:text-base transition-all duration-300">
                      CTO & Founder
                    </p>
                    <p className="text-sm md:text-base text-gray-600 dark:text-white transition-all duration-300">
                      Ansh leads our technology vision and development, bringing
                      innovative solutions and cutting-edge technology to
                      revolutionize the consultancy industry.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-8 md:py-16 bg-gray-100 dark:bg-dark-bg transition-all duration-300">
            <div className="container mx-auto px-4 md:px-6">
              <div className="max-w-4xl mx-auto text-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white transition-all duration-300">
                  Join Our Growing Community
                </h3>
                <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-6 md:mb-8 transition-all duration-300">
                  Whether you're seeking expert advice or looking to offer your
                  consultancy services, ConsultBridge is the platform for you.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                  <Link
                    href="/categories"
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 md:px-8 py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg text-sm md:text-base"
                  >
                    Explore Services
                  </Link>
                  <Link
                    href="/contact"
                    className="bg-white dark:bg-black text-indigo-600 dark:text-white border border-indigo-300 dark:border-white/20 px-6 md:px-8 py-3 rounded-lg font-medium hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors shadow-sm text-sm md:text-base"
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
    </SmartPageWrapper>
  );
}

export default AboutPage;
