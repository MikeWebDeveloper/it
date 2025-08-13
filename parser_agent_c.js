const fs = require('fs');
const path = require('path');

// Parser Agent C - Phase 1: Questions 241-358 Analysis
function parseQuestionsRange() {
    try {
        // Read the questions database
        const questionsPath = path.join(__dirname, 'src', 'data', 'questions.json');
        const data = fs.readFileSync(questionsPath, 'utf8');
        const questionsData = JSON.parse(data);
        
        // Extract questions 241-358 (index 240-357 in 0-based array)
        const questions = questionsData.questions || questionsData;
        const targetQuestions = questions.slice(240, 358); // Questions 241-358
        
        console.log(`Total questions in database: ${questions.length}`);
        console.log(`Target range: 241-358 (${targetQuestions.length} questions)`);
        
        // Initialize analysis results
        const analysis = {
            range: "241-358",
            total_processed: targetQuestions.length,
            questions_with_4_plus_options: [],
            questions_with_less_than_4_options: [],
            multiple_choice_questions: [],
            single_choice_questions: [],
            topics_covered: {},
            structural_issues: []
        };
        
        // Analyze each question
        targetQuestions.forEach((question, index) => {
            const questionNumber = 241 + index;
            
            // Check question structure
            if (!question.question || !question.options || !question.answer) {
                analysis.structural_issues.push({
                    question_number: questionNumber,
                    issue: "Missing required fields (question, options, or answer)"
                });
                return;
            }
            
            // Count answer options
            const optionsCount = Array.isArray(question.options) ? question.options.length : 0;
            
            if (optionsCount >= 4) {
                analysis.questions_with_4_plus_options.push(questionNumber);
            } else {
                analysis.questions_with_less_than_4_options.push(questionNumber);
            }
            
            // Check if answer is multiple choice (array) or single choice
            if (Array.isArray(question.answer)) {
                analysis.multiple_choice_questions.push(questionNumber);
            } else {
                analysis.single_choice_questions.push(questionNumber);
            }
            
            // Track topics/categories
            const topic = question.topic || question.category || question.subject || 'Uncategorized';
            if (!analysis.topics_covered[topic]) {
                analysis.topics_covered[topic] = 0;
            }
            analysis.topics_covered[topic]++;
        });
        
        // Generate detailed summary
        console.log('\n=== PARSER AGENT C - PHASE 1 ANALYSIS ===');
        console.log(JSON.stringify(analysis, null, 2));
        
        // Additional statistics
        console.log('\n=== ADDITIONAL STATISTICS ===');
        console.log(`Questions with 4+ options: ${analysis.questions_with_4_plus_options.length}`);
        console.log(`Questions with <4 options: ${analysis.questions_with_less_than_4_options.length}`);
        console.log(`Multiple choice questions: ${analysis.multiple_choice_questions.length}`);
        console.log(`Single choice questions: ${analysis.single_choice_questions.length}`);
        console.log(`Structural issues found: ${analysis.structural_issues.length}`);
        console.log(`Topics covered: ${Object.keys(analysis.topics_covered).length}`);
        
        // Sample question analysis
        if (targetQuestions.length > 0) {
            console.log('\n=== SAMPLE QUESTION STRUCTURE ===');
            console.log('Question 241 structure:');
            console.log(JSON.stringify(targetQuestions[0], null, 2));
        }
        
        return analysis;
        
    } catch (error) {
        console.error('Error parsing questions database:', error.message);
        
        // Check if file exists
        const questionsPath = path.join(__dirname, 'src', 'data', 'questions.json');
        if (!fs.existsSync(questionsPath)) {
            console.error(`File not found: ${questionsPath}`);
            console.log('Available files in src/data:');
            try {
                const dataDir = path.join(__dirname, 'src', 'data');
                if (fs.existsSync(dataDir)) {
                    const files = fs.readdirSync(dataDir);
                    files.forEach(file => console.log(`  - ${file}`));
                } else {
                    console.log('src/data directory does not exist');
                }
            } catch (dirError) {
                console.error('Could not read src/data directory:', dirError.message);
            }
        }
        
        return null;
    }
}

// Execute the parser
const result = parseQuestionsRange();

if (result) {
    console.log('\n=== PARSER AGENT C COMPLETE ===');
    console.log('✅ Successfully parsed questions 241-358');
    console.log('✅ Data structure validated');
    console.log('✅ Ready for topic validation agents deployment');
} else {
    console.log('\n=== PARSER AGENT C FAILED ===');
    console.log('❌ Could not complete parsing phase');
    console.log('❌ Please check file path and database structure');
}