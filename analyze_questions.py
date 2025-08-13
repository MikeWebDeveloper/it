#!/usr/bin/env python3
"""
Script to analyze questions.json and webtext.md to find missing questions
"""
import json
import re
import sys
from pathlib import Path

def analyze_existing_questions(json_file):
    """Analyze the existing questions.json file"""
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    question_numbers = []
    for question in data['questions']:
        if 'number' in question:
            question_numbers.append(question['number'])
    
    question_numbers.sort()
    print(f"Total questions in JSON: {len(question_numbers)}")
    print(f"Question numbers range: {min(question_numbers)} - {max(question_numbers)}")
    
    # Find gaps
    full_range = set(range(1, max(question_numbers) + 1))
    existing = set(question_numbers)
    missing = full_range - existing
    
    if missing:
        print(f"Missing question numbers: {sorted(missing)}")
    else:
        print("No gaps found in question numbering")
    
    return question_numbers, missing

def analyze_webtext_questions(webtext_file):
    """Analyze the webtext.md file to find all question numbers"""
    with open(webtext_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all question numbers
    pattern = r'^(\d+)\.\s+'
    matches = re.findall(pattern, content, re.MULTILINE)
    
    question_numbers = [int(match) for match in matches]
    question_numbers.sort()
    
    print(f"\nWebtext analysis:")
    print(f"Total question entries found: {len(question_numbers)}")
    if question_numbers:
        print(f"Question numbers range: {min(question_numbers)} - {max(question_numbers)}")
        print(f"Unique questions: {len(set(question_numbers))}")
        
        # Check for duplicates
        seen = set()
        duplicates = set()
        for num in question_numbers:
            if num in seen:
                duplicates.add(num)
            else:
                seen.add(num)
        
        if duplicates:
            print(f"Duplicate question numbers: {sorted(duplicates)}")
    
    return question_numbers

def main():
    json_file = "/Users/michallatal/Desktop/it/it-quiz-app/src/data/questions.json"
    webtext_file = "/Users/michallatal/Desktop/it/webtext.md"
    
    if not Path(json_file).exists():
        print(f"Error: {json_file} not found")
        return
    
    if not Path(webtext_file).exists():
        print(f"Error: {webtext_file} not found")
        return
    
    print("Analyzing questions.json...")
    json_questions, missing_from_json = analyze_existing_questions(json_file)
    
    print("\nAnalyzing webtext.md...")
    webtext_questions = analyze_webtext_questions(webtext_file)
    
    print(f"\nComparison:")
    print(f"Questions in JSON: {len(set(json_questions))}")
    print(f"Questions in webtext: {len(set(webtext_questions))}")
    
    webtext_set = set(webtext_questions)
    json_set = set(json_questions)
    
    in_webtext_not_json = webtext_set - json_set
    in_json_not_webtext = json_set - webtext_set
    
    if in_webtext_not_json:
        print(f"Questions in webtext but not in JSON: {sorted(in_webtext_not_json)}")
    
    if in_json_not_webtext:
        print(f"Questions in JSON but not in webtext: {sorted(in_json_not_webtext)}")

if __name__ == "__main__":
    main()