import connectDB from "../lib/mongodb";
import Consultancy from "../models/Consultancy";

export class RecommendationEngine {
  async searchConsultancies(params: {
    category?: string;
    budget?: number;
    location?: string;
    availability?: string;
    query?: string;
    experience?: number;
    rating?: number;
    mode?: 'online' | 'offline';
  }): Promise<any[]> {
    try {
      await connectDB();

      const filter: any = { status: "verified" };
      let sortCriteria: any = {};

      // Enhanced category matching with variations
      if (params.category) {
        const categoryVariations = this.getCategoryVariations(params.category);
        filter.$or = categoryVariations.map(cat => ({
          category: { $regex: cat, $options: 'i' }
        }));
      }

      // Flexible budget filter with 10% tolerance
      if (params.budget) {
        const budgetTolerance = params.budget * 1.1;
        if (!filter.$and) filter.$and = [];
        filter.$and.push({
          $or: [
            { "pricing.hourlyRate": { $lte: budgetTolerance } },
            { "pricing.projectRate": { $lte: budgetTolerance } },
            { "pricing.hourlyRate": { $exists: false } }
          ]
        });
      }

      // Enhanced location matching
      if (params.location) {
        if (!filter.$and) filter.$and = [];
        filter.$and.push({
          $or: [
            { location: { $regex: params.location, $options: "i" } },
            { serviceAreas: { $regex: params.location, $options: "i" } },
            { "address.city": { $regex: params.location, $options: "i" } },
            { "address.state": { $regex: params.location, $options: "i" } },
            { isRemote: true }
          ]
        });
      }

      // Experience filter
      if (params.experience) {
        filter.yearsOfExperience = { $gte: params.experience };
      }

      // Rating filter
      if (params.rating) {
        filter.rating = { $gte: params.rating };
      }

      // Consultation mode
      if (params.mode) {
        if (!filter.$and) filter.$and = [];
        if (params.mode === 'online') {
          filter.$and.push({
            $or: [{ isRemote: true }, { consultationModes: /online/i }]
          });
        } else {
          filter.$and.push({
            $or: [{ isRemote: false }, { consultationModes: /offline|in-person/i }]
          });
        }
      }

      // Enhanced text search with keyword matching
      if (params.query) {
        const searchTerms = params.query.toLowerCase().split(' ').filter(term => term.length > 2);
        if (!filter.$and) filter.$and = [];
        filter.$and.push({
          $or: [
            { name: { $regex: params.query, $options: "i" } },
            { description: { $regex: params.query, $options: "i" } },
            { services: { $regex: params.query, $options: "i" } },
            { specializations: { $in: searchTerms.map(term => new RegExp(term, 'i')) } },
            { keywords: { $in: searchTerms.map(term => new RegExp(term, 'i')) } }
          ]
        });
      }

      // Smart sorting based on search criteria
      if (params.budget) {
        sortCriteria = { rating: -1, "pricing.hourlyRate": 1, reviewCount: -1 };
      } else if (params.query) {
        sortCriteria = { rating: -1, reviewCount: -1, yearsOfExperience: -1 };
      } else {
        sortCriteria = { rating: -1, reviewCount: -1, isAvailable: -1 };
      }

      console.log('MongoDB filter:', JSON.stringify(filter, null, 2));
      
      // First, let's check if there are any consultancies at all
      const totalCount = await Consultancy.countDocuments({});
      console.log('Total consultancies in database:', totalCount);
      
      const consultancies = await Consultancy.find(filter)
        .sort(sortCriteria)
        .limit(15)
        .lean();

      console.log('Found consultancies count:', consultancies.length);
      
      // If no results, let's see what's actually in the database
      if (consultancies.length === 0) {
        const allConsultancies = await Consultancy.find({}).limit(5).lean();
        console.log('Sample consultancies in database:', allConsultancies.map(c => ({ name: c.name, category: c.category, status: c.status })));
      }
      
      // If no results with strict filter, try a simpler search
      if (consultancies.length === 0 && params.category) {
        console.log('Trying fallback search for category:', params.category);
        const fallbackFilter = { 
          status: "verified",
          category: { $regex: params.category, $options: 'i' }
        };
        const fallbackResults = await Consultancy.find(fallbackFilter)
          .sort({ rating: -1, reviews: -1 })
          .limit(10)
          .lean();
        console.log('Fallback results count:', fallbackResults.length);
        return this.rankAndScoreResults(fallbackResults, params);
      }
      
      // Post-process for relevance scoring and ranking
      return this.rankAndScoreResults(consultancies, params);
    } catch (error) {
      console.error("Search consultancies error:", error);
      console.error('Search filter used:', JSON.stringify(filter, null, 2));
      return [];
    }
  }

  private getCategoryVariations(category: string): string[] {
    const variations: { [key: string]: string[] } = {
      'legal': ['Legal Advisory', 'Legal', 'Law', 'Attorney', 'Lawyer', 'Advocate', 'Counsel'],
      'finance': ['Financial Services', 'Finance', 'Financial', 'Accounting', 'Tax', 'Investment', 'Banking'],
      'business': ['Business Strategy', 'Business', 'Strategy', 'Management', 'Consulting', 'Corporate', 'Operations'],
      'technology': ['Technology', 'Tech', 'IT', 'Software', 'Digital', 'Development', 'Programming'],
      'healthcare': ['Health & Wellness', 'Healthcare', 'Health', 'Medical', 'Wellness', 'Therapy', 'Clinical'],
      'education': ['Career Consultation', 'Education', 'Training', 'Career', 'Coaching', 'Academic', 'Learning'],
      'real estate': ['Real Estate & Housing', 'Real Estate', 'Property', 'Housing', 'Realty', 'Investment Property'],
      'marketing': ['Marketing', 'Digital Marketing', 'Advertising', 'Branding', 'Promotion'],
      'hr': ['HR', 'Human Resources', 'Recruitment', 'Talent', 'Personnel']
    };
    
    const key = category.toLowerCase();
    return variations[key] || [category, category.charAt(0).toUpperCase() + category.slice(1)];
  }

  private rankAndScoreResults(consultancies: any[], params: any): any[] {
    return consultancies.map(consultant => {
      let relevanceScore = 0;
      
      // Base score from rating and reviews
      relevanceScore += (consultant.rating || 0) * 15;
      relevanceScore += Math.min(consultant.reviewCount || 0, 50) * 0.5;
      
      // Experience bonus (up to 20 points)
      relevanceScore += Math.min(consultant.yearsOfExperience || 0, 20);
      
      // Budget compatibility bonus
      if (params.budget && consultant.pricing?.hourlyRate) {
        const budgetRatio = params.budget / consultant.pricing.hourlyRate;
        if (budgetRatio >= 1) relevanceScore += 10; // Within budget
        if (budgetRatio >= 1.3) relevanceScore += 5; // Good value
      }
      
      // Availability bonus
      if (consultant.isAvailable) relevanceScore += 12;
      
      // Response time bonus
      if (consultant.averageResponseTime) {
        if (consultant.averageResponseTime <= 1) relevanceScore += 8; // Very fast
        else if (consultant.averageResponseTime <= 4) relevanceScore += 5; // Fast
      }
      
      // Verification bonus
      if (consultant.isVerified) relevanceScore += 8;
      
      // Category exact match bonus
      if (params.category && consultant.category) {
        const categoryMatch = consultant.category.toLowerCase().includes(params.category.toLowerCase());
        if (categoryMatch) relevanceScore += 15;
      }
      
      // Query relevance bonus
      if (params.query) {
        const queryLower = params.query.toLowerCase();
        if (consultant.name?.toLowerCase().includes(queryLower)) relevanceScore += 10;
        if (consultant.description?.toLowerCase().includes(queryLower)) relevanceScore += 5;
      }
      
      return { ...consultant, relevanceScore: Math.round(relevanceScore) };
    })
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
    .slice(0, 10);
  }

  async getConsultancyById(id: string): Promise<any> {
    try {
      await connectDB();

      const consultancy = await Consultancy.findById(id);
      return consultancy;
    } catch (error) {
      console.error("Get consultancy error:", error);
      return null;
    }
  }

  async getRecommendations(userId: string, preferences: any): Promise<any[]> {
    try {
      await connectDB();

      const filter: any = { status: "verified" };

      // Enhanced preference matching
      if (preferences.preferredCategories?.length > 0) {
        const categoryRegexes = preferences.preferredCategories.flatMap((cat: string) => 
          this.getCategoryVariations(cat).map(variation => new RegExp(variation, 'i'))
        );
        filter.category = { $in: categoryRegexes };
      }

      // Budget preference
      if (preferences.maxBudget) {
        filter.$or = [
          { "pricing.hourlyRate": { $lte: preferences.maxBudget } },
          { "pricing.projectRate": { $lte: preferences.maxBudget } }
        ];
      }

      // Location preference
      if (preferences.preferredLocation) {
        filter.$or = [
          { location: { $regex: preferences.preferredLocation, $options: "i" } },
          { isRemote: true }
        ];
      }

      // Get top-rated, available consultancies
      const recommendations = await Consultancy.find(filter)
        .sort({ 
          rating: -1, 
          reviewCount: -1, 
          yearsOfExperience: -1,
          isVerified: -1
        })
        .limit(8)
        .lean();

      // Add personalization score
      return recommendations.map(consultant => ({
        ...consultant,
        personalizationScore: this.calculatePersonalizationScore(consultant, preferences)
      })).sort((a, b) => b.personalizationScore - a.personalizationScore);
    } catch (error) {
      console.error("Get recommendations error:", error);
      return [];
    }
  }

  private calculatePersonalizationScore(consultant: any, preferences: any): number {
    let score = consultant.rating * 20;
    
    // Category match bonus
    if (preferences.preferredCategories?.includes(consultant.category)) {
      score += 25;
    }
    
    // Budget compatibility
    if (preferences.maxBudget && consultant.pricing?.hourlyRate) {
      if (consultant.pricing.hourlyRate <= preferences.maxBudget) {
        score += 15;
      }
    }
    
    // Experience bonus
    score += Math.min(consultant.yearsOfExperience || 0, 15);
    
    // Availability bonus
    if (consultant.isAvailable) score += 10;
    
    return score;
  }

  async getSimilarConsultancies(consultancyId: string): Promise<any[]> {
    try {
      await connectDB();

      const consultancy = await Consultancy.findById(consultancyId);
      if (!consultancy) return [];

      const similar = await Consultancy.find({
        _id: { $ne: consultancyId },
        category: consultancy.category,
        status: "verified",
      })
        .sort({ rating: -1 })
        .limit(3);

      return similar;
    } catch (error) {
      console.error("Get similar consultancies error:", error);
      return [];
    }
  }

  async filterByAvailability(
    consultancies: any[],
    timeSlot?: string
  ): Promise<any[]> {
    // This would integrate with your calendar/availability system
    // For now, return all consultancies
    return consultancies.filter((c) => c.isAvailable !== false);
  }
}
