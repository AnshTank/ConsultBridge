import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  consultancyId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  appointmentDate: Date;
  appointmentTime: string;
  appointmentType: 'online' | 'offline';
  message?: string;
  consultancyName: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  consultancyId: { type: String, required: true },
  clientId: { type: String, required: true },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientPhone: { type: String, required: true },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true },
  appointmentType: { 
    type: String, 
    enum: ['online', 'offline'],
    required: true,
    default: 'online'
  },
  message: { type: String },
  consultancyName: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'expired'],
    default: 'pending'
  }
}, {
  timestamps: true,
  strict: true,
  strictQuery: false
});

// Clear any existing model to ensure fresh schema
if (mongoose.models.Appointment) {
  delete mongoose.models.Appointment;
}

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);