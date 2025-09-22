import { IntelligentAgent } from '../services/intelligentAgent';
import { AccuracyValidator } from '../services/accuracyValidator';

async function testChatbotAccuracy() {
  console.log('🚀 Starting ConsultBridge Chatbot Accuracy Test');
  console.log('================================================');
  
  try {
    // Initialize services
    const intelligentAgent = new IntelligentAgent();
    const validator = new AccuracyValidator();
    
    console.log('🔧 Initializing test environment...');
    
    // Run comprehensive accuracy validation
    console.log('📊 Running accuracy validation tests...');
    const results = await validator.validateAccuracy(intelligentAgent);
    
    // Display results
    console.log('\n📈 ACCURACY RESULTS');
    console.log('==================');
    console.log(`Overall Accuracy: ${(results.overallAccuracy * 100).toFixed(1)}%`);
    console.log(`Intent Accuracy: ${(results.intentAccuracy * 100).toFixed(1)}%`);
    console.log(`Category Accuracy: ${(results.categoryAccuracy * 100).toFixed(1)}%`);
    console.log(`Confidence Accuracy: ${(results.confidenceAccuracy * 100).toFixed(1)}%`);
    
    // Show test breakdown
    const passedTests = results.results.filter(r => r.passed).length;
    const totalTests = results.results.length;
    console.log(`\nTests Passed: ${passedTests}/${totalTests}`);
    
    // Show failed tests
    const failedTests = results.results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      failedTests.forEach(test => {
        console.log(`  ${test.testId}: Score ${(test.score * 100).toFixed(1)}%`);
        test.issues.forEach(issue => console.log(`    - ${issue}`));
      });
    }
    
    // Show recommendations
    if (results.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      results.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
    
    // Performance comparison
    console.log('\n📊 PERFORMANCE COMPARISON:');
    console.log(`Previous Accuracy: 20%`);
    console.log(`Current Accuracy: ${(results.overallAccuracy * 100).toFixed(1)}%`);
    console.log(`Improvement: +${((results.overallAccuracy * 100) - 20).toFixed(1)}%`);
    
    // Test specific scenarios
    console.log('\n🧪 TESTING SPECIFIC SCENARIOS:');
    await testSpecificScenarios(intelligentAgent);
    
    console.log('\n✅ Accuracy testing completed!');
    
  } catch (error) {
    console.error('❌ Error during accuracy testing:', error);
  }
}

async function testSpecificScenarios(agent: IntelligentAgent) {
  const scenarios = [
    {
      name: 'Complex Legal Query',
      input: 'I need help with a contract dispute involving intellectual property rights',
      expectedCategory: 'legal'
    },
    {
      name: 'Urgent Business Consultation',
      input: 'My startup needs immediate business strategy help, we have a deadline tomorrow',
      expectedCategory: 'business'
    },
    {
      name: 'Multi-category Need',
      input: 'I need both financial planning and legal advice for my new business',
      expectedCategories: ['finance', 'legal', 'business']
    },
    {
      name: 'Emotional Support Request',
      input: 'I failed my job interview and feeling lost about my career',
      expectedCategory: 'career'
    },
    {
      name: 'Technical Consultation',
      input: 'Looking for expert help with cloud migration and cybersecurity',
      expectedCategory: 'technology'
    }
  ];
  
  for (const scenario of scenarios) {
    try {
      const result = await agent.processUserMessage(
        scenario.input,
        'test_user',
        `scenario_${Date.now()}`
      );
      
      console.log(`\n  ${scenario.name}:`);
      console.log(`    Input: "${scenario.input}"`);
      console.log(`    Intent: ${result.actionType}`);
      console.log(`    Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`    Consultancies Found: ${result.consultancies.length}`);
      console.log(`    Response Length: ${result.response.length} chars`);
      
      // Check if response contains expected category
      const responseText = result.response.toLowerCase();
      const hasExpectedCategory = scenario.expectedCategory ? 
        responseText.includes(scenario.expectedCategory) : true;
      
      console.log(`    Category Match: ${hasExpectedCategory ? '✅' : '❌'}`);
      
    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testChatbotAccuracy().catch(console.error);
}

export { testChatbotAccuracy };