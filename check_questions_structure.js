const fs = require('fs');
const path = require('path');

// Check the structure of the questions database
function checkQuestionsStructure() {
    const possiblePaths = [
        '/Users/michallatal/Desktop/it/it-quiz-app/src/data/questions.json',
        '/Users/michallatal/Desktop/it-quiz-app/src/data/questions.json',
        './src/data/questions.json',
        './questions.json'
    ];
    
    console.log('🔍 Searching for questions database...');
    
    for (const filePath of possiblePaths) {
        try {
            if (fs.existsSync(filePath)) {
                console.log(`✅ Found questions database: ${filePath}`);
                
                const data = fs.readFileSync(filePath, 'utf8');
                const jsonData = JSON.parse(data);
                
                // Analyze structure
                console.log('\n📊 Database Structure Analysis:');
                console.log(`Total size: ${Buffer.byteLength(data, 'utf8')} bytes`);
                
                if (Array.isArray(jsonData)) {
                    console.log(`Format: Direct array with ${jsonData.length} questions`);
                    if (jsonData.length > 0) {
                        console.log('\n📝 Sample question structure:');
                        console.log(JSON.stringify(jsonData[0], null, 2));
                        
                        if (jsonData.length >= 358) {
                            console.log('\n🎯 Target range 241-358 check:');
                            console.log(`Question 241 exists: ${jsonData[240] ? 'Yes' : 'No'}`);
                            console.log(`Question 358 exists: ${jsonData[357] ? 'Yes' : 'No'}`);
                            
                            if (jsonData[240]) {
                                console.log('\n📋 Question 241 structure:');
                                console.log(JSON.stringify(jsonData[240], null, 2));
                            }
                        } else {
                            console.log(`❌ Database only contains ${jsonData.length} questions, but we need at least 358`);
                        }
                    }
                } else if (jsonData.questions && Array.isArray(jsonData.questions)) {
                    console.log(`Format: Object with questions array (${jsonData.questions.length} questions)`);
                    if (jsonData.questions.length > 0) {
                        console.log('\n📝 Sample question structure:');
                        console.log(JSON.stringify(jsonData.questions[0], null, 2));
                        
                        if (jsonData.questions.length >= 358) {
                            console.log('\n🎯 Target range 241-358 check:');
                            console.log(`Question 241 exists: ${jsonData.questions[240] ? 'Yes' : 'No'}`);
                            console.log(`Question 358 exists: ${jsonData.questions[357] ? 'Yes' : 'No'}`);
                            
                            if (jsonData.questions[240]) {
                                console.log('\n📋 Question 241 structure:');
                                console.log(JSON.stringify(jsonData.questions[240], null, 2));
                            }
                        } else {
                            console.log(`❌ Database only contains ${jsonData.questions.length} questions, but we need at least 358`);
                        }
                    }
                } else {
                    console.log('Format: Unknown structure');
                    console.log('Top-level keys:', Object.keys(jsonData));
                }
                
                return { filePath, data: jsonData };
            }
        } catch (error) {
            console.log(`❌ Error reading ${filePath}: ${error.message}`);
        }
    }
    
    console.log('\n❌ No questions database found in any expected location');
    console.log('\n📁 Checking directory structure...');
    
    // Check what's actually in the directories
    const checkDirs = [
        '/Users/michallatal/Desktop/it/it-quiz-app',
        '/Users/michallatal/Desktop/it-quiz-app'
    ];
    
    for (const dir of checkDirs) {
        try {
            if (fs.existsSync(dir)) {
                console.log(`\n📂 Contents of ${dir}:`);
                const items = fs.readdirSync(dir);
                items.forEach(item => {
                    const itemPath = path.join(dir, item);
                    const stats = fs.statSync(itemPath);
                    console.log(`  ${stats.isDirectory() ? '📁' : '📄'} ${item}`);
                });
                
                const srcPath = path.join(dir, 'src');
                if (fs.existsSync(srcPath)) {
                    console.log(`\n📂 Contents of ${srcPath}:`);
                    const srcItems = fs.readdirSync(srcPath);
                    srcItems.forEach(item => {
                        const itemPath = path.join(srcPath, item);
                        const stats = fs.statSync(itemPath);
                        console.log(`  ${stats.isDirectory() ? '📁' : '📄'} ${item}`);
                    });
                    
                    const dataPath = path.join(srcPath, 'data');
                    if (fs.existsSync(dataPath)) {
                        console.log(`\n📂 Contents of ${dataPath}:`);
                        const dataItems = fs.readdirSync(dataPath);
                        dataItems.forEach(item => {
                            const itemPath = path.join(dataPath, item);
                            const stats = fs.statSync(itemPath);
                            console.log(`  ${stats.isDirectory() ? '📁' : '📄'} ${item}`);
                        });
                    }
                }
            }
        } catch (error) {
            console.log(`Error checking ${dir}: ${error.message}`);
        }
    }
    
    return null;
}

// Execute the check
checkQuestionsStructure();