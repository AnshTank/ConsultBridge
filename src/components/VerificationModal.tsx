"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { usePopup } from '../contexts/PopupContext';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultancyId: string;
  email: string;
  phone: string;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  consultancyId,
  email,
  phone
}) => {
  const { openPopup, closePopup } = usePopup();
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      openPopup('verification-modal');
    } else {
      closePopup('verification-modal');
    }
  }, [isOpen, openPopup, closePopup]);



  const sendVerificationCode = async (type: 'email' | 'phone') => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/consultancies/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultancyId, type })
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (type === 'email') setEmailSent(true);
        if (type === 'phone') setPhoneSent(true);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to send verification code');
    }
    
    setLoading(false);
  };

  const verifyCode = async (type: 'email' | 'phone') => {
    setLoading(true);
    setError('');
    
    const code = type === 'email' ? emailCode : phoneCode;
    
    try {
      const response = await fetch('/api/consultancies/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultancyId, type, code })
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (type === 'email') {
          setEmailVerified(true);
          setEmailCode('');
        }
        if (type === 'phone') {
          setPhoneVerified(true);
          setPhoneCode('');
        }
        
        // Check if both are verified
        if (data.isFullyVerified) {
          setTimeout(() => {
            onClose();
            // Show success message
            alert('🎉 Congratulations! Your consultancy has been successfully verified and is now pending admin approval.');
          }, 1000);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to verify code');
    }
    
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Verify Your Account</h2>
                <p className="text-indigo-100 text-sm mt-1">
                  Complete verification to activate your consultancy
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Email Verification */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  emailVerified ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {emailVerified ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Mail className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">Email Verification</h3>
                  <p className="text-sm text-gray-600">{email}</p>
                </div>
                {emailVerified && (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
              </div>

              {!emailVerified && (
                <div className="ml-13 space-y-3">
                  {!emailSent ? (
                    <button
                      onClick={() => sendVerificationCode('email')}
                      disabled={loading}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send Code'}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Enter the 6-digit code sent to your email:</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={emailCode}
                          onChange={(e) => setEmailCode(e.target.value)}
                          placeholder="123456"
                          maxLength={6}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => verifyCode('email')}
                          disabled={loading || emailCode.length !== 6}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 disabled:opacity-50"
                        >
                          Verify
                        </button>
                      </div>
                      <button
                        onClick={() => sendVerificationCode('email')}
                        className="text-blue-500 text-sm hover:underline"
                      >
                        Resend Code
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Phone Verification */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  phoneVerified ? 'bg-green-100' : 'bg-purple-100'
                }`}>
                  {phoneVerified ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Phone className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">Phone Verification</h3>
                  <p className="text-sm text-gray-600">{phone}</p>
                </div>
                {phoneVerified && (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
              </div>

              {!phoneVerified && (
                <div className="ml-13 space-y-3">
                  {!phoneSent ? (
                    <button
                      onClick={() => sendVerificationCode('phone')}
                      disabled={loading}
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send Code'}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Enter the 6-digit code sent to your phone:</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={phoneCode}
                          onChange={(e) => setPhoneCode(e.target.value)}
                          placeholder="123456"
                          maxLength={6}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          onClick={() => verifyCode('phone')}
                          disabled={loading || phoneCode.length !== 6}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 disabled:opacity-50"
                        >
                          Verify
                        </button>
                      </div>
                      <button
                        onClick={() => sendVerificationCode('phone')}
                        className="text-purple-500 text-sm hover:underline"
                      >
                        Resend Code
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status */}
            {emailVerified && phoneVerified && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">Verification Complete!</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Your consultancy is now pending admin approval. You'll be notified once approved.
                </p>
              </div>
            )}

            {/* Progress */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Verification Progress</span>
                <span className="text-sm text-gray-600">
                  {(emailVerified ? 1 : 0) + (phoneVerified ? 1 : 0)}/2
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((emailVerified ? 1 : 0) + (phoneVerified ? 1 : 0)) * 50}%` }}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VerificationModal;