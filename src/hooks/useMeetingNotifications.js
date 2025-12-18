'use client';
import { useEffect } from 'react';
import { useNotifications } from '../components/NotificationProvider';

export default function useMeetingNotifications(userId, userRole) {
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!userId) return;

    // Listen for meeting events
    const handleMeetingStart = (event) => {
      addNotification({
        type: 'meeting_started',
        title: 'Meeting Started',
        message: userRole === 'consultant' 
          ? 'Your client is waiting to join the meeting'
          : 'The consultant has started the meeting',
        color: 'green',
        persistent: true
      });
    };

    const handleMeetingEnd = (event) => {
      addNotification({
        type: 'meeting_ended',
        title: 'Meeting Ended',
        message: 'The meeting has been completed',
        color: 'blue'
      });
    };

    const handleAppointmentReminder = (event) => {
      addNotification({
        type: 'appointment_reminder',
        title: 'Appointment Reminder',
        message: `Your appointment is in ${event.detail.minutes} minutes`,
        color: 'yellow',
        persistent: true
      });
    };

    // Add event listeners
    window.addEventListener('meeting:started', handleMeetingStart);
    window.addEventListener('meeting:ended', handleMeetingEnd);
    window.addEventListener('appointment:reminder', handleAppointmentReminder);

    return () => {
      window.removeEventListener('meeting:started', handleMeetingStart);
      window.removeEventListener('meeting:ended', handleMeetingEnd);
      window.removeEventListener('appointment:reminder', handleAppointmentReminder);
    };
  }, [userId, userRole, addNotification]);

  // Trigger meeting notifications
  const triggerMeetingStart = (meetingId) => {
    window.dispatchEvent(new CustomEvent('meeting:started', { 
      detail: { meetingId } 
    }));
  };

  const triggerMeetingEnd = (meetingId, duration) => {
    window.dispatchEvent(new CustomEvent('meeting:ended', { 
      detail: { meetingId, duration } 
    }));
  };

  const triggerAppointmentReminder = (appointmentId, minutes) => {
    window.dispatchEvent(new CustomEvent('appointment:reminder', { 
      detail: { appointmentId, minutes } 
    }));
  };

  return {
    triggerMeetingStart,
    triggerMeetingEnd,
    triggerAppointmentReminder
  };
}