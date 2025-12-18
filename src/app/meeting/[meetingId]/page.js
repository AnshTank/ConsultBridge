'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function MeetingPage({ params }) {
  const { meetingId } = params;
  const searchParams = useSearchParams();
  const [meetingUrl, setMeetingUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState('user');
  const [userName, setUserName] = useState('Anonymous');

  useEffect(() => {
    const role = searchParams.get('role') || 'user';
    const name = searchParams.get('name') || 'Anonymous';
    const userId = searchParams.get('userId') || '';
    const duration = searchParams.get('duration') || '60';
    const isModerator = searchParams.get('moderator') === 'true';
    
    // Validate user access
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    setUserRole(role);
    setUserName(name);
    
    const jitsiUrl = `https://meet.jit.si/${meetingId}#config.startWithAudioMuted=${role === 'user'}&config.startWithVideoMuted=${role === 'user'}&config.prejoinPageEnabled=${role === 'user'}&userInfo.displayName=${encodeURIComponent(name)}&userInfo.email=${userId}@consultbridge.com&userInfo.moderator=${isModerator}`;
    
    setMeetingUrl(jitsiUrl);
    setIsLoading(false);
    
    // Auto-end meeting after duration (default 1 hour)
    const meetingDuration = parseInt(duration) * 60 * 1000;
    setTimeout(() => {
      if (role === 'consultant') {
        fetch('/api/meetings/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meetingId,
            action: 'end',
            userId,
            role
          })
        });
      }
    }, meetingDuration);
  }, [meetingId, searchParams]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p>Joining meeting...</p>
      </div>
    );
  }

  if (!searchParams.get('userId')) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-300">You don't have permission to join this meeting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black flex flex-col">
      {/* Mobile-optimized header */}
      <div className="bg-gray-800 text-white px-2 md:px-4 py-2 flex justify-between items-center">
        <div className="flex-1 min-w-0">
          <span className="text-xs md:text-sm font-medium block truncate">ConsultBridge Meeting</span>
          <span className="text-xs text-gray-300 block md:inline md:ml-2">Room: {meetingId.split('-').pop()}</span>
        </div>
        <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
          <span className={`px-1 md:px-2 py-1 rounded text-xs ${
            userRole === 'consultant' ? 'bg-green-600' : 'bg-blue-600'
          }`}>
            {userRole === 'consultant' ? 'Host' : 'User'}
          </span>
          <span className="text-xs md:text-sm truncate max-w-20 md:max-w-none">{userName}</span>
        </div>
      </div>
      
      {/* Mobile-optimized meeting frame */}
      <div className="flex-1 relative">
        <iframe
          src={meetingUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          allowFullScreen
          title="ConsultBridge Meeting"
          className="border-0"
          style={{ minHeight: '400px' }}
        />
        
        {/* Mobile meeting controls overlay */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 md:hidden">
          <div className="bg-black bg-opacity-50 rounded-full px-4 py-2">
            <span className="text-white text-xs">Tap screen for controls</span>
          </div>
        </div>
      </div>
    </div>
  );
}