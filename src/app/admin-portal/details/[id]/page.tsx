"use client";
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowLeft, Mail, Phone, MapPin, Star, Eye } from 'lucide-react';

interface Consultancy {
  _id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  contact: {
    email: string;
    phone: string;
    website: string;
  };
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  rating: number;
  reviews: number;
  createdAt: string;
  image?: string;
  expertise?: string[];
  whyChooseUs?: string[];
  availability?: {
    days?: string[];
    hours?: string;
  };
  price?: string;
}

export default function ConsultancyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [consultancy, setConsultancy] = useState<Consultancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationNote, setVerificationNote] = useState('');
  const [selectedVerificationType, setSelectedVerificationType] = useState<'email' | 'phone'>('email');



  useEffect(() => {
    // Check if user is authenticated
    const isAuth = localStorage.getItem('adminAuthenticated');
    if (!isAuth) {
      router.push('/admin-portal');
      return;
    }
    fetchConsultancy();
  }, [params.id, router]);

  const fetchConsultancy = async () => {
    try {
      const response = await fetch('/api/consultancies');
      const data = await response.json();
      if (data.success) {
        const found = data.consultancies.find((c: Consultancy) => c._id === params.id);
        setConsultancy(found || null);
      }
    } catch (error) {
      console.error('Error fetching consultancy:', error);
    }
    setLoading(false);
  };

  const updateStatus = async (status: 'verified' | 'rejected', reason?: string) => {
    try {
      const response = await fetch('/api/admin/consultancies/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultancyId: params.id, status, rejectionReason: reason })
      });

      if (response.ok) {
        setConsultancy(prev => prev ? { ...prev, status, rejectionReason: reason } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (rejectReason.trim()) {
      updateStatus('rejected', rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    }
  };

  const handleSendVerificationNote = (type: 'email' | 'phone') => {
    setSelectedVerificationType(type);
    setVerificationNote('Please verify your phone number and email address to resubmit your application.');
    setShowVerificationModal(true);
  };

  const confirmSendVerificationNote = async () => {
    if (verificationNote.trim()) {
      try {
        const response = await fetch('/api/admin/send-verification-note', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            consultancyId: params.id, 
            verificationNote: verificationNote,
            verificationType: selectedVerificationType,
            contact: selectedVerificationType === 'email' ? consultancy?.contact?.email : consultancy?.contact?.phone
          })
        });

        if (response.ok) {
          const data = await response.json();
          alert(data.message);
          setConsultancy(prev => prev ? { ...prev, status: 'rejected', rejectionReason: verificationNote } : null);
        }
      } catch (error) {
        console.error('Error sending verification note:', error);
      }
      
      setShowVerificationModal(false);
      setVerificationNote('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center transition-all duration-300">
        <div className="text-xl text-gray-600 dark:text-gray-300 transition-all duration-300">Loading...</div>
      </div>
    );
  }

  if (!consultancy) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center transition-all duration-300">
        <div className="text-center">
          <div className="text-xl text-gray-600 dark:text-gray-300 mb-4 transition-all duration-300">Consultancy not found</div>
          <button
            onClick={() => router.push('/admin-portal')}
            className="bg-indigo-600 dark:bg-neon-blue text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-neon-cyan transition-all duration-300"
          >
            Back to Admin Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-dark-bg dark:via-dark-bg dark:to-dark-bg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <button
            onClick={() => {
              // Ensure authentication persists
              localStorage.setItem('adminAuthenticated', 'true');
              router.push('/admin-portal');
            }}
            className="flex items-center gap-2 text-indigo-600 dark:text-neon-blue hover:text-indigo-800 dark:hover:text-neon-cyan transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Portal
          </button>
        </div>

        <div className="bg-white dark:bg-dark-card dark:border dark:border-dark-border rounded-xl shadow-lg dark:shadow-neon-lg overflow-hidden transition-all duration-300">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 p-6 text-white transition-all duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">{consultancy.name}</h1>
                <p className="text-indigo-100 dark:text-gray-300 transition-all duration-300">{consultancy.category}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                consultancy.status === 'verified' ? 'bg-green-100 text-green-800' :
                consultancy.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {consultancy.status?.toUpperCase() || 'PENDING'}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700 transition-all duration-300">
                  <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-4 text-lg flex items-center gap-2 transition-all duration-300">
                    📊 Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 transition-all duration-300">
                      <MapPin className="w-4 h-4" />
                      <span className="font-semibold">Location:</span> {consultancy.location}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 transition-all duration-300">
                      <Star className="w-4 h-4" />
                      <span className="font-semibold">Rating:</span> {consultancy.rating}/5 ({consultancy.reviews} reviews)
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 transition-all duration-300"><span className="font-semibold">Price:</span> {consultancy.price || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300 transition-all duration-300"><span className="font-semibold">Registered:</span> {new Date(consultancy.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700 transition-all duration-300">
                  <h3 className="font-bold text-green-800 dark:text-green-300 mb-4 text-lg flex items-center gap-2 transition-all duration-300">
                    📞 Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 transition-all duration-300">
                          <Mail className="w-4 h-4" />
                          <span className="font-semibold">Email:</span> {consultancy.contact?.email}
                          {consultancy.verification?.emailVerified ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        {!consultancy.verification?.emailVerified && (
                          <button
                            onClick={() => handleSendVerificationNote('email')}
                            className="text-xs bg-blue-500 dark:bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-300"
                          >
                            📧 Verify
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 transition-all duration-300">
                          <Phone className="w-4 h-4" />
                          <span className="font-semibold">Phone:</span> {consultancy.contact?.phone}
                          {consultancy.verification?.phoneVerified ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        {!consultancy.verification?.phoneVerified && (
                          <button
                            onClick={() => handleSendVerificationNote('phone')}
                            className="text-xs bg-blue-500 dark:bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-300"
                          >
                            📱 Verify
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 transition-all duration-300"><span className="font-semibold">Website:</span> {consultancy.contact?.website || 'N/A'}</p>
                  </div>
                </div>

                {consultancy.availability && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700 transition-all duration-300">
                    <h3 className="font-bold text-purple-800 dark:text-purple-300 mb-4 text-lg flex items-center gap-2 transition-all duration-300">
                      📅 Availability
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300 transition-all duration-300">Days:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {consultancy.availability.days?.map((day, index) => (
                            <span key={index} className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs transition-all duration-300">
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 transition-all duration-300"><span className="font-semibold">Hours:</span> {consultancy.availability.hours}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                {consultancy.expertise && consultancy.expertise.length > 0 && (
                  <div className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-700 transition-all duration-300">
                    <h3 className="font-bold text-orange-800 dark:text-orange-300 mb-4 text-lg flex items-center gap-2 transition-all duration-300">
                      🎯 Expertise
                    </h3>
                    <div className="space-y-2">
                      {consultancy.expertise.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          <span className="text-gray-700 dark:text-gray-300 transition-all duration-300">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-800/20 dark:to-slate-800/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 text-lg flex items-center gap-2 transition-all duration-300">
                    📝 Description
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed transition-all duration-300">{consultancy.description}</p>
                </div>

                {consultancy.whyChooseUs && consultancy.whyChooseUs.length > 0 && (
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-teal-200 dark:border-teal-700 transition-all duration-300">
                    <h3 className="font-bold text-teal-800 dark:text-teal-300 mb-4 text-lg flex items-center gap-2 transition-all duration-300">
                      ✨ Why Choose Us
                    </h3>
                    <div className="space-y-2">
                      {Array.isArray(consultancy.whyChooseUs) ? (
                        consultancy.whyChooseUs.map((reason, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-gray-700 dark:text-gray-300 transition-all duration-300">{reason}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400 text-sm transition-all duration-300">No reasons provided</div>
                      )}
                    </div>
                  </div>
                )}

                {consultancy.status === 'rejected' && consultancy.rejectionReason && (
                  <div className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700 transition-all duration-300">
                    <h3 className="font-bold text-red-800 dark:text-red-300 mb-4 text-lg transition-all duration-300">❌ Rejection Reason</h3>
                    <p className="text-red-700 dark:text-red-300 transition-all duration-300">{consultancy.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 transition-all duration-300">
              <div className="flex gap-4 justify-center flex-wrap">
                {consultancy.image && (
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="bg-purple-500 dark:bg-purple-600 border-2 border-purple-500 dark:border-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-600 dark:hover:bg-purple-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Eye className="w-5 h-5" />
                    🖼️ View Image
                  </button>
                )}
                {(consultancy.status === 'pending' || !consultancy.status) && (
                  <>
                    <button
                      onClick={() => updateStatus('verified')}
                      className="bg-green-500 dark:bg-green-600 border-2 border-green-500 dark:border-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-600 dark:hover:bg-green-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg font-semibold"
                    >
                      <CheckCircle className="w-5 h-5" />
                      ✅ Approve Consultancy
                    </button>
                    <button
                      onClick={handleReject}
                      className="bg-red-500 dark:bg-red-600 border-2 border-red-500 dark:border-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-600 dark:hover:bg-red-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg font-semibold"
                    >
                      <XCircle className="w-5 h-5" />
                      ❌ Reject Consultancy
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {showImageModal && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              overflow: 'hidden'
            }}
            onClick={() => setShowImageModal(false)}
          >
            <div 
              className="bg-white dark:bg-dark-card dark:border dark:border-dark-border rounded-2xl shadow-2xl dark:shadow-neon-lg max-w-2xl w-[90vw] overflow-hidden transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-800 dark:to-pink-800 p-4 text-white transition-all duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">🖼️ {consultancy.name} - Image</h3>
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="text-white hover:text-gray-200 text-2xl font-light"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="w-full h-96 bg-gray-100 dark:bg-dark-surface rounded-lg overflow-hidden transition-all duration-300">
                  <img
                    src={consultancy.image}
                    alt={consultancy.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=60';
                    }}
                  />
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 transition-all duration-300">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="w-full bg-gray-500 dark:bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            style={{ top: `${typeof window !== 'undefined' ? window.scrollY : 0}px`, height: '100vh' }}
            onClick={() => setShowRejectModal(false)}
          >
            <div 
              className="bg-white rounded-xl p-6 w-96 max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 text-red-600">❌ Reject Consultancy</h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejection:
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter rejection reason..."
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={!rejectReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Verification Note Modal */}
        {showVerificationModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            style={{ top: `${typeof window !== 'undefined' ? window.scrollY : 0}px`, height: '100vh' }}
            onClick={() => setShowVerificationModal(false)}
          >
            <div 
              className="bg-white rounded-xl p-6 w-96 max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 text-blue-600">📧 Send Verification Note</h3>
              <p className="text-gray-600 mb-4">
                Send a verification note for {selectedVerificationType} verification:
              </p>
              <textarea
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please verify your phone number and email address to resubmit your application."
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowVerificationModal(false);
                    setVerificationNote('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSendVerificationNote}
                  disabled={!verificationNote.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}