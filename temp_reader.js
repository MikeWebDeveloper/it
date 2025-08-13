const fs = require('fs');
const path = require('path');

try {
    const questionsPath = path.join(__dirname, 'src', 'data', 'questions.json');
    const data = fs.readFileSync(questionsPath, 'utf8');
    console.log('Questions data loaded successfully');
    console.log('File size:', data.length, 'characters');
    
    const questions = JSON.parse(data);
    console.log('Total questions in database:', questions.length);
    
    // Extract questions 121-240 (indexes 120-239)
    const targetQuestions = questions.slice(120, 240);
    console.log('Questions 121-240 extracted:', targetQuestions.length);
    
    console.log('\n=== FIRST QUESTION IN RANGE (121) ===');
    console.log(JSON.stringify(targetQuestions[0], null, 2));
    
    console.log('\n=== LAST QUESTION IN RANGE (240) ===');
    console.log(JSON.stringify(targetQuestions[targetQuestions.length - 1], null, 2));
    
} catch (error) {
    console.error('Error reading questions file:', error.message);
}