'use client';
import { useState, useEffect } from 'react';
import { Clock, Video, Calendar, User } from 'lucide-react';

export default function MeetingHistory({ userId, consultancyId, userRole }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetingHistory = async () => {
      try {
        const param = userId ? `userId=${userId}` : `consultancyId=${consultancyId}`;
        const response = await fetch(`/api/meetings/history?${param}`);
        const result = await response.json();
        
        if (result.success) {
          setMeetings(result.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch meeting history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId || consultancyId) {
      fetchMeetingHistory();
    }
  }, [userId, consultancyId]);

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Meeting History</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Video className="w-5 h-5 text-blue-500" />
        Meeting History
      </h3>
      
      {meetings.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No meetings yet</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {meetings.map((meeting) => (
            <div key={meeting._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    meeting.status === 'completed' ? 'bg-green-500' : 
                    meeting.status === 'active' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="font-medium text-sm">
                    Meeting {meeting.meetingId.split('-').pop()}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  meeting.status === 'completed' ? 'bg-green-100 text-green-800' :
                  meeting.status === 'active' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {meeting.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(meeting.startedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(meeting.duration)}</span>
                </div>
              </div>
              
              {meeting.endedAt && (
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(meeting.startedAt).toLocaleTimeString()} - {new Date(meeting.endedAt).toLocaleTimeString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}