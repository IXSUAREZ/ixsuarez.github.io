const { initJSDOM } = require('./test-helpers');
const { tests: wizardTests } = require('./wizard.test');
const tests = wizardTests;

async function runAllTests() {
  console.log('==================================================');
  console.log('Running Simply Endorsed CFI Part 61 Wizard E2E Tests');
  console.log(`Total test cases loaded: ${tests.length}`);
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < tests.length; i++) {
    const testCase = tests[i];
    const testNum = i + 1;
    console.log(`[${testNum}/${tests.length}] Running ${testCase.id}: ${testCase.name}...`);

    let helpers;
    try {
      // Initialize fresh JSDOM for every test case
      helpers = initJSDOM();
    } catch (initErr) {
      console.log(`\x1b[31m[FAIL]\x1b[0m ${testCase.id} - Failed to initialize JSDOM: ${initErr.message}\n`);
      failed++;
      continue;
    }

    try {
      // Execute the test function
      await testCase.fn(helpers.dom, helpers);
      console.log(`\x1b[32m[PASS]\x1b[0m ${testCase.id}\n`);
      passed++;
    } catch (testErr) {
      console.log(`\x1b[31m[FAIL]\x1b[0m ${testCase.id} - ${testErr.message}\n`);
      failed++;
    }
  }

  console.log('==================================================');
  console.log('                 Test Run Summary                 ');
  console.log('==================================================');
  console.log(`Total Tests Run: ${tests.length}`);
  console.log(`Passed:         \x1b[32m${passed}\x1b[0m`);
  console.log(`Failed:         \x1b[31m${failed}\x1b[0m`);
  console.log('==================================================\n');

  if (failed > 0) {
    console.log(`Result: \x1b[31mSOME TESTS FAILED (${failed} failed)\x1b[0m`);
    process.exit(1);
  } else {
    console.log('Result: \x1b[32mALL TESTS PASSED\x1b[0m');
    process.exit(0);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
