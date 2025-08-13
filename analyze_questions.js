const fs = require('fs');
const path = require('path');

// Read the current questions database
const questionsPath = path.join(__dirname, 'src/data/questions.json');
const extractedPath = path.join(__dirname, 'it-essentials-extracted-questions.json');

try {
  // Read current questions
  const currentQuestions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
  console.log(`Current database has ${currentQuestions.length} questions`);
  
  // Read extracted questions
  let extractedQuestions = [];
  if (fs.existsSync(extractedPath)) {
    extractedQuestions = JSON.parse(fs.readFileSync(extractedPath, 'utf8'));
    console.log(`Extracted file has ${extractedQuestions.length} questions`);
  } else {
    console.log('Extracted questions file not found');
  }
  
  // Filter questions 1-120 from current database
  const range1_120 = currentQuestions.filter(q => q.id >= 1 && q.id <= 120);
  console.log(`Questions 1-120 in current database: ${range1_120.length}`);
  
  // Analysis for questions 1-120
  const analysis = {
    range: "1-120",
    total_processed: range1_120.length,
    exact_matches: [],
    partial_matches: [],
    missing_from_reference: [],
    answer_discrepancies: [],
    option_count_issues: []
  };
  
  // Check each question in range 1-120
  range1_120.forEach(currentQ => {
    // Check option count
    if (currentQ.options && currentQ.options.length < 4) {
      analysis.option_count_issues.push({
        id: currentQ.id,
        question: currentQ.question.substring(0, 100) + '...',
        option_count: currentQ.options.length
      });
    }
    
    // Find matching question in extracted data
    const matchedQ = extractedQuestions.find(eq => 
      eq.question && currentQ.question && 
      eq.question.toLowerCase().trim() === currentQ.question.toLowerCase().trim()
    );
    
    if (matchedQ) {
      // Check if it's an exact match
      const isExactMatch = (
        JSON.stringify(currentQ.options?.sort()) === JSON.stringify(matchedQ.options?.sort()) &&
        currentQ.correctAnswer === matchedQ.correctAnswer
      );
      
      if (isExactMatch) {
        analysis.exact_matches.push({
          id: currentQ.id,
          question: currentQ.question.substring(0, 100) + '...'
        });
      } else {
        analysis.partial_matches.push({
          id: currentQ.id,
          question: currentQ.question.substring(0, 100) + '...',
          differences: {
            options_different: JSON.stringify(currentQ.options?.sort()) !== JSON.stringify(matchedQ.options?.sort()),
            answer_different: currentQ.correctAnswer !== matchedQ.correctAnswer
          }
        });
        
        // Check answer discrepancy
        if (currentQ.correctAnswer !== matchedQ.correctAnswer) {
          analysis.answer_discrepancies.push({
            id: currentQ.id,
            question: currentQ.question.substring(0, 100) + '...',
            current_answer: currentQ.correctAnswer,
            reference_answer: matchedQ.correctAnswer
          });
        }
      }
    } else {
      analysis.missing_from_reference.push({
        id: currentQ.id,
        question: currentQ.question.substring(0, 100) + '...'
      });
    }
  });
  
  // Output analysis
  console.log('\n=== PARSER AGENT A - QUESTIONS 1-120 ANALYSIS ===');
  console.log(JSON.stringify(analysis, null, 2));
  
  // Save analysis to file
  fs.writeFileSync(
    path.join(__dirname, 'parser_agent_a_analysis.json'),
    JSON.stringify(analysis, null, 2)
  );
  
  console.log('\nAnalysis saved to parser_agent_a_analysis.json');
  
} catch (error) {
  console.error('Error during analysis:', error.message);
  
  // Create basic analysis structure even if files are missing
  const basicAnalysis = {
    range: "1-120",
    total_processed: 0,
    exact_matches: [],
    partial_matches: [],
    missing_from_reference: [],
    answer_discrepancies: [],
    option_count_issues: [],
    error: error.message,
    note: "Could not complete full analysis due to missing files"
  };
  
  console.log(JSON.stringify(basicAnalysis, null, 2));
  
  fs.writeFileSync(
    path.join(__dirname, 'parser_agent_a_analysis.json'),
    JSON.stringify(basicAnalysis, null, 2)
  );
}