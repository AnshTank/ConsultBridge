interface TestCase {
  id: string;
  input: string;
  expectedIntent: string;
  expectedCategories: string[];
  expectedConfidence: number;
  context?: any;
  description: string;
}

interface ValidationResult {
  testId: string;
  passed: boolean;
  actualIntent: string;
  expectedIntent: string;
  actualCategories: string[];
  expectedCategories: string[];
  actualConfidence: number;
  expectedConfidence: number;
  score: number;
  issues: string[];
}

export class AccuracyValidator {
  private testCases: TestCase[] = [
    // Greeting tests
    {
      id: 'greeting_1',
      input: 'Hi there',
      expectedIntent: 'greeting',
      expectedCategories: [],
      expectedConfidence: 0.9,
      description: 'Simple greeting'
    },
    {
      id: 'greeting_2',
      input: 'Good morning, I need help',
      expectedIntent: 'greeting',
      expectedCategories: [],
      expectedConfidence: 0.8,
      description: 'Greeting with help request'
    },
    
    // Search tests
    {
      id: 'search_legal_1',
      input: 'I need a lawyer for contract review',
      expectedIntent: 'search',
      expectedCategories: ['legal'],
      expectedConfidence: 0.85,
      description: 'Legal consultation request'
    },
    {
      id: 'search_business_1',
      input: 'Looking for business strategy consultant',
      expectedIntent: 'search',
      expectedCategories: ['business'],
      expectedConfidence: 0.9,
      description: 'Business consultation request'
    },
    {
      id: 'search_finance_1',
      input: 'Need financial planning advice',
      expectedIntent: 'search',
      expectedCategories: ['finance'],
      expectedConfidence: 0.85,
      description: 'Financial consultation request'
    },
    {
      id: 'search_tech_1',
      input: 'I need help with software development',
      expectedIntent: 'search',
      expectedCategories: ['technology'],
      expectedConfidence: 0.85,
      description: 'Technology consultation request'
    },
    {
      id: 'search_healthcare_1',
      input: 'Looking for medical consultation',
      expectedIntent: 'search',
      expectedCategories: ['healthcare'],
      expectedConfidence: 0.85,
      description: 'Healthcare consultation request'
    },
    
    // Booking tests
    {
      id: 'booking_1',
      input: 'I want to book an appointment',
      expectedIntent: 'book',
      expectedCategories: [],
      expectedConfidence: 0.9,
      description: 'Direct booking request'
    },
    {
      id: 'booking_2',
      input: 'Can I schedule a meeting with the first consultant?',
      expectedIntent: 'book',
      expectedCategories: [],
      expectedConfidence: 0.85,
      description: 'Contextual booking request'
    },
    
    // Information tests
    {
      id: 'info_1',
      input: 'What is ConsultBridge?',
      expectedIntent: 'info',
      expectedCategories: [],
      expectedConfidence: 0.9,
      description: 'Platform information request'
    },
    {
      id: 'info_2',
      input: 'How does the booking process work?',
      expectedIntent: 'info',
      expectedCategories: [],
      expectedConfidence: 0.85,
      description: 'Process information request'
    },
    
    // Complex/ambiguous tests
    {
      id: 'complex_1',
      input: 'I failed my job interview and need career guidance',
      expectedIntent: 'search',
      expectedCategories: ['career'],
      expectedConfidence: 0.8,
      description: 'Problem statement with career need'
    },
    {
      id: 'complex_2',
      input: 'My startup is struggling with legal compliance and business strategy',
      expectedIntent: 'search',
      expectedCategories: ['legal', 'business'],
      expectedConfidence: 0.85,
      description: 'Multi-category consultation need'
    },
    
    // Urgency tests
    {
      id: 'urgent_1',
      input: 'I need urgent legal help ASAP',
      expectedIntent: 'search',
      expectedCategories: ['legal'],
      expectedConfidence: 0.9,
      description: 'Urgent legal consultation'
    },
    
    // Budget tests
    {
      id: 'budget_1',
      input: 'Looking for business consultant under ₹5000',
      expectedIntent: 'search',
      expectedCategories: ['business'],
      expectedConfidence: 0.85,
      description: 'Budget-constrained search'
    }
  ];

  async validateAccuracy(intelligentAgent: any): Promise<{
    overallAccuracy: number;
    intentAccuracy: number;
    categoryAccuracy: number;
    confidenceAccuracy: number;
    results: ValidationResult[];
    recommendations: string[];
  }> {
    const results: ValidationResult[] = [];
    
    for (const testCase of this.testCases) {
      try {
        const result = await intelligentAgent.processUserMessage(
          testCase.input,
          'test_user',
          `test_session_${testCase.id}`,
          testCase.context || []
        );
        
        const validation = this.validateSingleResult(testCase, result);
        results.push(validation);
        
        console.log(`Test ${testCase.id}: ${validation.passed ? '✅ PASS' : '❌ FAIL'} (Score: ${validation.score.toFixed(2)})`);
        if (!validation.passed) {
          console.log(`  Issues: ${validation.issues.join(', ')}`);
        }
      } catch (error) {
        console.error(`Test ${testCase.id} failed with error:`, error);
        results.push({
          testId: testCase.id,
          passed: false,
          actualIntent: 'error',
          expectedIntent: testCase.expectedIntent,
          actualCategories: [],
          expectedCategories: testCase.expectedCategories,
          actualConfidence: 0,
          expectedConfidence: testCase.expectedConfidence,
          score: 0,
          issues: [`Error: ${error.message}`]
        });
      }
    }
    
    return this.calculateOverallAccuracy(results);
  }

  private validateSingleResult(testCase: TestCase, result: any): ValidationResult {
    const issues: string[] = [];
    let score = 0;
    
    // Intent validation (40% weight)
    const intentMatch = result.actionType === testCase.expectedIntent;
    if (intentMatch) {
      score += 40;
    } else {
      issues.push(`Intent mismatch: expected ${testCase.expectedIntent}, got ${result.actionType}`);
    }
    
    // Category validation (30% weight)
    const actualCategories = this.extractCategories(result);
    const categoryScore = this.calculateCategoryScore(actualCategories, testCase.expectedCategories);
    score += categoryScore * 30;
    
    if (categoryScore < 0.8) {
      issues.push(`Category mismatch: expected ${testCase.expectedCategories.join(', ')}, got ${actualCategories.join(', ')}`);
    }
    
    // Confidence validation (20% weight)
    const confidenceDiff = Math.abs(result.confidence - testCase.expectedConfidence);
    const confidenceScore = Math.max(0, 1 - (confidenceDiff / 0.5)); // Allow 0.5 tolerance
    score += confidenceScore * 20;
    
    if (confidenceDiff > 0.3) {
      issues.push(`Confidence off: expected ${testCase.expectedConfidence}, got ${result.confidence}`);
    }
    
    // Response quality (10% weight)
    const responseQuality = this.assessResponseQuality(result.response, testCase);
    score += responseQuality * 10;
    
    const passed = score >= 70; // 70% threshold for passing
    
    return {
      testId: testCase.id,
      passed,
      actualIntent: result.actionType,
      expectedIntent: testCase.expectedIntent,
      actualCategories,
      expectedCategories: testCase.expectedCategories,
      actualConfidence: result.confidence,
      expectedConfidence: testCase.expectedConfidence,
      score: score / 100,
      issues
    };
  }

  private extractCategories(result: any): string[] {
    // Extract categories from various possible locations in the result
    if (result.suggestedCategory) {
      return [result.suggestedCategory.toLowerCase()];
    }
    
    if (result.consultancies && result.consultancies.length > 0) {
      const categories = result.consultancies.map((c: any) => c.category?.toLowerCase()).filter(Boolean);
      return [...new Set(categories)];
    }
    
    // Try to extract from response text
    const response = result.response?.toLowerCase() || '';
    const categoryKeywords = ['legal', 'business', 'finance', 'technology', 'healthcare', 'career'];
    return categoryKeywords.filter(keyword => response.includes(keyword));
  }

  private calculateCategoryScore(actual: string[], expected: string[]): number {
    if (expected.length === 0 && actual.length === 0) return 1;
    if (expected.length === 0) return actual.length === 0 ? 1 : 0.5;
    
    const intersection = actual.filter(cat => expected.includes(cat));
    const union = [...new Set([...actual, ...expected])];
    
    return intersection.length / Math.max(expected.length, 1);
  }

  private assessResponseQuality(response: string, testCase: TestCase): number {
    if (!response || response.length < 10) return 0;
    
    let score = 0.5; // Base score
    
    // Check for helpful elements
    if (response.includes('help') || response.includes('assist')) score += 0.1;
    if (response.includes('consultant') || response.includes('expert')) score += 0.1;
    if (response.includes('📋') || response.includes('🚀') || response.includes('💡')) score += 0.1; // Emojis
    if (response.length > 50 && response.length < 500) score += 0.2; // Good length
    
    return Math.min(score, 1);
  }

  private calculateOverallAccuracy(results: ValidationResult[]): {
    overallAccuracy: number;
    intentAccuracy: number;
    categoryAccuracy: number;
    confidenceAccuracy: number;
    results: ValidationResult[];
    recommendations: string[];
  } {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    
    const intentCorrect = results.filter(r => r.actualIntent === r.expectedIntent).length;
    const categoryScores = results.map(r => this.calculateCategoryScore(r.actualCategories, r.expectedCategories));
    const confidenceScores = results.map(r => Math.max(0, 1 - Math.abs(r.actualConfidence - r.expectedConfidence) / 0.5));
    
    const overallAccuracy = passedTests / totalTests;
    const intentAccuracy = intentCorrect / totalTests;
    const categoryAccuracy = categoryScores.reduce((a, b) => a + b, 0) / totalTests;
    const confidenceAccuracy = confidenceScores.reduce((a, b) => a + b, 0) / totalTests;
    
    const recommendations = this.generateRecommendations(results);
    
    return {
      overallAccuracy,
      intentAccuracy,
      categoryAccuracy,
      confidenceAccuracy,
      results,
      recommendations
    };
  }

  private generateRecommendations(results: ValidationResult[]): string[] {
    const recommendations: string[] = [];
    const failedResults = results.filter(r => !r.passed);
    
    // Intent issues
    const intentIssues = failedResults.filter(r => r.actualIntent !== r.expectedIntent);
    if (intentIssues.length > 0) {
      recommendations.push(`Improve intent classification - ${intentIssues.length} tests failed intent detection`);
    }
    
    // Category issues
    const categoryIssues = failedResults.filter(r => 
      this.calculateCategoryScore(r.actualCategories, r.expectedCategories) < 0.8
    );
    if (categoryIssues.length > 0) {
      recommendations.push(`Enhance category detection - ${categoryIssues.length} tests had category mismatches`);
    }
    
    // Confidence issues
    const confidenceIssues = failedResults.filter(r => 
      Math.abs(r.actualConfidence - r.expectedConfidence) > 0.3
    );
    if (confidenceIssues.length > 0) {
      recommendations.push(`Calibrate confidence scoring - ${confidenceIssues.length} tests had confidence issues`);
    }
    
    // Specific pattern recommendations
    const greetingIssues = failedResults.filter(r => r.expectedIntent === 'greeting');
    if (greetingIssues.length > 0) {
      recommendations.push('Improve greeting detection patterns');
    }
    
    const searchIssues = failedResults.filter(r => r.expectedIntent === 'search');
    if (searchIssues.length > 0) {
      recommendations.push('Enhance search intent recognition');
    }
    
    return recommendations;
  }

  // Method to run continuous accuracy monitoring
  async runContinuousValidation(intelligentAgent: any, intervalMinutes: number = 60): Promise<void> {
    console.log(`🔄 Starting continuous accuracy validation (every ${intervalMinutes} minutes)`);
    
    const runValidation = async () => {
      const results = await this.validateAccuracy(intelligentAgent);
      console.log(`📊 Accuracy Report: Overall ${(results.overallAccuracy * 100).toFixed(1)}%`);
      console.log(`   Intent: ${(results.intentAccuracy * 100).toFixed(1)}%`);
      console.log(`   Category: ${(results.categoryAccuracy * 100).toFixed(1)}%`);
      console.log(`   Confidence: ${(results.confidenceAccuracy * 100).toFixed(1)}%`);
      
      if (results.recommendations.length > 0) {
        console.log('📝 Recommendations:');
        results.recommendations.forEach(rec => console.log(`   - ${rec}`));
      }
    };
    
    // Run immediately
    await runValidation();
    
    // Then run at intervals
    setInterval(runValidation, intervalMinutes * 60 * 1000);
  }
}