/**
 * Debug Script for Desktop Speech Recognition Issue
 * 
 * This script helps identify why desktop speech recognition
 * is not capturing both words when there's a 5-second gap.
 * 
 * Usage:
 * 1. Open browser DevTools Console
 * 2. Copy and paste this entire script
 * 3. Press Enter to run
 * 4. Follow the prompts
 */

(function() {
  console.log('🔍 === SPEECH RECOGNITION DEBUG TOOL ===');
  console.log('This tool will help diagnose the speech accumulation issue');
  console.log('');
  
  // Check if Speech Recognition is available
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error('❌ Speech Recognition not supported in this browser');
    return;
  }
  
  console.log('✅ Speech Recognition API available');
  console.log('');
  
  // Create test instance
  const recognition = new SpeechRecognition();
  
  // Configure exactly like the app
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.lang = 'de-DE';
  
  console.log('📋 Configuration:');
  console.log('  - continuous:', recognition.continuous);
  console.log('  - interimResults:', recognition.interimResults);
  console.log('  - maxAlternatives:', recognition.maxAlternatives);
  console.log('  - lang:', recognition.lang);
  console.log('');
  
  let currentMessage = '';
  let resultCount = 0;
  let startTime = null;
  
  // Track all results
  const allResults = [];
  
  recognition.onstart = () => {
    startTime = Date.now();
    console.log('🎤 === RECORDING STARTED ===');
    console.log('Speak your first word, wait 5 seconds, then speak second word');
    console.log('Click the stop button when done');
    console.log('');
  };
  
  recognition.onresult = (event) => {
    const timestamp = ((Date.now() - startTime) / 1000).toFixed(2);
    resultCount++;
    
    console.log(`\n🔍 === RESULT #${resultCount} (at ${timestamp}s) ===`);
    console.log('event.results.length:', event.results.length);
    console.log('event.resultIndex:', event.resultIndex);
    console.log('');
    
    // Log ALL results in the array
    console.log('📊 ALL RESULTS IN ARRAY:');
    for (let i = 0; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence || 'N/A';
      const isFinal = result.isFinal;
      
      console.log(`  [${i}] "${transcript}"`);
      console.log(`      isFinal: ${isFinal}, confidence: ${confidence}`);
      
      // Store for analysis
      allResults.push({
        resultNumber: resultCount,
        index: i,
        transcript,
        isFinal,
        confidence,
        timestamp
      });
    }
    console.log('');
    
    // Show what the app code does
    const lastResultIndex = event.results.length - 1;
    const lastResult = event.results[lastResultIndex];
    const lastTranscript = lastResult[0].transcript;
    
    console.log('🎯 WHAT APP USES (last result):');
    console.log(`  Index: ${lastResultIndex}`);
    console.log(`  Transcript: "${lastTranscript}"`);
    console.log(`  isFinal: ${lastResult.isFinal}`);
    console.log('');
    
    // Show the bug
    console.log('⚠️  CURRENT BEHAVIOR (replaces):');
    console.log(`  BEFORE: currentMessage = "${currentMessage}"`);
    currentMessage = lastTranscript; // This is what the app does
    console.log(`  AFTER:  currentMessage = "${currentMessage}"`);
    console.log('');
    
    // Show what it should be
    console.log('✅ EXPECTED BEHAVIOR (should accumulate):');
    let expectedMessage = '';
    for (let i = 0; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        expectedMessage += event.results[i][0].transcript + ' ';
      }
    }
    expectedMessage = expectedMessage.trim();
    console.log(`  Expected: "${expectedMessage}"`);
    console.log('');
    
    // Check if cumulative
    if (event.results.length > 1) {
      const firstTranscript = event.results[0][0].transcript;
      const lastTranscript = event.results[event.results.length - 1][0].transcript;
      
      if (lastTranscript.includes(firstTranscript)) {
        console.log('✅ Results ARE cumulative (last contains first)');
      } else {
        console.log('❌ Results are NOT cumulative (last does NOT contain first)');
        console.log('   This explains why only the last word is captured!');
      }
      console.log('');
    }
  };
  
  recognition.onerror = (event) => {
    console.error('❌ Error:', event.error);
  };
  
  recognition.onend = () => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n🎤 === RECORDING ENDED ===');
    console.log(`Duration: ${duration}s`);
    console.log(`Total result events: ${resultCount}`);
    console.log('');
    
    console.log('📊 === FINAL ANALYSIS ===');
    console.log(`Current message (what app sends): "${currentMessage}"`);
    console.log('');
    
    // Analyze all results
    console.log('📋 Complete Results History:');
    console.table(allResults);
    console.log('');
    
    // Provide diagnosis
    console.log('🔬 === DIAGNOSIS ===');
    
    if (allResults.length === 0) {
      console.log('❌ No speech was captured');
      console.log('   Possible causes:');
      console.log('   - Microphone not working');
      console.log('   - Permissions not granted');
      console.log('   - Speaking too quietly');
    } else if (allResults.length === 1) {
      console.log('⚠️  Only one result captured');
      console.log('   This suggests:');
      console.log('   - Only one word was spoken');
      console.log('   - OR second word was not recognized');
      console.log('   - OR pause was too long and browser stopped');
    } else {
      // Check if results are cumulative
      const firstWord = allResults[0].transcript;
      const lastWord = allResults[allResults.length - 1].transcript;
      
      if (lastWord.includes(firstWord)) {
        console.log('✅ Speech Recognition API IS working correctly');
        console.log('   Results are cumulative as expected');
        console.log('   The app code should work correctly');
        console.log('');
        console.log('   If the app still fails, check:');
        console.log('   - Confidence threshold (60%)');
        console.log('   - Text normalization function');
        console.log('   - Message sending logic');
      } else {
        console.log('❌ FOUND THE BUG!');
        console.log('   Speech Recognition API is NOT providing cumulative results');
        console.log('   Each result contains only NEW words, not ALL words');
        console.log('');
        console.log('   FIX REQUIRED:');
        console.log('   The app must manually accumulate results instead of');
        console.log('   replacing currentMessage with each new result');
        console.log('');
        console.log('   Suggested fix:');
        console.log('   ```typescript');
        console.log('   // Accumulate final results');
        console.log('   if (lastResult.isFinal) {');
        console.log('     if (!this.currentMessage.includes(normalizedTranscript)) {');
        console.log('       this.currentMessage += " " + normalizedTranscript;');
        console.log('       this.currentMessage = this.currentMessage.trim();');
        console.log('     }');
        console.log('   }');
        console.log('   ```');
      }
    }
    
    console.log('');
    console.log('🔍 === DEBUG SESSION COMPLETE ===');
    console.log('');
    console.log('To run again, refresh the page and paste this script again');
  };
  
  // Create UI controls
  console.log('🎮 === CONTROLS ===');
  console.log('Run these commands in console:');
  console.log('');
  console.log('  startTest()  - Start recording');
  console.log('  stopTest()   - Stop recording');
  console.log('');
  
  // Make functions global
  window.startTest = () => {
    try {
      recognition.start();
      console.log('✅ Recording started - speak now!');
    } catch (e) {
      console.error('❌ Failed to start:', e.message);
      console.log('   Try stopping first: stopTest()');
    }
  };
  
  window.stopTest = () => {
    try {
      recognition.stop();
      console.log('✅ Recording stopped');
    } catch (e) {
      console.error('❌ Failed to stop:', e.message);
    }
  };
  
  console.log('✅ Debug tool loaded successfully');
  console.log('');
  console.log('👉 Type startTest() to begin');
  console.log('');
})();
