'use client';
import { useState } from 'react';

export default function MeetingInterface({ consultancyId, appointmentId }) {
  const [meetingId, setMeetingId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState('');

  const createMeeting = async (role = 'consultant') => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/meetings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          consultancyId, 
          appointmentId,
          createdBy: role 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setMeetingId(data.meetingId);
        const url = `/meeting/${data.meetingId}?role=${role}&name=Consultant&userId=${consultancyId}`;
        setMeetingUrl(url);
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Failed to create meeting:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const joinMeeting = async (inputMeetingId, role = 'user', userName = 'User') => {
    try {
      const response = await fetch('/api/meetings/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          meetingId: inputMeetingId, 
          userRole: role, 
          userName,
          userId: role === 'user' ? appointmentId : consultancyId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        window.open(data.meetingUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to join meeting:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Video Meeting</h3>
      
      <div className="space-y-4">
        <button
          onClick={() => createMeeting('consultant')}
          disabled={isCreating}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isCreating ? 'Creating Meeting...' : 'Start Meeting (Host)'}
        </button>

        {meetingId && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Meeting ID:</p>
            <code className="bg-gray-200 px-2 py-1 rounded text-sm font-mono">
              {meetingId}
            </code>
            <p className="text-xs text-gray-500 mt-2">
              Share this ID with participants
            </p>
          </div>
        )}

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Join Existing Meeting</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter Meeting ID"
              className="flex-1 border rounded-lg px-3 py-2"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value) {
                  joinMeeting(e.target.value, 'user', 'Participant');
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                if (input.value) {
                  joinMeeting(input.value, 'user', 'Participant');
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}