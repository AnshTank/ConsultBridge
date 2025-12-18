'use client';
import { useState, useEffect } from 'react';

export default function AppointmentMeeting({ appointment, userRole, currentUser }) {
  const [meetingId, setMeetingId] = useState(appointment?.meetingId || '');
  const [isCreating, setIsCreating] = useState(false);
  const [meetingStatus, setMeetingStatus] = useState('pending');

  useEffect(() => {
    if (appointment?.meetingId) {
      setMeetingId(appointment.meetingId);
      setMeetingStatus('created');
    }
  }, [appointment]);

  const createMeeting = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/meetings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultancyId: appointment.consultancyId,
          appointmentId: appointment._id,
          createdBy: userRole
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setMeetingId(data.meetingId);
        setMeetingStatus('created');
        
        // Update appointment with meeting ID
        await fetch(`/api/appointments/${appointment._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingId: data.meetingId })
        });
      }
    } catch (error) {
      console.error('Failed to create meeting:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const joinMeeting = () => {
    if (meetingId) {
      const userName = currentUser?.name || 'Anonymous';
      const userId = currentUser?._id || '';
      const url = `/meeting/${meetingId}?role=${userRole}&name=${encodeURIComponent(userName)}&userId=${userId}`;
      window.open(url, '_blank');
    }
  };

  const canCreateMeeting = userRole === 'consultant' && !meetingId;
  const canJoinMeeting = meetingId && meetingStatus === 'created';

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Video Meeting</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          meetingStatus === 'created' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {meetingStatus === 'created' ? 'Ready' : 'Not Started'}
        </span>
      </div>

      {canCreateMeeting && (
        <button
          onClick={createMeeting}
          disabled={isCreating}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-3"
        >
          {isCreating ? 'Creating Meeting...' : 'Start Video Meeting'}
        </button>
      )}

      {canJoinMeeting && (
        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Meeting ID:</p>
            <code className="text-sm font-mono bg-gray-200 px-2 py-1 rounded">
              {meetingId}
            </code>
          </div>
          
          <button
            onClick={joinMeeting}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            Join Meeting
          </button>
          
          {userRole === 'consultant' && (
            <p className="text-xs text-gray-500 text-center">
              As host, you have full meeting controls
            </p>
          )}
          
          {userRole === 'user' && (
            <p className="text-xs text-gray-500 text-center">
              You'll join the waiting room until admitted by the consultant
            </p>
          )}
        </div>
      )}

      {!canCreateMeeting && !canJoinMeeting && (
        <p className="text-sm text-gray-500 text-center py-4">
          Waiting for consultant to start the meeting
        </p>
      )}
    </div>
  );
}