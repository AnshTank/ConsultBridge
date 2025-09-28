import connectDB from '../lib/mongodb';
import Appointment from '../models/Appointment';
import Consultancy from '../models/Consultancy';
import { clerkClient } from '@clerk/nextjs/server';

export interface BookingRequest {
  consultancyId: string;
  userId: string;
  date: string;
  time: string;
  duration?: number;
  type: 'online' | 'offline';
  notes?: string;
}

export interface BookingValidation {
  isValid: boolean;
  conflicts?: string[];
  suggestions?: string[];
  availableSlots?: string[];
}

export class BookingService {
  async validateBooking(request: BookingRequest): Promise<BookingValidation> {
    try {
      await connectDB();
      
      const conflicts = [];
      const suggestions = [];
      
      // Check if consultancy exists and is available
      const consultancy = await Consultancy.findById(request.consultancyId);
      if (!consultancy) {
        return { isValid: false, conflicts: ['Consultancy not found'] };
      }

      // Check for time conflicts
      const existingBookings = await Appointment.find({
        consultancyId: request.consultancyId,
        date: request.date,
        status: { $in: ['pending', 'confirmed'] }
      });

      const requestTime = this.parseTime(request.time);
      const duration = request.duration || 60; // default 1 hour

      for (const booking of existingBookings) {
        const bookingTime = this.parseTime(booking.appointmentTime || '');
        const bookingDuration = (booking as any).duration || 60;
        
        if (this.hasTimeConflict(requestTime, duration, bookingTime, bookingDuration)) {
          conflicts.push(`Time slot ${request.time} is already booked`);
          
          // Suggest alternative times
          const alternatives = this.suggestAlternativeTimes(request.date, existingBookings);
          suggestions.push(...alternatives);
        }
      }

      // Check consultancy availability (if they have set working hours)
      if (consultancy.availability) {
        const dayOfWeek = new Date(request.date).getDay();
        const workingHours = (consultancy.availability as any)[dayOfWeek];
        
        if (!workingHours || !this.isWithinWorkingHours(requestTime, workingHours)) {
          conflicts.push('Requested time is outside consultancy working hours');
          suggestions.push('Please choose a time during working hours');
        }
      }

      // Check user's existing bookings for conflicts
      const userBookings = await Appointment.find({
        userId: request.userId,
        date: request.date,
        status: { $in: ['pending', 'confirmed'] }
      });

      for (const booking of userBookings) {
        const bookingTime = this.parseTime(booking.appointmentTime || '');
        const bookingDuration = (booking as any).duration || 60;
        
        if (this.hasTimeConflict(requestTime, duration, bookingTime, bookingDuration)) {
          conflicts.push('You already have an appointment at this time');
        }
      }

      return {
        isValid: conflicts.length === 0,
        conflicts: conflicts.length > 0 ? conflicts : undefined,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        availableSlots: conflicts.length > 0 ? this.getAvailableSlots(request.date, existingBookings) : undefined
      };

    } catch (error) {
      console.error('Booking validation error:', error);
      return { isValid: false, conflicts: ['Validation failed'] };
    }
  }

  async createBooking(request: BookingRequest): Promise<{ success: boolean; appointment?: any; message: string }> {
    try {
      // Validate first
      const validation = await this.validateBooking(request);
      
      if (!validation.isValid) {
        return {
          success: false,
          message: `Booking failed: ${validation.conflicts?.join(', ')}. ${validation.suggestions?.join(' ')}`
        };
      }

      await connectDB();

      // Get user data from Clerk
      const user = await clerkClient.users.getUser(request.userId);
      const consultancy = await Consultancy.findById(request.consultancyId);

      // Create appointment with Clerk user data
      const appointment = new Appointment({
        consultancyId: request.consultancyId,
        clientId: request.userId,
        clientName: (user as any).fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
        clientEmail: user.emailAddresses[0]?.emailAddress || 'No email provided',
        clientPhone: user.phoneNumbers[0]?.phoneNumber || 'No phone provided',
        appointmentDate: new Date(request.date),
        appointmentTime: request.time,
        appointmentType: request.type,
        message: request.notes,
        consultancyName: consultancy?.name || 'Unknown Consultancy',
        status: 'pending'
      });

      await appointment.save();

      return {
        success: true,
        appointment,
        message: `Great! I've successfully booked your ${request.type} appointment with ${consultancy?.name} on ${request.date} at ${request.time}. Your booking ID is ${appointment._id}.`
      };

    } catch (error) {
      console.error('Booking creation error:', error);
      return {
        success: false,
        message: 'Failed to create booking. Please try again.'
      };
    }
  }

  private parseTime(timeStr: string): number {
    // Convert time string (e.g., "14:30") to minutes since midnight
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  }

  private hasTimeConflict(time1: number, duration1: number, time2: number, duration2: number): boolean {
    const end1 = time1 + duration1;
    const end2 = time2 + duration2;
    
    return (time1 < end2) && (time2 < end1);
  }

  private suggestAlternativeTimes(date: string, existingBookings: any[]): string[] {
    const suggestions = [];
    const workingHours = { start: 9 * 60, end: 17 * 60 }; // 9 AM to 5 PM
    
    // Find free slots
    const busySlots = existingBookings.map(booking => ({
      start: this.parseTime(booking.appointmentTime || ''),
      end: this.parseTime(booking.appointmentTime || '') + ((booking as any).duration || 60)
    })).sort((a, b) => a.start - b.start);

    let currentTime = workingHours.start;
    
    for (const slot of busySlots) {
      if (currentTime + 60 <= slot.start) {
        suggestions.push(this.formatTime(currentTime));
        if (suggestions.length >= 3) break;
      }
      currentTime = Math.max(currentTime, slot.end);
    }

    // Add slots after last booking
    while (currentTime + 60 <= workingHours.end && suggestions.length < 3) {
      suggestions.push(this.formatTime(currentTime));
      currentTime += 60;
    }

    return suggestions.map(time => `Available at ${time}`);
  }

  private getAvailableSlots(date: string, existingBookings: any[]): string[] {
    const slots = [];
    const workingHours = { start: 9 * 60, end: 17 * 60 };
    
    for (let time = workingHours.start; time < workingHours.end; time += 60) {
      const hasConflict = existingBookings.some(booking => {
        const bookingTime = this.parseTime(booking.appointmentTime || '');
        const bookingDuration = (booking as any).duration || 60;
        return this.hasTimeConflict(time, 60, bookingTime, bookingDuration);
      });
      
      if (!hasConflict) {
        slots.push(this.formatTime(time));
      }
    }
    
    return slots;
  }

  private isWithinWorkingHours(time: number, workingHours: any): boolean {
    if (!workingHours || !workingHours.start || !workingHours.end) return true;
    
    const start = this.parseTime(workingHours.start);
    const end = this.parseTime(workingHours.end);
    
    return time >= start && time <= end;
  }

  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}