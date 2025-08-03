"use client";
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const adminNote = searchParams.get('note');
  const consultancyId = searchParams.get('consultancy');

  const handleVerify = async () => {
    if (emailCode !== '699385' || phoneCode !== '430563') {
      alert('Invalid verification codes. Please try again.');
      return;
    }

    if (!consultancyId) {
      alert('Consultancy ID not found. Please access this page through the verification link.');
      return;
    }

    console.log('Verifying consultancy:', consultancyId);
    setIsVerifying(true);
    
    try {
      const response = await fetch('/api/verify-consultancy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultancyId,
          emailCode,
          phoneCode
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Verification successful! Please resubmit your consultancy application.');
        router.push('/consultancy-setup');
      } else {
        alert(data.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      alert('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
            <div className="text-4xl mb-2">📱</div>
            <h1 className="text-2xl font-bold mb-2">Verify Your Details</h1>
            <p className="text-blue-100">We've sent verification codes to your email and phone</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Admin Note */}
            {adminNote && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-blue-800 font-semibold text-sm mb-2">📝 Admin Message:</h3>
                <p className="text-blue-700 text-sm">{adminNote}</p>
              </div>
            )}

            {/* Demo Codes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="text-yellow-800 font-semibold text-sm mb-3">📝 Demo Codes (For Testing):</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-yellow-700">Email Code:</span>
                  <span className="font-mono font-bold text-yellow-800">699385</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">Phone Code:</span>
                  <span className="font-mono font-bold text-yellow-800">430563</span>
                </div>
              </div>
              <p className="text-yellow-600 text-xs mt-2 italic">
                In production, these would be sent via SMS/Email
              </p>
            </div>

            {/* Verification Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Verification Code
                </label>
                <input
                  type="text"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono text-lg tracking-widest"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Verification Code
                </label>
                <input
                  type="text"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono text-lg tracking-widest"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>

              <button
                onClick={handleVerify}
                disabled={isVerifying || !emailCode || !phoneCode}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? 'Verifying...' : 'Verify Codes'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            © 2024 ConsultBridge - Verification System
          </p>
        </div>
      </div>
    </div>
  );
}