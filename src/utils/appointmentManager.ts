// Database-driven Appointment Management

export interface AppointmentData {
  _id: string;
  consultancyId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  message?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

class AppointmentManager {
  // Get appointments for a specific user
  async getUserAppointments(userId: string): Promise<AppointmentData[]> {
    try {
      const response = await fetch(`/api/appointments?clientId=${userId}`);
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      return [];
    }
  }

  // Get appointments for a specific consultancy
  async getConsultancyAppointments(consultancyId: string): Promise<AppointmentData[]> {
    try {
      const response = await fetch(`/api/appointments?consultancyId=${consultancyId}`);
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error fetching consultancy appointments:', error);
      return [];
    }
  }

  // Book a new appointment
  async bookAppointment(appointmentData: Omit<AppointmentData, '_id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<AppointmentData | null> {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error booking appointment:', error);
      return null;
    }
  }

  // Update appointment status
  async updateAppointmentStatus(appointmentId: string, status: AppointmentData['status']): Promise<boolean> {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return false;
    }
  }

  // Cancel appointment
  async cancelAppointment(appointmentId: string): Promise<boolean> {
    return this.updateAppointmentStatus(appointmentId, 'cancelled');
  }

  // Delete appointment
  async deleteAppointment(appointmentId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return false;
    }
  }
}

export const appointmentManager = new AppointmentManager();