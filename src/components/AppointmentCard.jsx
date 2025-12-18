'use client';
import AppointmentMeeting from './AppointmentMeeting';

export default function AppointmentCard({ appointment, userRole, currentUser }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {userRole === 'consultant' ? appointment.clientName : appointment.consultancyName}
          </h3>
          <p className="text-sm text-gray-600">{formatDate(appointment.dateTime)}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-700 mb-2">
          <strong>Type:</strong> {appointment.meetingType}
        </p>
        <p className="text-sm text-gray-700 mb-2">
          <strong>Duration:</strong> {appointment.duration} minutes
        </p>
        {appointment.notes && (
          <p className="text-sm text-gray-700">
            <strong>Notes:</strong> {appointment.notes}
          </p>
        )}
      </div>

      {appointment.status === 'confirmed' && appointment.meetingType === 'online' && (
        <AppointmentMeeting 
          appointment={appointment}
          userRole={userRole}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}