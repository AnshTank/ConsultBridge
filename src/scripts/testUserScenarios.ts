import { MessageOrchestrator } from '../services/messageOrchestrator';

interface TestScenario {
  name: string;
  conversation: string[];
  expectedFlow: string[];
  description: string;
}

export class UserScenarioTester {
  private orchestrator: MessageOrchestrator;

  constructor() {
    this.orchestrator = new MessageOrchestrator();
  }

  async testAllScenarios(): Promise<void> {
    console.log('🧪 Testing All User Scenarios for ConsultBridge');
    console.log('==============================================');

    const scenarios: TestScenario[] = [
      // Greeting Scenarios
      {
        name: 'Simple Greeting',
        conversation: ['Hi there'],
        expectedFlow: ['greeting'],
        description: 'User starts with basic greeting'
      },
      {
        name: 'Greeting with Need',
        conversation: ['Hello, I need some help'],
        expectedFlow: ['greeting'],
        description: 'User greets and mentions needing help'
      },

      // Problem-Solving First Scenarios
      {
        name: 'Career Problem - Self Help First',
        conversation: [
          'I failed my job interview and feeling lost',
          'I tried updating my resume but still no luck',
          'I need professional help now'
        ],
        expectedFlow: ['problem_solving', 'problem_followup', 'search'],
        description: 'Career problem with self-help attempt then consultant request'
      },
      {
        name: 'Business Problem - Solution First',
        conversation: [
          'My startup is struggling with customer acquisition',
          'I tried social media marketing but it\'s not working',
          'Can you find me a business consultant?'
        ],
        expectedFlow: ['problem_solving', 'problem_followup', 'search'],
        description: 'Business problem with attempted solution then expert request'
      },

      // Direct Search Scenarios
      {
        name: 'Direct Legal Search',
        conversation: ['I need a lawyer for contract review'],
        expectedFlow: ['search'],
        description: 'Direct request for legal consultation'
      },
      {
        name: 'Urgent Financial Help',
        conversation: ['I need urgent financial planning help ASAP'],
        expectedFlow: ['search'],
        description: 'Urgent financial consultation request'
      },

      // Booking Flow Scenarios
      {
        name: 'Complete Booking Flow',
        conversation: [
          'I need business advice',
          'I want to book with the first consultant',
          'Tomorrow',
          '2 PM',
          'Online'
        ],
        expectedFlow: ['search', 'booking_date', 'booking_time', 'booking_type', 'booking_confirmed'],
        description: 'Complete booking process from search to confirmation'
      },

      // Information Request Scenarios
      {
        name: 'Platform Information',
        conversation: ['What is ConsultBridge?'],
        expectedFlow: ['info'],
        description: 'User asking about the platform'
      },
      {
        name: 'How It Works',
        conversation: ['How does the booking process work?'],
        expectedFlow: ['info'],
        description: 'User asking about process'
      },

      // Complex Multi-turn Scenarios
      {
        name: 'Multi-Category Need',
        conversation: [
          'I need help with both legal and business matters',
          'Show me legal consultants first',
          'Actually, let me see business consultants instead'
        ],
        expectedFlow: ['search', 'search', 'search'],
        description: 'User with multiple needs changing focus'
      },

      // Support and Complaint Scenarios
      {
        name: 'Support Request',
        conversation: ['I\'m having trouble finding the right consultant'],
        expectedFlow: ['support'],
        description: 'User needs help with the platform'
      },
      {
        name: 'Complaint Handling',
        conversation: ['The consultant I booked didn\'t show up'],
        expectedFlow: ['complaint'],
        description: 'User has a complaint about service'
      },

      // Edge Cases
      {
        name: 'Unclear Request',
        conversation: ['Help me'],
        expectedFlow: ['support'],
        description: 'Vague request requiring clarification'
      },
      {
        name: 'Budget Constraint',
        conversation: ['I need business advice but my budget is only ₹2000'],
        expectedFlow: ['search'],
        description: 'Search with specific budget constraint'
      }
    ];

    let passedScenarios = 0;
    const results: any[] = [];

    for (const scenario of scenarios) {
      console.log(`\n🔍 Testing: ${scenario.name}`);
      console.log(`Description: ${scenario.description}`);
      
      try {
        const result = await this.testScenario(scenario);
        results.push(result);
        
        if (result.passed) {
          console.log('✅ PASSED');
          passedScenarios++;
        } else {
          console.log('❌ FAILED');
          console.log(`Expected flow: ${scenario.expectedFlow.join(' → ')}`);
          console.log(`Actual flow: ${result.actualFlow.join(' → ')}`);
          console.log(`Issues: ${result.issues.join(', ')}`);
        }
      } catch (error) {
        console.log(`❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
        results.push({
          scenario: scenario.name,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          actualFlow: [],
          issues: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`]
        });
      }
    }

    // Summary
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    console.log(`Total Scenarios: ${scenarios.length}`);
    console.log(`Passed: ${passedScenarios}`);
    console.log(`Failed: ${scenarios.length - passedScenarios}`);
    console.log(`Success Rate: ${Math.round((passedScenarios / scenarios.length) * 100)}%`);

    // Detailed Results
    console.log('\n📋 DETAILED RESULTS');
    console.log('===================');
    results.forEach(result => {
      if (!result.passed) {
        console.log(`\n❌ ${result.scenario}:`);
        result.issues?.forEach((issue: string) => console.log(`   - ${issue}`));
      }
    });

    return;
  }

  private async testScenario(scenario: TestScenario): Promise<{
    scenario: string;
    passed: boolean;
    actualFlow: string[];
    expectedFlow: string[];
    issues: string[];
    responses: string[];
  }> {
    const sessionId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const actualFlow: string[] = [];
    const responses: string[] = [];
    const issues: string[] = [];

    for (let i = 0; i < scenario.conversation.length; i++) {
      const message = scenario.conversation[i];
      
      const result = await this.orchestrator.processMessage(
        message,
        'test_user',
        sessionId
      );

      actualFlow.push(result.actionType);
      responses.push(result.reply);

      // Validate response quality
      if (!result.reply || result.reply.length < 10) {
        issues.push(`Message ${i + 1}: Response too short or empty`);
      }

      if (result.confidence < 0.5) {
        issues.push(`Message ${i + 1}: Low confidence (${result.confidence})`);
      }

      // Check for expected flow at each step
      if (i < scenario.expectedFlow.length) {
        const expectedAction = scenario.expectedFlow[i];
        if (result.actionType !== expectedAction) {
          issues.push(`Message ${i + 1}: Expected ${expectedAction}, got ${result.actionType}`);
        }
      }

      // Validate problem-solving flow
      if (result.actionType === 'problem_solving') {
        if (!result.reply.includes('steps') && !result.reply.includes('try')) {
          issues.push(`Message ${i + 1}: Problem-solving response should offer solutions`);
        }
      }

      // Validate search results
      if (result.actionType === 'search') {
        if (result.consultancies.length === 0) {
          issues.push(`Message ${i + 1}: Search should return consultancies`);
        }
      }

      // Validate booking flow
      if (result.actionType.includes('booking')) {
        if (!result.reply.includes('book') && !result.reply.includes('appointment')) {
          issues.push(`Message ${i + 1}: Booking response should mention booking/appointment`);
        }
      }

      console.log(`   ${i + 1}. "${message}" → ${result.actionType} (${Math.round(result.confidence * 100)}%)`);
    }

    // Overall flow validation
    const flowMatches = actualFlow.length === scenario.expectedFlow.length &&
      actualFlow.every((action, i) => action === scenario.expectedFlow[i]);

    if (!flowMatches && issues.length === 0) {
      issues.push('Conversation flow does not match expected pattern');
    }

    return {
      scenario: scenario.name,
      passed: issues.length === 0,
      actualFlow,
      expectedFlow: scenario.expectedFlow,
      issues,
      responses
    };
  }

  // Test specific user experience aspects
  async testUserExperienceAspects(): Promise<void> {
    console.log('\n🎯 Testing User Experience Aspects');
    console.log('===================================');

    const uxTests = [
      {
        name: 'Empathy in Problem Handling',
        test: async () => {
          const result = await this.orchestrator.processMessage(
            'I lost my job and don\'t know what to do',
            'test_user'
          );
          return {
            passed: result.reply.includes('😔') || result.reply.includes('💙') || result.reply.includes('understand'),
            message: 'Should show empathy with emojis or understanding language'
          };
        }
      },
      {
        name: 'Solution-First Approach',
        test: async () => {
          const result = await this.orchestrator.processMessage(
            'I\'m struggling with my business finances',
            'test_user'
          );
          return {
            passed: result.reply.includes('steps') || result.reply.includes('try') || result.reply.includes('first'),
            message: 'Should offer self-help solutions first'
          };
        }
      },
      {
        name: 'Smooth Transition to Consultants',
        test: async () => {
          const sessionId = `ux_test_${Date.now()}`;
          await this.orchestrator.processMessage('I need career help', 'test_user', sessionId);
          const result = await this.orchestrator.processMessage('I need professional help', 'test_user', sessionId);
          return {
            passed: result.consultancies.length > 0,
            message: 'Should smoothly transition to showing consultants when requested'
          };
        }
      },
      {
        name: 'Contextual Suggestions',
        test: async () => {
          const result = await this.orchestrator.processMessage(
            'I need legal advice',
            'test_user'
          );
          return {
            passed: result.nextSteps.length > 0 && result.nextSteps.some((step: string) => 
              step.toLowerCase().includes('legal') || step.toLowerCase().includes('profile') || step.toLowerCase().includes('book')
            ),
            message: 'Should provide relevant contextual suggestions'
          };
        }
      }
    ];

    let passedUXTests = 0;

    for (const uxTest of uxTests) {
      try {
        const result = await uxTest.test();
        console.log(`${result.passed ? '✅' : '❌'} ${uxTest.name}`);
        if (!result.passed) {
          console.log(`   Issue: ${result.message}`);
        }
        if (result.passed) passedUXTests++;
      } catch (error) {
        console.log(`❌ ${uxTest.name}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`\nUX Test Results: ${passedUXTests}/${uxTests.length} passed`);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new UserScenarioTester();
  tester.testAllScenarios()
    .then(() => tester.testUserExperienceAspects())
    .catch(console.error);
}

