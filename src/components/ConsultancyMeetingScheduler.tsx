'use client';
import { useState, useEffect } from 'react';
import { Video, Calendar, Clock, User } from 'lucide-react';

interface Appointment {
  _id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType?: "online" | "offline";
  status: "confirmed" | "pending" | "completed" | "cancelled" | "expired";
  message?: string;
  consultancyId: string;
  userId: string;
  meetingId?: string;
  consultancyName?: string;
}

interface Props {
  consultancyId: string | null;
  appointments: Appointment[];
}

export default function ConsultancyMeetingScheduler({ consultancyId, appointments = [] }: Props) {
  const [upcomingMeetings, setUpcomingMeetings] = useState<Appointment[]>([]);

  useEffect(() => {
    // Show all confirmed online appointments
    const now = new Date();
    
    const meetings = appointments.filter(apt => {
      if (apt.status !== 'confirmed' || apt.appointmentType !== 'online') return false;
      
      // Parse appointment date and time
      const aptDate = new Date(apt.appointmentDate);
      const [time, period] = apt.appointmentTime.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) hour24 += 12;
      if (period === 'AM' && hours === 12) hour24 = 0;
      aptDate.setHours(hour24, minutes || 0, 0, 0);
      
      // Show if appointment is in the future
      return aptDate > now;
    });
    
    setUpcomingMeetings(meetings);
  }, [appointments]);

  const createMeeting = async (appointmentId: string) => {
    try {
      const response = await fetch('/api/meetings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: consultancyId,
          consultancyId,
          appointmentId,
          createdBy: 'consultant'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Refresh page to show updated meeting data
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to create meeting:', error);
    }
  };

  const joinMeeting = (meetingId: string, consultancyName: string) => {
    const url = `/meeting/${meetingId}?role=consultant&name=${encodeURIComponent(consultancyName)}&userId=${consultancyId}&duration=60&moderator=true`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Video className="w-5 h-5 text-green-500" />
        Video Meetings (Host)
      </h3>

      <div>
        <h4 className="font-medium mb-3">Available Meetings</h4>
        
        {upcomingMeetings.length === 0 ? (
          <div className="text-center py-6">
            <Video className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No meetings available</p>
            <p className="text-gray-400 text-xs mt-1">Confirmed online appointments appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingMeetings.map(appointment => (
              <div key={appointment._id} className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-medium">{appointment.clientName}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {appointment.message || 'Consultation'}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    Host
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {appointment.appointmentTime}
                  </span>
                </div>
                
                {appointment.meetingId ? (
                  <div>
                    <p className="text-xs text-green-600 mb-2">Meeting ID: {appointment.meetingId}</p>
                    <button
                      onClick={() => appointment.meetingId && joinMeeting(appointment.meetingId, appointment.consultancyName || 'Consultant')}
                      className="w-full bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 text-sm flex items-center justify-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Join Meeting (Host)
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => createMeeting(appointment._id)}
                    className="w-full bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 text-sm flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    Start Meeting
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}