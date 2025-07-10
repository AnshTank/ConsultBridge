import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Scale,
  CreditCard,
  UserCheck,
} from "lucide-react";

export default function TermsPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
          <Navbar />
        </header>

        <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
          <div className="container mx-auto px-6 text-center">
            <FileText className="w-16 h-16 mx-auto mb-6 text-white" />
            <h2 className="text-5xl font-bold mb-6">Terms of Service</h2>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Clear, fair terms that protect both consultants and clients in our
              professional marketplace
            </p>
          </div>
        </section>

        <section className="py-16 flex-grow">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="bg-white rounded-2xl shadow-xl p-10">
              <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-l-4 border-green-500">
                <p className="text-gray-700 font-medium">
                  Last updated: January 15, 2025
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Effective Date: January 1, 2025
                </p>
                <p className="text-sm text-green-700 mt-2 font-medium">
                  Version 2.1 - Enhanced for better clarity and user protection
                </p>
              </div>

              <div className="space-y-12">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">
                      Acceptance & Agreement
                    </h3>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                      <p className="text-gray-700 mb-4">
                        By creating an account, accessing, or using
                        ConsultBridge services, you acknowledge that you have
                        read, understood, and agree to be legally bound by these
                        Terms of Service and our Privacy Policy.
                      </p>
                      <div className="flex items-center space-x-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Agreement constitutes a legally binding contract
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">
                      User Eligibility & Account Requirements
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">
                          For All Users
                        </h4>
                        <ul className="space-y-1 text-blue-700 text-sm">
                          <li>• Must be 18+ years old</li>
                          <li>• Provide accurate information</li>
                          <li>• Maintain account security</li>
                          <li>• One account per person/entity</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-800 mb-2">
                          For Consultants
                        </h4>
                        <ul className="space-y-1 text-purple-700 text-sm">
                          <li>• Valid professional credentials</li>
                          <li>• Business license (if required)</li>
                          <li>• Professional liability insurance</li>
                          <li>• Compliance with industry standards</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Scale className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">
                      Platform Rules & Conduct
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                        <h4 className="font-semibold text-green-800 mb-2">
                          ✅ Permitted Activities
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3 text-sm text-green-700">
                          <div>
                            <p>• Professional consultancy services</p>
                            <p>• Honest reviews and feedback</p>
                            <p>• Respectful communication</p>
                          </div>
                          <div>
                            <p>• Accurate service descriptions</p>
                            <p>• Timely appointment attendance</p>
                            <p>• Fair pricing practices</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                        <h4 className="font-semibold text-red-800 mb-2">
                          ❌ Prohibited Activities
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3 text-sm text-red-700">
                          <div>
                            <p>• Fraudulent or misleading information</p>
                            <p>• Harassment or discriminatory behavior</p>
                            <p>• Spam or unsolicited communications</p>
                          </div>
                          <div>
                            <p>• Circumventing platform fees</p>
                            <p>• Sharing contact info to avoid fees</p>
                            <p>• Illegal or unethical services</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <CreditCard className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">
                      Payment Terms & Fees
                    </h3>
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            5%
                          </div>
                          <div className="text-sm text-gray-600">
                            Platform Fee
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            2.9%
                          </div>
                          <div className="text-sm text-gray-600">
                            Payment Processing
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            24h
                          </div>
                          <div className="text-sm text-gray-600">
                            Payout Time
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>
                          • <strong>Clients:</strong> Pay full amount upfront,
                          protected by our guarantee
                        </p>
                        <p>
                          • <strong>Consultants:</strong> Receive payment after
                          successful session completion
                        </p>
                        <p>
                          • <strong>Refunds:</strong> Available within 24 hours
                          if consultant cancels or no-shows
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">
                      Liability & Disclaimers
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h4 className="font-semibold text-red-800 mb-2">
                          Platform Limitations
                        </h4>
                        <p className="text-red-700 text-sm">
                          ConsultBridge is a marketplace platform. We facilitate
                          connections but are not responsible for the quality,
                          accuracy, or outcomes of consultancy services provided
                          by independent consultants.
                        </p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold text-yellow-800 mb-2">
                          Liability Limits
                        </h4>
                        <p className="text-yellow-700 text-sm">
                          Our total liability is limited to the amount paid for
                          the specific service. We are not liable for indirect,
                          consequential, or punitive damages exceeding $1,000
                          per incident.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-xl">
                  <h3 className="text-2xl font-bold mb-6">
                    Dispute Resolution & Support
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Resolution Process</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                            1
                          </div>
                          <span>Direct communication between parties</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                            2
                          </div>
                          <span>Platform mediation within 48 hours</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                            3
                          </div>
                          <span>Binding arbitration if needed</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Contact Legal Team</h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Email:</strong> legal@consultbridge.com
                        </p>
                        <p>
                          <strong>Phone:</strong> +91 95102-99313
                        </p>
                        <p>
                          <strong>Response:</strong> Within 24 hours
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">
                    Changes to Terms
                  </h3>
                  <p className="text-gray-700 mb-3">
                    We may update these terms periodically. Significant changes
                    will be communicated via email and platform notifications 30
                    days before taking effect.
                  </p>
                  <div className="flex items-center space-x-2 text-blue-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Continued use constitutes acceptance of updated terms
                    </span>
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
