export class BookingValidator {
  
  // Validate and get available slots for a consultancy
  async getAvailableSlots(consultancyId: string, selectedDate?: string): Promise<{
    availableDates: string[];
    availableSlots: { [date: string]: string[] };
    consultancySchedule: any;
  }> {
    try {
      // Get consultancy details and schedule
      const consultancyResponse = await fetch(`/api/consultancies/${consultancyId}`);
      const consultancyData = await consultancyResponse.json();
      const consultancy = consultancyData.consultancy;

      // Default schedule if not specified
      const schedule = consultancy.availability || {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        hours: { start: '09:00', end: '17:00' }
      };

      // Get existing bookings
      const bookingsResponse = await fetch(`/api/bookings/consultancy/${consultancyId}`);
      const bookingsData = await bookingsResponse.json();
      const existingBookings = bookingsData.bookings || [];

      // Generate available dates (next 30 days)
      const availableDates = this.generateAvailableDates(schedule.days);
      
      // Generate available slots for each date
      const availableSlots: { [date: string]: string[] } = {};
      
      for (const date of availableDates) {
        if (selectedDate && date !== selectedDate) continue;
        
        const slots = this.generateTimeSlots(schedule.hours, date);
        const availableSlots_date = this.filterBookedSlots(slots, existingBookings, date);
        
        if (availableSlots_date.length > 0) {
          availableSlots[date] = availableSlots_date;
        }
      }

      return {
        availableDates: Object.keys(availableSlots),
        availableSlots,
        consultancySchedule: schedule
      };
    } catch (error) {
      console.error('Error getting available slots:', error);
      return {
        availableDates: [],
        availableSlots: {},
        consultancySchedule: null
      };
    }
  }

  // Generate available dates based on consultancy schedule
  private generateAvailableDates(workingDays: string[]): string[] {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) { // Next 14 days, starting tomorrow
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      if (workingDays.includes(dayName)) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    return dates.slice(0, 7); // Return max 7 dates
  }

  // Generate time slots for a specific date
  private generateTimeSlots(hours: { start: string; end: string }, date: string): string[] {
    const slots = [];
    const [startHour, startMin] = hours.start.split(':').map(Number);
    const [endHour, endMin] = hours.end.split(':').map(Number);
    
    // Generate hourly slots
    for (let hour = startHour; hour < endHour; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(timeStr);
      
      // Add 30-minute slot if there's time
      if (hour + 0.5 < endHour) {
        const halfHourStr = `${hour.toString().padStart(2, '0')}:30`;
        slots.push(halfHourStr);
      }
    }
    
    return slots;
  }

  // Filter out already booked slots
  private filterBookedSlots(slots: string[], existingBookings: any[], date: string): string[] {
    const bookedSlots = existingBookings
      .filter(booking => booking.date === date && booking.status !== 'cancelled')
      .map(booking => booking.time);
    
    return slots.filter(slot => !bookedSlots.includes(slot));
  }

  // Validate booking request
  async validateBooking(bookingData: {
    consultancyId: string;
    date: string;
    time: string;
    userId: string;
  }): Promise<{
    isValid: boolean;
    conflicts: any[];
    message: string;
  }> {
    try {
      // Check if slot is available
      const { availableSlots } = await this.getAvailableSlots(bookingData.consultancyId, bookingData.date);
      
      const dateSlots = availableSlots[bookingData.date] || [];
      
      if (!dateSlots.includes(bookingData.time)) {
        return {
          isValid: false,
          conflicts: [],
          message: 'Selected time slot is not available. Please choose another time.'
        };
      }

      // Check for user conflicts (double booking)
      const userBookingsResponse = await fetch(`/api/bookings/user/${bookingData.userId}`);
      const userBookingsData = await userBookingsResponse.json();
      const userBookings = userBookingsData.bookings || [];

      const userConflicts = userBookings.filter((booking: any) => 
        booking.date === bookingData.date && 
        booking.time === bookingData.time && 
        booking.status !== 'cancelled'
      );

      if (userConflicts.length > 0) {
        return {
          isValid: false,
          conflicts: userConflicts,
          message: 'You already have a booking at this time. Please choose a different slot.'
        };
      }

      return {
        isValid: true,
        conflicts: [],
        message: 'Booking slot is available!'
      };
    } catch (error) {
      console.error('Error validating booking:', error);
      return {
        isValid: false,
        conflicts: [],
        message: 'Error validating booking. Please try again.'
      };
    }
  }

  // Suggest alternative slots if conflict
  async suggestAlternatives(consultancyId: string, preferredDate: string, preferredTime: string): Promise<{
    sameDayAlternatives: string[];
    nextDayAlternatives: { date: string; slots: string[] }[];
  }> {
    try {
      const { availableSlots } = await this.getAvailableSlots(consultancyId);
      
      // Same day alternatives
      const sameDaySlots = availableSlots[preferredDate] || [];
      const sameDayAlternatives = sameDaySlots.filter(slot => slot !== preferredTime).slice(0, 3);
      
      // Next few days alternatives
      const nextDayAlternatives = [];
      const dates = Object.keys(availableSlots).sort();
      
      for (const date of dates) {
        if (date > preferredDate && nextDayAlternatives.length < 3) {
          const slots = availableSlots[date].slice(0, 3);
          if (slots.length > 0) {
            nextDayAlternatives.push({ date, slots });
          }
        }
      }
      
      return { sameDayAlternatives, nextDayAlternatives };
    } catch (error) {
      console.error('Error suggesting alternatives:', error);
      return { sameDayAlternatives: [], nextDayAlternatives: [] };
    }
  }
}