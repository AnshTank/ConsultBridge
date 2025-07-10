import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import { Shield, Eye, Lock, Users, Database, Globe } from "lucide-react";

export default function PrivacyPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
          <Navbar />
        </header>

        <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
          <div className="container mx-auto px-6 text-center">
            <Shield className="w-16 h-16 mx-auto mb-6 text-white" />
            <h2 className="text-5xl font-bold mb-6">Privacy Policy</h2>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Your privacy and data security are fundamental to our mission of
              connecting consultants and clients safely
            </p>
          </div>
        </section>

        <section className="py-16 flex-grow">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="bg-white rounded-2xl shadow-xl p-10">
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-l-4 border-blue-500">
                <p className="text-gray-700 font-medium">
                  Last updated: January 15, 2025
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Effective Date: January 1, 2025
                </p>
              </div>

              <div className="space-y-12">
                <div className="flex items-start space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <Eye className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">
                      Information We Collect
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Personal Information
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                          <li>Name, email address, phone number</li>
                          <li>Professional credentials and certifications</li>
                          <li>Business information and service descriptions</li>
                          <li>Profile photos and portfolio content</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Usage Information
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                          <li>Platform interaction data and preferences</li>
                          <li>Search queries and browsing patterns</li>
                          <li>Communication logs and appointment history</li>
                          <li>Device information and IP addresses</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Database className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">
                      How We Use Your Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">
                          Service Delivery
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-blue-700 text-sm">
                          <li>Facilitate consultancy connections</li>
                          <li>Process appointments and payments</li>
                          <li>Provide customer support</li>
                        </ul>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-800 mb-2">
                          Platform Improvement
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-purple-700 text-sm">
                          <li>Enhance user experience</li>
                          <li>Develop new features</li>
                          <li>Analyze usage patterns</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">
                      Information Sharing & Disclosure
                    </h3>
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                      <p className="text-red-800 font-semibold">
                        We DO NOT sell your personal information to third
                        parties.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">
                          <strong>With Consultants:</strong> Basic contact info
                          for confirmed appointments
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">
                          <strong>Legal Requirements:</strong> When required by
                          law or legal process
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">
                          <strong>Service Providers:</strong> Trusted partners
                          for payment processing and analytics
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <Lock className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">
                      Data Security & Protection
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Lock className="w-6 h-6 text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-1">
                          Encryption
                        </h4>
                        <p className="text-sm text-gray-600">
                          End-to-end encryption for all data transmission
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-1">
                          Access Control
                        </h4>
                        <p className="text-sm text-gray-600">
                          Strict access controls and authentication
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Database className="w-6 h-6 text-purple-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-1">
                          Secure Storage
                        </h4>
                        <p className="text-sm text-gray-600">
                          Industry-standard secure data centers
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Globe className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">
                      Your Rights & Choices
                    </h3>
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">
                            Data Rights
                          </h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Access your personal data</li>
                            <li>• Correct inaccurate information</li>
                            <li>• Delete your account and data</li>
                            <li>• Export your data</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">
                            Communication Preferences
                          </h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Opt-out of marketing emails</li>
                            <li>• Control notification settings</li>
                            <li>• Manage cookie preferences</li>
                            <li>• Update privacy settings</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-xl">
                  <h3 className="text-2xl font-bold mb-4">
                    Contact Our Privacy Team
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="mb-4">
                        Questions about this Privacy Policy or your data?
                      </p>
                      <div className="space-y-2">
                        <p>
                          <strong>Email:</strong> privacy@consultbridge.com
                        </p>
                        <p>
                          <strong>Phone:</strong> +91 95102-99313
                        </p>
                        <p>
                          <strong>Address:</strong> 123 Innovation Drive,
                          Vadodara, P.C. 391760
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Response Time</h4>
                      <p className="text-sm">
                        We respond to privacy inquiries within 48 hours and
                        resolve requests within 30 days as required by
                        applicable privacy laws.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-gray-900 text-white py-12 mt-auto">
          <div className="container mx-auto px-6 text-center">
            <p>
              &copy; 2025 ConsultBridge. All rights reserved. | Founded by Ansh
              Tank
            </p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
