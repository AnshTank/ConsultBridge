'use client';
import { useState } from 'react';

export default function DemoMeeting() {
  const [meetingId, setMeetingId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [userName, setUserName] = useState('');

  const createMeeting = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/meetings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultancyId: 'demo-consultant',
          appointmentId: 'demo-appointment'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setMeetingId(data.meetingId);
      }
    } catch (error) {
      console.error('Failed to create meeting:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const joinMeeting = (role) => {
    if (meetingId && userName) {
      const url = `/meeting/${meetingId}?role=${role}&name=${encodeURIComponent(userName)}&userId=${role === 'consultant' ? 'demo-consultant' : 'demo-user'}`;
      window.open(url, '_blank');
    }
  };

  const joinExistingMeeting = (role) => {
    const inputMeetingId = document.getElementById('existingMeetingId').value;
    if (inputMeetingId && userName) {
      const url = `/meeting/${inputMeetingId}?role=${role}&name=${encodeURIComponent(userName)}&userId=${role === 'consultant' ? 'demo-consultant' : 'demo-user'}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">ConsultBridge Meeting Demo</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="border-b pb-4">
            <h3 className="font-semibold mb-3">Create New Meeting</h3>
            <button
              onClick={createMeeting}
              disabled={isCreating || !userName}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create Meeting'}
            </button>
            
            {meetingId && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Meeting ID:</p>
                <code className="bg-gray-200 px-2 py-1 rounded text-sm font-mono">
                  {meetingId}
                </code>
                
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => joinMeeting('consultant')}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    Join as Host
                  </button>
                  <button
                    onClick={() => joinMeeting('user')}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
                  >
                    Join as User
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-3">Join Existing Meeting</h3>
            <input
              id="existingMeetingId"
              type="text"
              placeholder="Enter Meeting ID"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => joinExistingMeeting('consultant')}
                disabled={!userName}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Join as Host
              </button>
              <button
                onClick={() => joinExistingMeeting('user')}
                disabled={!userName}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Join as User
              </button>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Role Differences:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Host:</strong> Full controls, starts unmuted, can manage participants</li>
              <li>• <strong>User:</strong> Limited controls, starts muted, waiting room enabled</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}