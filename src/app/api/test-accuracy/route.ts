import { NextRequest, NextResponse } from 'next/server';
import { IntelligentAgent } from '../../../services/intelligentAgent';
import { AccuracyValidator } from '../../../services/accuracyValidator';

export async function POST(request: NextRequest) {
  try {
    const { testType = 'full', message } = await request.json();
    
    const intelligentAgent = new IntelligentAgent();
    const validator = new AccuracyValidator();
    
    if (testType === 'single' && message) {
      // Test a single message
      const result = await intelligentAgent.processUserMessage(
        message,
        'test_user',
        `test_${Date.now()}`
      );
      
      return NextResponse.json({
        success: true,
        result: {
          input: message,
          intent: result.actionType,
          confidence: result.confidence,
          consultancies: result.consultancies.length,
          response: result.response,
          nextSteps: result.nextSteps
        }
      });
    }
    
    if (testType === 'accuracy') {
      // Run full accuracy validation
      const results = await validator.validateAccuracy(intelligentAgent);
      
      return NextResponse.json({
        success: true,
        accuracy: {
          overall: Math.round(results.overallAccuracy * 100),
          intent: Math.round(results.intentAccuracy * 100),
          category: Math.round(results.categoryAccuracy * 100),
          confidence: Math.round(results.confidenceAccuracy * 100)
        },
        testResults: results.results.map(r => ({
          testId: r.testId,
          passed: r.passed,
          score: Math.round(r.score * 100),
          issues: r.issues
        })),
        recommendations: results.recommendations,
        improvement: Math.round(results.overallAccuracy * 100) - 20 // vs previous 20%
      });
    }
    
    // Default: Quick test scenarios
    const quickTests = [
      'Hi there',
      'I need legal advice',
      'Looking for business consultant',
      'Book an appointment',
      'What is ConsultBridge?'
    ];
    
    const testResults = [];
    
    for (const testMessage of quickTests) {
      const result = await intelligentAgent.processUserMessage(
        testMessage,
        'test_user',
        `quick_test_${Date.now()}`
      );
      
      testResults.push({
        input: testMessage,
        intent: result.actionType,
        confidence: Math.round(result.confidence * 100),
        consultancies: result.consultancies.length,
        responseLength: result.response.length
      });
    }
    
    return NextResponse.json({
      success: true,
      testType: 'quick',
      results: testResults,
      summary: {
        averageConfidence: Math.round(
          testResults.reduce((sum, r) => sum + r.confidence, 0) / testResults.length
        ),
        totalConsultanciesFound: testResults.reduce((sum, r) => sum + r.consultancies, 0)
      }
    });
    
  } catch (error) {
    console.error('Test accuracy API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to run accuracy test',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'ConsultBridge Chatbot Accuracy Testing API',
    endpoints: {
      'POST /api/test-accuracy': {
        description: 'Run chatbot accuracy tests',
        parameters: {
          testType: 'full | single | accuracy | quick',
          message: 'Required for single test type'
        }
      }
    },
    usage: {
      quickTest: 'POST with no parameters',
      singleTest: 'POST with { "testType": "single", "message": "your test message" }',
      fullAccuracy: 'POST with { "testType": "accuracy" }'
    }
  });
}