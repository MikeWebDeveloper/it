const fs = require('fs');
const path = require('path');

// Read the webtext.md file
const webtextPath = path.join(__dirname, '../../webtext.md');
const content = fs.readFileSync(webtextPath, 'utf8');

// Clean and normalize text
const cleanText = (text) => {
  return text.replace(/\s+/g, ' ').replace(/[""]/g, '"').trim();
};

// Enhanced categorization with more keywords
const categorizeQuestion = (questionText, explanation = '') => {
  const text = (questionText + ' ' + explanation).toLowerCase();
  
  const categories = {
    'Hardware Safety': ['esd', 'electrostatic', 'static', 'grounded', 'safety', 'shock', 'high voltage', 'laser printer', 'hot components'],
    'Hardware': ['motherboard', 'cpu', 'processor', 'ram', 'memory', 'bios', 'uefi', 'chipset', 'atx', 'pci', 'sata', 'power supply', 'thermal', 'heat sink', 'expansion slot'],
    'Networking': ['network', 'tcp', 'udp', 'ip address', 'dhcp', 'dns', 'ethernet', 'wifi', 'wireless', 'router', 'switch', 'protocol', 'subnet', 'vlan', 'ping'],
    'Operating Systems': ['windows', 'linux', 'ubuntu', 'operating system', 'boot', 'file system', 'registry', 'partition', 'administrator', 'permissions', 'driver'],
    'Security': ['security', 'password', 'encryption', 'firewall', 'malware', 'virus', 'antivirus', 'authentication', 'authorization', 'certificate', 'vpn'],
    'Troubleshooting': ['troubleshoot', 'diagnostic', 'repair', 'fix', 'problem', 'error', 'issue', 'failure', 'debug', 'resolve'],
    'Printers': ['printer', 'print', 'toner', 'laser', 'inkjet', 'cartridge', 'paper jam', 'print queue', 'driver'],
    'Mobile Devices': ['mobile', 'smartphone', 'tablet', 'android', 'ios', 'iphone', 'ipad', 'bluetooth', 'cellular', 'app'],
    'Cloud Computing': ['cloud', 'saas', 'paas', 'iaas', 'virtual', 'vm', 'virtualization', 'hypervisor', 'aws', 'azure'],
    'Command Line': ['command', 'cmd', 'terminal', 'shell', 'bash', 'powershell', 'script']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }
  
  return 'General IT';
};

// Parse questions with better structure detection
const parseQuestionsAdvanced = (content) => {
  const questions = [];
  const sections = content.split(/(?=\n\d+\.\s)/);
  
  for (let section of sections) {
    if (!section.trim()) continue;
    
    const lines = section.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length === 0) continue;
    
    // Extract question number and text
    const firstLine = lines[0];
    const questionMatch = firstLine.match(/^(\d+)\.\s*(.+)/);
    if (!questionMatch) continue;
    
    const questionNumber = parseInt(questionMatch[1]);
    const questionText = cleanText(questionMatch[2]);
    
    // Find options and explanation
    const options = [];
    let explanation = '';
    let explanationFound = false;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for explanation
      if (line.toLowerCase().startsWith('explanation:')) {
        explanationFound = true;
        explanation = cleanText(line.replace(/^explanation:\s*/i, ''));
        continue;
      }
      
      if (explanationFound) {
        explanation += ' ' + cleanText(line);
        continue;
      }
      
      // Skip metadata lines
      if (line.toLowerCase().includes('choose') || 
          line.toLowerCase().includes('case') ||
          line.toLowerCase().includes('other case') ||
          line === '' ||
          line.length < 3) {
        continue;
      }
      
      // This should be an option
      if (options.length < 6) { // Limit options
        options.push(cleanText(line));
      }
    }
    
    // Clean up options - remove duplicates and very short ones
    const cleanOptions = [...new Set(options)]
      .filter(opt => opt.length > 3 && !opt.toLowerCase().includes('explanation'))
      .slice(0, 4);
    
    if (cleanOptions.length < 2) continue; // Skip questions with too few options
    
    // Try to determine correct answer (this is a best guess)
    let correctAnswer = cleanOptions[0]; // Default to first option
    
    // Look for hints in the explanation
    if (explanation) {
      for (const option of cleanOptions) {
        const optionWords = option.toLowerCase().split(' ');
        const explanationLower = explanation.toLowerCase();
        
        // If option words appear prominently in explanation
        if (optionWords.some(word => word.length > 3 && explanationLower.includes(word))) {
          correctAnswer = option;
          break;
        }
      }
    }
    
    const question = {
      id: questionNumber,
      number: questionNumber,
      question: questionText,
      options: cleanOptions,
      correct_answer: correctAnswer,
      explanation: explanation || undefined,
      topic: categorizeQuestion(questionText, explanation),
      difficulty: 'medium'
    };
    
    questions.push(question);
  }
  
  return questions;
};

// Parse questions
console.log('Parsing questions...');
const parsedQuestions = parseQuestionsAdvanced(content);

// Sort by question number
parsedQuestions.sort((a, b) => a.number - b.number);

// Create topics list
const topics = [...new Set(parsedQuestions.map(q => q.topic))].sort();

// Create final data structure
const questionData = {
  exam_info: {
    title: "IT Essentials 7.0 8.0 Course Final Exam – Composite (Chapters 1-14)",
    source: "ITExamAnswers.net",
    total_questions: parsedQuestions.length,
    topics: topics,
    description: "Comprehensive IT Essentials exam covering hardware, networking, operating systems, security, troubleshooting, and more.",
    last_updated: new Date().toISOString().split('T')[0],
    difficulty_levels: ['easy', 'medium', 'hard'],
    question_types: ['single_choice', 'multiple_choice']
  },
  questions: parsedQuestions
};

// Save to file
const outputPath = path.join(__dirname, '../src/data/questions-complete.json');
fs.writeFileSync(outputPath, JSON.stringify(questionData, null, 2));

console.log(`\n✅ Successfully parsed ${parsedQuestions.length} questions!`);
console.log(`📁 Saved to: questions-complete.json`);

console.log('\n📊 Topic breakdown:');
topics.forEach(topic => {
  const count = parsedQuestions.filter(q => q.topic === topic).length;
  console.log(`  ${topic}: ${count} questions`);
});

console.log('\n🔍 Sample questions:');
parsedQuestions.slice(0, 3).forEach(q => {
  console.log(`\nQ${q.number}: ${q.question.substring(0, 80)}...`);
  console.log(`Topic: ${q.topic}`);
  console.log(`Options: ${q.options.length}`);
});