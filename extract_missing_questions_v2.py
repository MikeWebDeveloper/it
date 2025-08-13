#!/usr/bin/env python3
"""
Enhanced script to extract missing questions from webtext.md with better parsing
"""
import json
import re
import sys
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional

def load_existing_questions(json_file: str) -> Tuple[Dict[str, Any], List[int]]:
    """Load existing questions and return data structure and existing question numbers"""
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    existing_numbers = set()
    for question in data['questions']:
        if 'number' in question:
            existing_numbers.add(question['number'])
    
    return data, existing_numbers

def extract_single_question(webtext_content: str, question_number: int) -> Optional[Dict[str, Any]]:
    """Extract a single question from webtext with better parsing"""
    
    # Find the question start and end
    question_start_pattern = rf'^{question_number}\.\s+(.*?)$'
    next_question_pattern = rf'^{question_number + 1}\.\s+'
    
    lines = webtext_content.split('\n')
    start_idx = -1
    end_idx = len(lines)
    
    # Find the start of this question
    for i, line in enumerate(lines):
        if re.match(question_start_pattern, line):
            start_idx = i
            break
    
    if start_idx == -1:
        return None
    
    # Find the end (start of next question)
    for i in range(start_idx + 1, len(lines)):
        if re.match(r'^\d+\.\s+', lines[i]):
            end_idx = i
            break
    
    # Extract the question content
    question_lines = lines[start_idx:end_idx]
    
    if not question_lines:
        return None
    
    # Parse the question
    question_text = re.sub(question_start_pattern, r'\1', question_lines[0]).strip()
    
    # Clean the question text
    question_text = re.sub(r'\s+', ' ', question_text).strip()
    
    # Find options and explanation
    options = []
    explanation = ""
    correct_answers = []
    
    i = 1
    while i < len(question_lines):
        line = question_lines[i].strip()
        
        if not line:
            i += 1
            continue
        
        # Check for explanation
        if line.lower().startswith('explanation:'):
            explanation = line[12:].strip()
            # Continue reading explanation lines
            i += 1
            while i < len(question_lines):
                next_line = question_lines[i].strip()
                if not next_line or next_line.lower().startswith('other case'):
                    break
                explanation += " " + next_line
                i += 1
            break
        
        # Skip certain lines
        if (line.lower().startswith('other case') or 
            line.lower().startswith('case') or
            line.startswith('(') and line.endswith(')') or
            len(line) < 3):
            i += 1
            continue
        
        # This could be an option
        # Simple heuristic: lines that are not too long and don't end with colon
        if len(line) < 150 and not line.endswith(':') and not line.lower().startswith('explanation'):
            options.append(line)
        
        i += 1
    
    # Determine topic
    topic = determine_topic(question_text + " " + " ".join(options))
    
    # Try to identify correct answers from explanation or common patterns
    correct_answer = identify_correct_answer(options, explanation, question_text)
    
    result = {
        "id": 1000 + question_number,  # Temporary ID
        "number": question_number,
        "question": question_text,
        "options": options[:4] if len(options) >= 4 else options,
        "correct_answer": correct_answer,
        "explanation": explanation.strip(),
        "topic": topic,
        "difficulty": "medium"
    }
    
    return result

def determine_topic(content: str) -> str:
    """Determine the topic category based on content analysis"""
    content_lower = content.lower()
    
    topic_keywords = {
        "Hardware": ["motherboard", "cpu", "processor", "ram", "memory", "hard drive", "ssd", "hdd", "gpu", "graphics", "pci", "sata", "usb", "power supply", "cooling", "fan", "heat sink", "raid"],
        "Hardware Safety": ["esd", "electrostatic", "grounded", "static", "safety", "shock", "electrical"],
        "Networking": ["network", "router", "switch", "tcp", "ip", "ethernet", "wifi", "wireless", "lan", "wan", "man", "pan", "dns", "dhcp", "ping", "tracert", "subnet", "cable", "dsl"],
        "Operating Systems": ["windows", "linux", "macos", "boot", "bios", "uefi", "registry", "file system", "ntfs", "fat32", "kernel", "driver", "service", "acpi", "power state", "bootmgr", "winload"],
        "Security": ["password", "encryption", "firewall", "antivirus", "malware", "authentication", "authorization", "certificate", "vpn", "security", "attack"],
        "Troubleshooting": ["troubleshoot", "problem", "issue", "error", "debug", "diagnose", "fix", "repair", "symptom", "solution", "stages"],
        "Mobile Devices": ["mobile", "tablet", "smartphone", "ios", "android", "cellular", "bluetooth", "wifi calling", "app", "touch"],
        "Printers": ["printer", "print", "toner", "ink", "paper", "laser", "inkjet", "scanner", "fax"],
        "Cloud Computing": ["cloud", "saas", "paas", "iaas", "virtual", "remote", "online", "internet"],
        "Command Line": ["command", "cmd", "terminal", "shell", "cli", "tracert", "ping", "ipconfig", "netstat"]
    }
    
    # Count matches for each topic
    topic_scores = {}
    for topic, keywords in topic_keywords.items():
        score = sum(1 for keyword in keywords if keyword in content_lower)
        if score > 0:
            topic_scores[topic] = score
    
    if topic_scores:
        return max(topic_scores, key=topic_scores.get)
    else:
        return "General IT"

def identify_correct_answer(options: List[str], explanation: str, question: str) -> str:
    """Try to identify the correct answer from explanation or question context"""
    
    if not options:
        return ""
    
    explanation_lower = explanation.lower()
    question_lower = question.lower()
    
    # Look for explicit mentions in explanation
    for option in options:
        option_lower = option.lower()
        # Check if the option is mentioned positively in the explanation
        if option_lower in explanation_lower:
            # Look for positive indicators
            option_pos = explanation_lower.find(option_lower)
            if option_pos != -1:
                surrounding_text = explanation_lower[max(0, option_pos-50):option_pos+50]
                if any(word in surrounding_text for word in ['is', 'are', 'provides', 'allows', 'correct', 'best', 'should', 'can']):
                    return option
    
    # For matching questions or special cases, return the first option for manual review
    if 'match' in question_lower or 'place' in question_lower or 'select' in question_lower:
        return options[0] if options else ""
    
    # Default to first option for manual review
    return options[0] if options else ""

def main():
    json_file = "/Users/michallatal/Desktop/it/it-quiz-app/src/data/questions.json"
    webtext_file = "/Users/michallatal/Desktop/it/webtext.md"
    output_file = "/Users/michallatal/Desktop/it/it-quiz-app/missing_questions_v2.json"
    
    # Missing questions from analysis
    missing_numbers = [25, 34, 52, 57, 58, 59, 60, 61, 62, 89, 90, 91, 92, 93, 94, 207, 220, 221, 230, 231, 232, 243, 347, 348, 349, 350]
    
    print(f"Extracting {len(missing_numbers)} missing questions...")
    
    with open(webtext_file, 'r', encoding='utf-8') as f:
        webtext_content = f.read()
    
    extracted_questions = []
    failed_extractions = []
    
    for question_number in sorted(missing_numbers):
        print(f"Extracting question {question_number}...")
        
        question_data = extract_single_question(webtext_content, question_number)
        
        if question_data and question_data['question']:
            extracted_questions.append(question_data)
            print(f"  ✓ {question_data['question'][:60]}...")
            print(f"    Options: {len(question_data['options'])}, Topic: {question_data['topic']}")
        else:
            failed_extractions.append(question_number)
            print(f"  ✗ Failed to extract question {question_number}")
    
    print(f"\nExtraction Summary:")
    print(f"Successfully extracted: {len(extracted_questions)}")
    print(f"Failed: {len(failed_extractions)}")
    if failed_extractions:
        print(f"Failed questions: {failed_extractions}")
    
    # Save results
    output_data = {
        "extracted_questions": extracted_questions,
        "failed_extractions": failed_extractions,
        "extraction_info": {
            "total_extracted": len(extracted_questions),
            "total_failed": len(failed_extractions),
            "missing_numbers": missing_numbers,
            "extraction_date": "2025-08-13",
            "note": "Review and verify correct answers before merging"
        }
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nResults saved to: {output_file}")
    
    # Show samples
    print(f"\nSample extracted questions:")
    for q in extracted_questions[:5]:
        print(f"\nQ{q['number']}: {q['question']}")
        print(f"Options ({len(q['options'])}): {q['options']}")
        print(f"Correct: {q['correct_answer']}")
        print(f"Topic: {q['topic']}")

if __name__ == "__main__":
    main()