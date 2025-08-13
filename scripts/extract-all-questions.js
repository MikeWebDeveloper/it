const fs = require('fs');
const path = require('path');

// Read the webtext.md file
const webtextPath = path.join(__dirname, '../../webtext.md');
const content = fs.readFileSync(webtextPath, 'utf8');

// Function to clean text
const cleanText = (text) => {
  return text.replace(/\s+/g, ' ').trim();
};

// Function to categorize questions based on content
const categorizeQuestion = (questionText, explanation = '') => {
  const text = (questionText + ' ' + explanation).toLowerCase();
  
  if (text.includes('esd') || text.includes('electrostatic') || text.includes('safety') || text.includes('voltage') || text.includes('grounded')) {
    return 'Hardware Safety';
  }
  if (text.includes('motherboard') || text.includes('cpu') || text.includes('ram') || text.includes('bios') || text.includes('uefi') || text.includes('chipset') || text.includes('hardware') || text.includes('component')) {
    return 'Hardware';
  }
  if (text.includes('network') || text.includes('tcp') || text.includes('udp') || text.includes('ip') || text.includes('dhcp') || text.includes('dns') || text.includes('ethernet') || text.includes('wifi') || text.includes('wireless')) {
    return 'Networking';
  }
  if (text.includes('printer') || text.includes('toner') || text.includes('laser') || text.includes('inkjet') || text.includes('print')) {
    return 'Printers';
  }
  if (text.includes('windows') || text.includes('linux') || text.includes('operating system') || text.includes('os') || text.includes('boot') || text.includes('file system')) {
    return 'Operating Systems';
  }
  if (text.includes('mobile') || text.includes('smartphone') || text.includes('tablet') || text.includes('android') || text.includes('ios') || text.includes('bluetooth')) {
    return 'Mobile Devices';
  }
  if (text.includes('cloud') || text.includes('saas') || text.includes('paas') || text.includes('iaas') || text.includes('virtual')) {
    return 'Cloud Computing';
  }
  if (text.includes('security') || text.includes('password') || text.includes('encryption') || text.includes('firewall') || text.includes('malware') || text.includes('virus')) {
    return 'Security';
  }
  if (text.includes('troubleshoot') || text.includes('problem') || text.includes('error') || text.includes('diagnostic') || text.includes('repair')) {
    return 'Troubleshooting';
  }
  
  return 'General IT';
};

// Parse questions from content
const parseQuestions = (content) => {
  const questions = [];
  let questionNumber = 1;
  
  // Split content into sections and look for numbered questions
  const lines = content.split('\n');
  let currentQuestion = null;
  let collectingOptions = false;
  let collectingExplanation = false;
  let explanationLines = [];
  let optionLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for question numbers (e.g., "1.", "2.", etc.)
    const questionMatch = line.match(/^(\d+)\.\s*(.+)/);
    if (questionMatch) {
      // Save previous question if exists
      if (currentQuestion) {
        const explanation = explanationLines.join(' ').replace(/^Explanation:\s*/i, '').trim();
        const cleanedOptions = optionLines.filter(opt => opt.trim().length > 0);
        
        questions.push({
          number: currentQuestion.number,
          question: currentQuestion.text,
          options: cleanedOptions,
          correct_answer: findCorrectAnswer(cleanedOptions, explanation, lines, i),
          explanation: explanation || undefined,
          topic: categorizeQuestion(currentQuestion.text, explanation)
        });
      }
      
      // Start new question
      currentQuestion = {
        number: parseInt(questionMatch[1]),
        text: cleanText(questionMatch[2])
      };
      questionNumber = currentQuestion.number;
      collectingOptions = true;
      collectingExplanation = false;
      explanationLines = [];
      optionLines = [];
      continue;
    }
    
    // Look for explanation
    if (line.toLowerCase().startsWith('explanation:')) {
      collectingOptions = false;
      collectingExplanation = true;
      explanationLines = [line];
      continue;
    }
    
    // Collect explanation lines
    if (collectingExplanation && line.length > 0) {
      explanationLines.push(line);
      continue;
    }
    
    // Collect option lines (non-empty lines that don't start with numbers and aren't explanations)
    if (collectingOptions && line.length > 0 && !line.match(/^\d+\./) && !line.toLowerCase().startsWith('explanation')) {
      // Skip lines that look like headers or non-option content
      if (!line.toLowerCase().includes('case') && 
          !line.toLowerCase().includes('other case') &&
          !line.toLowerCase().includes('choose') &&
          line.length > 5) {
        optionLines.push(cleanText(line));
      }
    }
  }
  
  // Don't forget the last question
  if (currentQuestion) {
    const explanation = explanationLines.join(' ').replace(/^Explanation:\s*/i, '').trim();
    const cleanedOptions = optionLines.filter(opt => opt.trim().length > 0);
    
    questions.push({
      number: currentQuestion.number,
      question: currentQuestion.text,
      options: cleanedOptions,
      correct_answer: findCorrectAnswer(cleanedOptions, explanation, lines, lines.length),
      explanation: explanation || undefined,
      topic: categorizeQuestion(currentQuestion.text, explanation)
    });
  }
  
  return questions;
};

// Function to find correct answer (simplified approach)
const findCorrectAnswer = (options, explanation, allLines, currentIndex) => {
  // For now, return the first option as we'd need more sophisticated parsing
  // to determine correct answers from the text format
  return options[0] || 'Option not found';
};

// Parse all questions
const allQuestions = parseQuestions(content);

// Create topic summary
const topics = [...new Set(allQuestions.map(q => q.topic))].sort();
console.log(`Extracted ${allQuestions.length} questions`);
console.log('Topics found:', topics);

// Create the new questions structure
const questionData = {
  exam_info: {
    title: "IT Essentials 7.0 8.0 Course Final Exam – Composite (Chapters 1-14)",
    source: "ITExamAnswers.net",
    total_questions: allQuestions.length,
    topics: topics,
    description: "Comprehensive IT Essentials exam covering all major topics including hardware, networking, security, and troubleshooting.",
    last_updated: new Date().toISOString().split('T')[0]
  },
  questions: allQuestions.map((q, index) => ({
    id: index + 1,
    number: q.number,
    question: q.question,
    options: q.options.slice(0, 4), // Limit to 4 options max
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    topic: q.topic,
    difficulty: 'medium' // Default difficulty
  }))
};

// Save to file
const outputPath = path.join(__dirname, '../src/data/questions-full.json');
fs.writeFileSync(outputPath, JSON.stringify(questionData, null, 2));

console.log(`\nSaved ${questionData.questions.length} questions to questions-full.json`);
console.log('\nTopic breakdown:');
topics.forEach(topic => {
  const count = allQuestions.filter(q => q.topic === topic).length;
  console.log(`  ${topic}: ${count} questions`);
});