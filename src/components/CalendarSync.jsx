'use client';
import { useState } from 'react';
import { Calendar, Download, ExternalLink, Apple, AlertCircle } from 'lucide-react';

export default function CalendarSync({ appointment }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateICSFile = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const startDate = new Date(`${appointment.appointmentDate} ${appointment.appointmentTime}`);
      const endDate = new Date(startDate.getTime() + (appointment.duration || 60) * 60 * 1000);
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ConsultBridge//Meeting//EN
BEGIN:VEVENT
UID:${appointment._id}@consultbridge.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:ConsultBridge Meeting - ${appointment.consultancyName || appointment.clientName}
DESCRIPTION:${appointment.message || 'Consultation meeting'}${appointment.meetingId ? `\\n\\nJoin Meeting: ${window.location.origin}/meeting/${appointment.meetingId}` : ''}
LOCATION:${appointment.appointmentType === 'online' ? 'Online Meeting' : 'Office Visit'}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Meeting reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `consultbridge-meeting-${appointment._id}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to generate calendar file');
      console.error('Calendar generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateGoogleCalendarLink = () => {
    const startDate = new Date(`${appointment.appointmentDate} ${appointment.appointmentTime}`);
    const endDate = new Date(startDate.getTime() + (appointment.duration || 60) * 60 * 1000);
    
    const formatGoogleDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `ConsultBridge Meeting - ${appointment.consultancyName || appointment.clientName}`,
      dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
      details: `${appointment.message || 'Consultation meeting'}${appointment.meetingId ? `\n\nJoin Meeting: ${window.location.origin}/meeting/${appointment.meetingId}` : ''}`,
      location: appointment.appointmentType === 'online' ? 'Online Meeting' : 'Office Visit'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const generateOutlookLink = () => {
    const startDate = new Date(`${appointment.appointmentDate} ${appointment.appointmentTime}`);
    const endDate = new Date(startDate.getTime() + (appointment.duration || 60) * 60 * 1000);
    
    const params = new URLSearchParams({
      subject: `ConsultBridge Meeting - ${appointment.consultancyName || appointment.clientName}`,
      startdt: startDate.toISOString(),
      enddt: endDate.toISOString(),
      body: `${appointment.message || 'Consultation meeting'}${appointment.meetingId ? `\n\nJoin Meeting: ${window.location.origin}/meeting/${appointment.meetingId}` : ''}`,
      location: appointment.appointmentType === 'online' ? 'Online Meeting' : 'Office Visit'
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  };

  const generateAppleCalendarLink = () => {
    const startDate = new Date(`${appointment.appointmentDate} ${appointment.appointmentTime}`);
    const endDate = new Date(startDate.getTime() + (appointment.duration || 60) * 60 * 1000);
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `ConsultBridge Meeting - ${appointment.consultancyName || appointment.clientName}`,
      dates: `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      details: `${appointment.message || 'Consultation meeting'}${appointment.meetingId ? `\n\nJoin Meeting: ${window.location.origin}/meeting/${appointment.meetingId}` : ''}`,
      location: appointment.appointmentType === 'online' ? 'Online Meeting' : 'Office Visit'
    });

    return `webcal://calendar.google.com/calendar/ical?${params.toString()}`;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        Add to Calendar
      </h4>
      
      {error && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <button
          onClick={() => window.open(generateGoogleCalendarLink(), '_blank')}
          className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm"
        >
          <span>Google Calendar</span>
          <ExternalLink className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => window.open(generateOutlookLink(), '_blank')}
          className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm"
        >
          <span>Outlook Calendar</span>
          <ExternalLink className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => window.open(generateAppleCalendarLink(), '_blank')}
          className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm"
        >
          <span>Apple Calendar</span>
          <Apple className="w-4 h-4" />
        </button>
        
        <button
          onClick={generateICSFile}
          disabled={isGenerating}
          className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm disabled:opacity-50"
        >
          <span>{isGenerating ? 'Generating...' : 'Download .ics file'}</span>
          <Download className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}