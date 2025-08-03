"use client";
import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Mail, Phone } from 'lucide-react';

export default function VerifyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [consultancyName, setConsultancyName] = useState('');
  
  const token = params.token as string;
  const type = searchParams.get('type') as 'email' | 'phone';
  const consultancyId = searchParams.get('consultancy');
  const rejectionReason = searchParams.get('reason');
  const adminNote = searchParams.get('note');

  useEffect(() => {
    verifyToken();
  }, [token, type, consultancyId]);

  const verifyToken = async () => {
    try {
      const response = await fetch('/api/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, type, consultancyId })
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setConsultancyName(data.consultancyName);
      } else {
        setStatus(data.expired ? 'expired' : 'error');
        setMessage(data.message);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to verify token. Please try again.');
    }
  };

  const getIcon = () => {
    if (type === 'email') return <Mail className="w-16 h-16" />;
    if (type === 'phone') return <Phone className="w-16 h-16" />;
    return null;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-20 h-20 text-green-500" />;
      case 'error':
      case 'expired':
        return <XCircle className="w-20 h-20 text-red-500" />;
      default:
        return <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'from-green-500 to-emerald-600';
      case 'error':
      case 'expired':
        return 'from-red-500 to-red-600';
      default:
        return 'from-indigo-500 to-purple-600';
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'success':
        return `${type === 'email' ? 'Email' : 'Phone'} Verified Successfully!`;
      case 'expired':
        return 'Verification Link Expired';
      case 'error':
        return 'Verification Failed';
      default:
        return `Verifying ${type === 'email' ? 'Email' : 'Phone'}...`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r ${getStatusColor()} p-8 text-white text-center`}>
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <h1 className="text-2xl font-bold mb-2">{getTitle()}</h1>
            {consultancyName && (
              <p className="text-white/80">for {consultancyName}</p>
            )}
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6 text-gray-400">
              {getIcon()}
            </div>

            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">{message}</p>

              {status === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    ✅ Your {type === 'email' ? 'email address' : 'phone number'} has been successfully verified. 
                    Your consultancy profile is now updated.
                  </p>
                </div>
              )}

              {adminNote && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-blue-800 font-semibold text-sm mb-2 flex items-center gap-2">
                    📝 Admin Note:
                  </h4>
                  <p className="text-blue-700 text-sm">
                    {adminNote}
                  </p>
                  <p className="text-blue-600 text-xs mt-2">
                    Please verify your {type === 'email' ? 'email address' : 'phone number'} to continue.
                  </p>
                </div>
              )}

              {rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-red-800 font-semibold text-sm mb-2">Previous Rejection Reason:</h4>
                  <p className="text-red-700 text-sm">
                    {rejectionReason}
                  </p>
                  <p className="text-red-600 text-xs mt-2">
                    Please address this issue and verify your {type === 'email' ? 'email' : 'phone'} to resubmit.
                  </p>
                </div>
              )}

              {status === 'expired' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    ⏰ This verification link has expired. Please contact the admin to request a new verification link.
                  </p>
                </div>
              )}

              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">
                    ❌ Verification failed. The link may be invalid or already used. Please contact support if you need assistance.
                  </p>
                </div>
              )}
            </div>

            {status !== 'loading' && (
              <div className="mt-8">
                <button
                  onClick={() => window.close()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Close Window
                </button>
              </div>
            )}
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