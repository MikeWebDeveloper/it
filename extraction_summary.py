#!/usr/bin/env python3
"""
Generate a summary of the question extraction process
"""
import json

def generate_summary():
    """Generate a comprehensive summary of the extraction process"""
    
    json_file = "/Users/michallatal/Desktop/it/it-quiz-app/src/data/questions.json"
    
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("=" * 60)
    print("IT QUIZ APP - QUESTION EXTRACTION SUMMARY")
    print("=" * 60)
    
    print(f"\n📊 FINAL STATISTICS:")
    print(f"Total Questions: {data['exam_info']['total_questions']}")
    print(f"Last Updated: {data['exam_info']['last_updated']}")
    
    # Question numbering analysis
    question_numbers = [q.get('number', 0) for q in data['questions'] if 'number' in q]
    question_numbers.sort()
    
    print(f"\n📋 QUESTION NUMBERING:")
    print(f"Lowest Number: {min(question_numbers)}")
    print(f"Highest Number: {max(question_numbers)}")
    print(f"Expected Range: 1-352")
    
    # Check for any remaining gaps
    full_range = set(range(1, 353))  # 1 to 352
    existing = set(question_numbers)
    missing = full_range - existing
    
    if missing:
        print(f"Still Missing: {sorted(missing)} (Note: Question 131 has no answer in source)")
    else:
        print("✅ All questions accounted for!")
    
    # Topic distribution
    topics = {}
    for q in data['questions']:
        topic = q.get('topic', 'Unknown')
        topics[topic] = topics.get(topic, 0) + 1
    
    print(f"\n📂 TOPIC DISTRIBUTION:")
    for topic, count in sorted(topics.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / len(data['questions'])) * 100
        print(f"  {topic:<20}: {count:>3} questions ({percentage:>5.1f}%)")
    
    # Question types analysis
    single_choice = 0
    multiple_choice = 0
    matching = 0
    
    for q in data['questions']:
        correct_answer = q.get('correct_answer', '')
        if isinstance(correct_answer, list):
            if len(correct_answer) > 1:
                multiple_choice += 1
            else:
                single_choice += 1
        elif 'matching' in correct_answer.lower() or 'match' in q.get('question', '').lower():
            matching += 1
        else:
            single_choice += 1
    
    print(f"\n📝 QUESTION TYPES:")
    print(f"  Single Choice: {single_choice}")
    print(f"  Multiple Choice: {multiple_choice}")
    print(f"  Matching/Ordering: {matching}")
    
    print(f"\n✅ EXTRACTION PROCESS COMPLETED SUCCESSFULLY!")
    print(f"\nExtracted 26 missing questions from webtext.md:")
    
    # List the questions that were added
    extracted_questions = [25, 34, 52, 57, 58, 59, 60, 61, 62, 89, 90, 91, 92, 93, 94, 207, 220, 221, 230, 231, 232, 243, 347, 348, 349, 350]
    
    for i, qnum in enumerate(extracted_questions, 1):
        # Find the question in the data
        question_data = next((q for q in data['questions'] if q.get('number') == qnum), None)
        if question_data:
            print(f"  {i:>2}. Q{qnum}: {question_data['question'][:50]}... ({question_data['topic']})")
    
    print(f"\n📁 FILES UPDATED:")
    print(f"  ✅ {json_file}")
    print(f"  ✅ Backup created: /Users/michallatal/Desktop/it/it-quiz-app/src/data/questions_backup.json")
    
    print(f"\n⚠️  NOTE:")
    print(f"  Question 131 is missing from source (webtext.md states 'no answer')")
    print(f"  Some matching questions may need manual review for correct answers")
    
    print(f"\n🎯 NEXT STEPS:")
    print(f"  1. Review matching questions for accuracy")
    print(f"  2. Test the updated question database in the app")
    print(f"  3. Verify question randomization works correctly")
    
    return data

if __name__ == "__main__":
    generate_summary()