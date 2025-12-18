'use client';
import { useState, useEffect } from 'react';
import { Video, Calendar, Clock, User } from 'lucide-react';
import { AppointmentData } from '../utils/appointmentManager';

interface Props {
  userId: string | undefined;
  appointments: AppointmentData[];
}

export default function MeetingScheduler({ userId, appointments = [] }: Props) {
  const [upcomingMeetings, setUpcomingMeetings] = useState<AppointmentData[]>([]);

  useEffect(() => {
    // Show confirmed online appointments that have meetingId and haven't ended
    const meetings = appointments.filter(apt => {
      if (apt.status !== 'confirmed' || (apt as any).appointmentType !== 'online' || !(apt as any).meetingId) {
        return false;
      }
      
      // Check if meeting has ended (1 hour after scheduled time)
      const now = new Date();
      const aptDate = new Date(apt.appointmentDate);
      const aptTime = apt.appointmentTime;
      const [time, period] = (aptTime || "").split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      let hour24 = hours;
      if (period === "PM" && hours !== 12) hour24 += 12;
      if (period === "AM" && hours === 12) hour24 = 0;
      aptDate.setHours(hour24, minutes || 0);
      
      const meetingEndTime = new Date(aptDate.getTime() + 60 * 60 * 1000); // 1 hour after
      return now < meetingEndTime; // Only show if meeting hasn't ended
    });
    
    setUpcomingMeetings(meetings);
  }, [appointments]);

  const joinMeeting = (meetingId: string, userName: string) => {
    const url = `/meeting/${meetingId}?role=client&name=${encodeURIComponent(userName)}&userId=${userId}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Video className="w-5 h-5 text-blue-500" />
        Video Meetings
      </h3>

      {/* Upcoming Meetings (24hrs) */}
      <div>
        <h4 className="font-medium mb-3">Available Meetings</h4>
        
        {upcomingMeetings.length === 0 ? (
          <div className="text-center py-6">
            <Video className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No meetings available</p>
            <p className="text-gray-400 text-xs mt-1">Meetings appear when consultant schedules them</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingMeetings.map(appointment => (
              <div key={appointment._id} className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-medium">{(appointment as any).consultancyName}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {appointment.message || 'Consultation'}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    Ready
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
                
                {(() => {
                  const now = new Date();
                  const aptDate = new Date(appointment.appointmentDate);
                  const aptTime = appointment.appointmentTime;
                  const [time, period] = (aptTime || "").split(" ");
                  const [hours, minutes] = time.split(":").map(Number);
                  let hour24 = hours;
                  if (period === "PM" && hours !== 12) hour24 += 12;
                  if (period === "AM" && hours === 12) hour24 = 0;
                  aptDate.setHours(hour24, minutes || 0);
                  
                  const joinTime = new Date(aptDate.getTime() - 10 * 60 * 1000);
                  const canJoin = now >= joinTime && now <= aptDate;
                  
                  if ((appointment as any).meetingId && canJoin) {
                    return (
                      <button
                        onClick={() => joinMeeting((appointment as any).meetingId, appointment.clientName || 'User')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Join Meeting
                      </button>
                    );
                  } else if ((appointment as any).meetingId) {
                    return (
                      <div className="text-sm text-gray-500">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Available at {joinTime.toLocaleTimeString()}
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-sm text-gray-500">
                        <Video className="w-4 h-4 inline mr-1" />
                        Waiting for consultant to start meeting
                      </div>
                    );
                  }
                })()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}