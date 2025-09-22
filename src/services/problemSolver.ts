interface ProblemAnalysis {
  problemType: 'career' | 'business' | 'legal' | 'financial' | 'technical' | 'health' | 'general';
  severity: 'low' | 'medium' | 'high';
  canSelfSolve: boolean;
  solutionSteps: string[];
  needsConsultant: boolean;
  followUpQuestions: string[];
}

export class ProblemSolver {
  async analyzeProblem(message: string, history: any[]): Promise<ProblemAnalysis> {
    const lowerMessage = message.toLowerCase();
    
    // Detect problem type
    const problemType = this.detectProblemType(lowerMessage);
    const severity = this.assessSeverity(lowerMessage);
    
    // Generate solution steps
    const solutionSteps = this.generateSolutionSteps(problemType, lowerMessage);
    const canSelfSolve = solutionSteps.length > 0 && severity !== 'high';
    
    // Generate follow-up questions
    const followUpQuestions = this.generateFollowUpQuestions(problemType, lowerMessage);
    
    return {
      problemType,
      severity,
      canSelfSolve,
      solutionSteps,
      needsConsultant: severity === 'high' || !canSelfSolve,
      followUpQuestions
    };
  }

  private detectProblemType(message: string): ProblemAnalysis['problemType'] {
    if (message.includes('job') || message.includes('career') || message.includes('interview')) return 'career';
    if (message.includes('business') || message.includes('startup') || message.includes('company')) return 'business';
    if (message.includes('legal') || message.includes('contract') || message.includes('law')) return 'legal';
    if (message.includes('money') || message.includes('finance') || message.includes('debt')) return 'financial';
    if (message.includes('tech') || message.includes('software') || message.includes('website')) return 'technical';
    if (message.includes('health') || message.includes('medical') || message.includes('doctor')) return 'health';
    return 'general';
  }

  private assessSeverity(message: string): ProblemAnalysis['severity'] {
    const highSeverityWords = ['urgent', 'emergency', 'critical', 'lawsuit', 'fired', 'bankruptcy'];
    const mediumSeverityWords = ['problem', 'issue', 'trouble', 'difficult', 'struggling'];
    
    if (highSeverityWords.some(word => message.includes(word))) return 'high';
    if (mediumSeverityWords.some(word => message.includes(word))) return 'medium';
    return 'low';
  }

  private generateSolutionSteps(problemType: ProblemAnalysis['problemType'], message: string): string[] {
    const solutions: Record<string, string[]> = {
      career: [
        'Review your resume and highlight key achievements',
        'Practice common interview questions',
        'Research the company and role thoroughly',
        'Network with professionals in your field',
        'Consider skill development courses'
      ],
      business: [
        'Create a detailed business plan',
        'Analyze your target market',
        'Review your financial projections',
        'Seek feedback from potential customers',
        'Consider starting small with an MVP'
      ],
      financial: [
        'Create a monthly budget',
        'List all income and expenses',
        'Identify areas to reduce spending',
        'Consider additional income sources',
        'Build an emergency fund'
      ],
      technical: [
        'Break down the problem into smaller parts',
        'Research similar solutions online',
        'Check documentation and tutorials',
        'Test different approaches',
        'Consider using existing tools or frameworks'
      ]
    };

    return solutions[problemType] || [
      'Take a step back and analyze the situation',
      'Break the problem into smaller, manageable parts',
      'Research possible solutions',
      'Consider seeking advice from trusted friends or mentors'
    ];
  }

  private generateFollowUpQuestions(problemType: ProblemAnalysis['problemType'], message: string): string[] {
    const questions: Record<string, string[]> = {
      career: [
        'What specific role are you targeting?',
        'How long have you been job searching?',
        'What feedback have you received from interviews?'
      ],
      business: [
        'What stage is your business in?',
        'What\'s your biggest challenge right now?',
        'Do you have a business plan?'
      ],
      legal: [
        'Is this time-sensitive?',
        'Have you tried resolving this directly?',
        'Do you have any documentation?'
      ],
      financial: [
        'What\'s your current financial situation?',
        'Is this an immediate concern?',
        'Have you tried budgeting before?'
      ]
    };

    return questions[problemType] || [
      'Can you tell me more about the situation?',
      'How long has this been an issue?',
      'What have you tried so far?'
    ];
  }

  generateSupportiveResponse(analysis: ProblemAnalysis, userMessage: string): string {
    let response = this.getEmpathyResponse(analysis.severity);
    
    if (analysis.canSelfSolve && analysis.solutionSteps.length > 0) {
      response += `\n\n💡 **Here are some steps you can try first:**\n`;
      analysis.solutionSteps.slice(0, 3).forEach((step, i) => {
        response += `${i + 1}. ${step}\n`;
      });
      
      response += `\n❓ **Let me understand better:**\n`;
      analysis.followUpQuestions.slice(0, 2).forEach(q => {
        response += `• ${q}\n`;
      });
      
      response += `\nTry these steps and let me know how it goes! If you need expert guidance, I can connect you with professional consultants.`;
    } else {
      response += `\n\n❓ **Tell me more:**\n`;
      analysis.followUpQuestions.forEach(q => {
        response += `• ${q}\n`;
      });
      
      response += `\nBased on your answers, I'll either help you work through this or connect you with the right expert.`;
    }
    
    return response;
  }

  private getEmpathyResponse(severity: ProblemAnalysis['severity']): string {
    const responses = {
      high: "I understand this is urgent and stressful. 😔 Let me help you right away.",
      medium: "I can see you're facing a challenging situation. 💙 Let's work through this together.",
      low: "I'm here to help you with this! 🌟 Let's explore some solutions."
    };
    
    return responses[severity];
  }
}