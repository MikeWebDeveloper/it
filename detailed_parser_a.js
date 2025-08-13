#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('=== PARSER AGENT A - DETAILED ANALYSIS (Questions 1-120) ===\n');

const questionsPath = path.join(__dirname, 'src/data/questions.json');
const extractedPath = path.join(__dirname, 'it-essentials-extracted-questions.json');

// Initialize analysis structure
const analysis = {
  range: "1-120",
  total_processed: 0,
  analysis_timestamp: new Date().toISOString(),
  parser_agent: "A",
  exact_matches: [],
  partial_matches: [],
  missing_from_reference: [],
  answer_discrepancies: [],
  option_count_issues: [],
  detailed_comparison: []
};

try {
  // Read current questions database
  console.log('Reading current questions database...');
  const currentQuestions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
  console.log(`✓ Found ${currentQuestions.length} questions in current database`);
  
  // Read extracted reference questions
  console.log('Reading extracted reference questions...');
  const extractedQuestions = JSON.parse(fs.readFileSync(extractedPath, 'utf8'));
  console.log(`✓ Found ${extractedQuestions.length} questions in reference file`);
  
  // Filter questions 1-120
  const range1_120 = currentQuestions.filter(q => q.id >= 1 && q.id <= 120);
  analysis.total_processed = range1_120.length;
  
  console.log(`\nProcessing ${range1_120.length} questions in range 1-120...\n`);
  
  // Process each question in range 1-120
  range1_120.forEach((currentQ, index) => {
    const progressPercent = Math.round(((index + 1) / range1_120.length) * 100);
    process.stdout.write(`\rProcessing question ${currentQ.id}... ${progressPercent}%`);
    
    // Check option count
    const optionCount = currentQ.options ? currentQ.options.length : 0;
    if (optionCount < 4) {
      analysis.option_count_issues.push({
        id: currentQ.id,
        question_preview: currentQ.question ? currentQ.question.substring(0, 80) + '...' : 'No question text',
        option_count: optionCount,
        options: currentQ.options || []
      });
    }
    
    // Normalize question text for comparison
    const normalizeText = (text) => {
      if (!text) return '';
      return text.toLowerCase().trim().replace(/\s+/g, ' ');
    };
    
    // Find potential matches in extracted data
    const currentQNormalized = normalizeText(currentQ.question);
    const potentialMatches = extractedQuestions.filter(eq => {
      const extractedQNormalized = normalizeText(eq.question);
      // Check for exact match or high similarity
      return extractedQNormalized === currentQNormalized ||
             extractedQNormalized.includes(currentQNormalized.substring(0, 50)) ||
             currentQNormalized.includes(extractedQNormalized.substring(0, 50));
    });
    
    let matchFound = false;
    
    if (potentialMatches.length > 0) {
      const bestMatch = potentialMatches[0]; // Take the first/best match
      
      // Compare options and answers
      const currentOptions = currentQ.options ? currentQ.options.map(o => normalizeText(o)).sort() : [];
      const refOptions = bestMatch.options ? bestMatch.options.map(o => normalizeText(o)).sort() : [];
      const currentAnswer = normalizeText(currentQ.correctAnswer || '');
      const refAnswer = normalizeText(bestMatch.correctAnswer || '');
      
      const optionsMatch = JSON.stringify(currentOptions) === JSON.stringify(refOptions);
      const answersMatch = currentAnswer === refAnswer;
      
      if (optionsMatch && answersMatch) {
        // Exact match
        analysis.exact_matches.push({
          id: currentQ.id,
          question_preview: currentQ.question ? currentQ.question.substring(0, 80) + '...' : 'No question',
          reference_id: bestMatch.id || 'unknown'
        });
        matchFound = true;
      } else {
        // Partial match
        analysis.partial_matches.push({
          id: currentQ.id,
          question_preview: currentQ.question ? currentQ.question.substring(0, 80) + '...' : 'No question',
          reference_id: bestMatch.id || 'unknown',
          differences: {
            options_different: !optionsMatch,
            answer_different: !answersMatch,
            current_option_count: currentQ.options ? currentQ.options.length : 0,
            reference_option_count: bestMatch.options ? bestMatch.options.length : 0
          }
        });
        matchFound = true;
        
        // Track answer discrepancies
        if (!answersMatch) {
          analysis.answer_discrepancies.push({
            id: currentQ.id,
            question_preview: currentQ.question ? currentQ.question.substring(0, 80) + '...' : 'No question',
            current_answer: currentQ.correctAnswer || 'No answer',
            reference_answer: bestMatch.correctAnswer || 'No answer',
            severity: currentAnswer && refAnswer ? 'high' : 'medium'
          });
        }
      }
    }
    
    if (!matchFound) {
      analysis.missing_from_reference.push({
        id: currentQ.id,
        question_preview: currentQ.question ? currentQ.question.substring(0, 80) + '...' : 'No question',
        option_count: optionCount,
        has_correct_answer: !!(currentQ.correctAnswer)
      });
    }
    
    // Add to detailed comparison
    analysis.detailed_comparison.push({
      id: currentQ.id,
      match_status: matchFound ? (analysis.exact_matches.some(m => m.id === currentQ.id) ? 'exact' : 'partial') : 'missing',
      option_count: optionCount,
      has_correct_answer: !!(currentQ.correctAnswer),
      question_length: currentQ.question ? currentQ.question.length : 0
    });
  });
  
  console.log('\n\n=== PARSER AGENT A SUMMARY ===');
  console.log(`Total Questions Processed: ${analysis.total_processed}`);
  console.log(`Exact Matches: ${analysis.exact_matches.length}`);
  console.log(`Partial Matches: ${analysis.partial_matches.length}`);
  console.log(`Missing from Reference: ${analysis.missing_from_reference.length}`);
  console.log(`Answer Discrepancies: ${analysis.answer_discrepancies.length}`);
  console.log(`Option Count Issues: ${analysis.option_count_issues.length}`);
  
  // Save detailed analysis
  const outputPath = path.join(__dirname, 'parser_agent_a_detailed_analysis.json');
  fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
  console.log(`\n✓ Detailed analysis saved to: ${outputPath}`);
  
  // Generate summary report
  const summaryReport = {
    parser_agent: "A",
    range: "1-120",
    timestamp: new Date().toISOString(),
    summary: {
      total_processed: analysis.total_processed,
      exact_matches: analysis.exact_matches.length,
      partial_matches: analysis.partial_matches.length,
      missing_from_reference: analysis.missing_from_reference.length,
      answer_discrepancies: analysis.answer_discrepancies.length,
      option_count_issues: analysis.option_count_issues.length
    },
    validation_status: {
      coverage_percentage: Math.round(((analysis.exact_matches.length + analysis.partial_matches.length) / analysis.total_processed) * 100),
      quality_issues: analysis.answer_discrepancies.length + analysis.option_count_issues.length,
      ready_for_next_phase: analysis.option_count_issues.length === 0 && analysis.answer_discrepancies.length < 5
    },
    recommendations: [
      analysis.missing_from_reference.length > 10 ? "High number of questions missing from reference - verify reference completeness" : null,
      analysis.answer_discrepancies.length > 5 ? "Multiple answer discrepancies found - requires review" : null,
      analysis.option_count_issues.length > 0 ? "Some questions have less than 4 options - needs attention" : null
    ].filter(r => r !== null)
  };
  
  const summaryPath = path.join(__dirname, 'parser_agent_a_summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summaryReport, null, 2));
  console.log(`✓ Summary report saved to: ${summaryPath}`);
  
} catch (error) {
  console.error('\n❌ Error during analysis:', error.message);
  
  // Save error report
  const errorReport = {
    range: "1-120",
    parser_agent: "A",
    error: error.message,
    timestamp: new Date().toISOString(),
    status: "failed",
    files_checked: {
      questions_file: fs.existsSync(questionsPath),
      extracted_file: fs.existsSync(extractedPath)
    }
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'parser_agent_a_error.json'),
    JSON.stringify(errorReport, null, 2)
  );
}

console.log('\n=== PARSER AGENT A COMPLETED ===');