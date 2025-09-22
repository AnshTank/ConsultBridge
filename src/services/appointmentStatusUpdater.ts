import connectDB from '../lib/mongodb';
import mongoose from 'mongoose';

export class AppointmentStatusUpdater {
  static async updateExpiredAppointments(): Promise<void> {
    try {
      await connectDB();
      
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not established');
      }
      
      const appointmentsCollection = db.collection('appointments');
      const now = new Date();
      
      // Update all appointments that are past their date and not already expired/completed
      await appointmentsCollection.updateMany(
        {
          appointmentDate: { $lt: now },
          status: { $in: ['pending', 'confirmed'] }
        },
        {
          $set: { 
            status: 'expired',
            updatedAt: now
          }
        }
      );
      
    } catch (error) {
      console.error('Error updating expired appointments:', error);
    }
  }
}