import { BookingService } from './bookingService';

export class SmartBookingOrchestrator {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  // Detect booking intent and extract consultancy
  async detectBookingIntent(message: string, consultancies: any[] = []): Promise<{
    isBooking: boolean;
    consultancy?: any;
    confidence: number;
    extractedName?: string;
  }> {
    const lowerMessage = message.toLowerCase();
    console.log('🔍 Booking Intent Detection:', { message, lowerMessage });
    
    // Direct booking keywords
    const bookingKeywords = ['book', 'appointment', 'schedule', 'reserve', 'meeting'];
    const hasBookingKeyword = bookingKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (!hasBookingKeyword) {
      console.log('❌ No booking keyword found');
      return { isBooking: false, confidence: 0 };
    }

    // Try to extract consultancy name from message
    const extractedName = this.extractConsultancyName(message);
    console.log('📝 Extracted name:', extractedName);
    
    if (extractedName) {
      // Fuzzy match with database
      const matchedConsultancy = await this.fuzzyMatchConsultancy(extractedName);
      console.log('🎯 Fuzzy match result:', matchedConsultancy);
      
      if (matchedConsultancy) {
        return {
          isBooking: true,
          consultancy: matchedConsultancy.consultancy,
          confidence: matchedConsultancy.confidence,
          extractedName
        };
      }
    }

    // If from consultancy suggestions context
    if (consultancies.length > 0) {
      return {
        isBooking: true,
        confidence: 0.9
      };
    }

    console.log('⚠️ Booking detected but no consultancy matched');
    return { isBooking: true, confidence: 0.7 };
  }

  // Extract consultancy name from natural language
  private extractConsultancyName(message: string): string | null {
    const patterns = [
      /book\s+(.+?)(?:\s+consultancy|\s+consultant|\s+appointment|$)/i,
      /appointment\s+with\s+(.+?)(?:\s+consultancy|\s+consultant|$)/i,
      /schedule\s+(.+?)(?:\s+consultancy|\s+consultant|$)/i,
      /(?:book|appointment|schedule)\s+(.+)/i
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        let extracted = match[1].trim();
        // Remove common suffixes that might interfere
        extracted = extracted.replace(/\s+(consultancy|consultant|consulting)$/i, '');
        return extracted;
      }
    }

    return null;
  }

  // Fuzzy match consultancy name with database
  private async fuzzyMatchConsultancy(name: string): Promise<{
    consultancy: any;
    confidence: number;
  } | null> {
    try {
      console.log('🔍 Starting fuzzy match for:', name);
      // Get all consultancies from database
      const response = await fetch('/api/consultancies');
      const data = await response.json();
      const consultancies = data.consultancies || [];
      console.log('📊 Found consultancies:', consultancies.length);

      let bestMatch = null;
      let bestScore = 0;
      const normalizedInput = this.normalizeConsultancyName(name.toLowerCase());
      console.log('🔄 Normalized input:', normalizedInput);

      for (const consultancy of consultancies) {
        const normalizedConsultancy = this.normalizeConsultancyName(consultancy.name.toLowerCase());
        const score = this.calculateSimilarity(normalizedInput, normalizedConsultancy);
        
        console.log(`🔍 Comparing "${normalizedInput}" vs "${normalizedConsultancy}" (${consultancy.name}): ${score.toFixed(3)}`);
        
        if (score > bestScore && score > 0.5) { // 50% similarity threshold
          bestScore = score;
          bestMatch = consultancy;
          console.log(`✅ New best match: ${consultancy.name} (${score.toFixed(3)})`);
        }
      }

      console.log('🏆 Final result:', bestMatch ? `${bestMatch.name} (${bestScore.toFixed(3)})` : 'No match');
      return bestMatch ? { consultancy: bestMatch, confidence: bestScore } : null;
    } catch (error) {
      console.error('Error fuzzy matching consultancy:', error);
      return null;
    }
  }

  // Normalize consultancy names for better matching
  private normalizeConsultancyName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '') // Remove spaces
      .replace(/[^a-z0-9]/g, '') // Remove special characters
      .replace(/(consultancy|consultant|consulting|llp|ltd|pvt|private|limited)$/i, ''); // Remove common suffixes
  }

  // Calculate string similarity (Levenshtein distance based)
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}