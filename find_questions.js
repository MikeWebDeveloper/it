const fs = require('fs');
const path = require('path');

// Recursively search for JSON files that might contain questions
function findQuestionFiles(dir, maxDepth = 3, currentDepth = 0) {
    const results = [];
    
    if (currentDepth >= maxDepth) return results;
    
    try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                results.push(...findQuestionFiles(fullPath, maxDepth, currentDepth + 1));
            } else if (stats.isFile() && item.endsWith('.json')) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const data = JSON.parse(content);
                    
                    // Check if this looks like a questions database
                    let isQuestionFile = false;
                    let questionCount = 0;
                    
                    if (Array.isArray(data)) {
                        // Direct array format
                        if (data.length > 0 && data[0].question) {
                            isQuestionFile = true;
                            questionCount = data.length;
                        }
                    } else if (data.questions && Array.isArray(data.questions)) {
                        // Wrapped format
                        if (data.questions.length > 0 && data.questions[0].question) {
                            isQuestionFile = true;
                            questionCount = data.questions.length;
                        }
                    }
                    
                    if (isQuestionFile) {
                        results.push({
                            path: fullPath,
                            format: Array.isArray(data) ? 'direct_array' : 'wrapped_object',
                            questionCount,
                            size: Buffer.byteLength(content, 'utf8'),
                            hasTargetRange: questionCount >= 358
                        });
                    }
                } catch (parseError) {
                    // Not a valid JSON or doesn't contain questions
                }
            }
        }
    } catch (error) {
        console.log(`Cannot read directory ${dir}: ${error.message}`);
    }
    
    return results;
}

// Main execution
console.log('🔍 Searching for question databases...');

const searchDirectories = [
    '/Users/michallatal/Desktop/it/it-quiz-app',
    '/Users/michallatal/Desktop/it-quiz-app', 
    process.cwd()
];

let foundFiles = [];

for (const searchDir of searchDirectories) {
    if (fs.existsSync(searchDir)) {
        console.log(`\n📂 Searching in: ${searchDir}`);
        const files = findQuestionFiles(searchDir);
        foundFiles.push(...files);
    }
}

if (foundFiles.length === 0) {
    console.log('\n❌ No question databases found');
    console.log('\n📁 Directory structure analysis:');
    
    for (const searchDir of searchDirectories) {
        if (fs.existsSync(searchDir)) {
            console.log(`\n${searchDir}:`);
            try {
                const items = fs.readdirSync(searchDir);
                items.slice(0, 10).forEach(item => {
                    const itemPath = path.join(searchDir, item);
                    const stats = fs.statSync(itemPath);
                    console.log(`  ${stats.isDirectory() ? '📁' : '📄'} ${item}`);
                });
                if (items.length > 10) {
                    console.log(`  ... and ${items.length - 10} more items`);
                }
            } catch (error) {
                console.log(`  Error: ${error.message}`);
            }
        }
    }
} else {
    console.log('\n✅ Found question databases:');
    foundFiles.forEach((file, index) => {
        console.log(`\n${index + 1}. ${file.path}`);
        console.log(`   Format: ${file.format}`);
        console.log(`   Questions: ${file.questionCount}`);
        console.log(`   Size: ${file.size} bytes`);
        console.log(`   Has target range (358+): ${file.hasTargetRange ? 'Yes' : 'No'}`);
    });
    
    // If we found files, let's analyze the best candidate
    const bestCandidate = foundFiles.find(f => f.hasTargetRange) || foundFiles[0];
    
    if (bestCandidate) {
        console.log(`\n🎯 Analyzing best candidate: ${bestCandidate.path}`);
        
        try {
            const content = fs.readFileSync(bestCandidate.path, 'utf8');
            const data = JSON.parse(content);
            
            let questions = Array.isArray(data) ? data : data.questions;
            
            if (questions.length >= 358) {
                // Parse questions 241-358
                const targetQuestions = questions.slice(240, 358);
                
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
                
                targetQuestions.forEach((question, index) => {
                    const questionNumber = 241 + index;
                    
                    // Check structure
                    if (!question.question || !question.options || !question.answer) {
                        analysis.structural_issues.push({
                            question_number: questionNumber,
                            issue: "Missing required fields"
                        });
                        return;
                    }
                    
                    // Count options
                    const optionsCount = Array.isArray(question.options) ? question.options.length : 
                                        Object.keys(question.options || {}).length;
                    
                    if (optionsCount >= 4) {
                        analysis.questions_with_4_plus_options.push(questionNumber);
                    } else {
                        analysis.questions_with_less_than_4_options.push(questionNumber);
                    }
                    
                    // Check answer type
                    if (Array.isArray(question.answer)) {
                        analysis.multiple_choice_questions.push(questionNumber);
                    } else {
                        analysis.single_choice_questions.push(questionNumber);
                    }
                    
                    // Track topics
                    const topic = question.topic || question.category || question.subject || 'Uncategorized';
                    analysis.topics_covered[topic] = (analysis.topics_covered[topic] || 0) + 1;
                });
                
                console.log('\n=== PARSER AGENT C - PHASE 1 ANALYSIS ===');
                console.log(JSON.stringify(analysis, null, 2));
                
                console.log('\n=== SAMPLE QUESTION (241) ===');
                console.log(JSON.stringify(targetQuestions[0], null, 2));
                
                console.log('\n✅ Parser Agent C - Phase 1 Complete');
                console.log(`✅ Successfully parsed ${analysis.total_processed} questions (241-358)`);
                console.log('✅ Ready for topic validation agents deployment');
                
            } else {
                console.log(`❌ Insufficient questions: ${questions.length} (need 358+)`);
            }
            
        } catch (error) {
            console.log(`❌ Error analyzing file: ${error.message}`);
        }
    }
}