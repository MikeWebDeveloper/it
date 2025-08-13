#!/usr/bin/env python3
"""
Script to merge extracted missing questions into questions.json with manual corrections
"""
import json
from pathlib import Path

def create_corrected_questions():
    """Create manually corrected versions of the extracted questions"""
    
    corrected_questions = [
        {
            "id": 333,
            "number": 25,
            "question": "Which type of network spans a single building or campus and provides services and applications to people within a common organizational structure?",
            "options": ["PAN", "WAN", "LAN", "MAN"],
            "correct_answer": "LAN",
            "explanation": "A LAN is smaller or more contained than a WAN, which can span several cities. A MAN is usually contained in one city. A PAN is a very small network of devices that are located in close proximity to one another, usually within range of a single person.",
            "topic": "Networking",
            "difficulty": "medium"
        },
        {
            "id": 334,
            "number": 34,
            "question": "Place the six stages of the troubleshooting process in the correct order.",
            "options": ["1. Identify the problem", "2. Establish a theory", "3. Test the theory", "4. Establish a plan", "5. Implement the solution", "6. Verify functionality"],
            "correct_answer": ["1. Identify the problem", "2. Establish a theory", "3. Test the theory", "4. Establish a plan", "5. Implement the solution", "6. Verify functionality"],
            "explanation": "The six stages of troubleshooting in order are: 1) Identify the problem, 2) Establish a theory of probable cause, 3) Test the theory to determine the cause, 4) Establish a plan of action to resolve the problem, 5) Implement the solution, 6) Verify full system functionality.",
            "topic": "Troubleshooting",
            "difficulty": "medium"
        },
        {
            "id": 335,
            "number": 52,
            "question": "Match the memory type to the feature. (Not all options are used.)",
            "options": ["DDR3", "DDR4", "ECC", "SO-DIMM", "Dual Channel", "Buffered"],
            "correct_answer": "Multiple matching pairs",
            "explanation": "This is a matching question where different memory types need to be paired with their corresponding features.",
            "topic": "Hardware",
            "difficulty": "medium"
        },
        {
            "id": 336,
            "number": 57,
            "question": "Match the problem to the possible solution. (Not all options are used.)",
            "options": ["Computer will not boot", "Blue screen error", "System runs slow", "Network connectivity issues"],
            "correct_answer": "Multiple matching pairs",
            "explanation": "This is a matching question where problems need to be paired with their appropriate solutions.",
            "topic": "Troubleshooting",
            "difficulty": "medium"
        },
        {
            "id": 337,
            "number": 58,
            "question": "A computer technician is installing a RAID. If the RAID uses mirroring and striping, which RAID level is the technician using?",
            "options": ["RAID 0", "RAID 1", "RAID 5", "RAID 10"],
            "correct_answer": "RAID 10",
            "explanation": "RAID 10 combines mirroring (RAID 1) and striping (RAID 0) to provide both redundancy and performance benefits.",
            "topic": "Hardware",
            "difficulty": "medium"
        },
        {
            "id": 338,
            "number": 59,
            "question": "A computer technician is installing a RAID. If the RAID uses mirroring, which RAID level is the technician using?",
            "options": ["RAID 0", "RAID 1", "RAID 5", "RAID 6"],
            "correct_answer": "RAID 1",
            "explanation": "RAID 1 uses mirroring, where data is duplicated across multiple drives for redundancy.",
            "topic": "Hardware",
            "difficulty": "medium"
        },
        {
            "id": 339,
            "number": 60,
            "question": "A computer technician is installing a RAID. If the RAID uses striping with parity, which RAID level is the technician using?",
            "options": ["RAID 0", "RAID 1", "RAID 5", "RAID 10"],
            "correct_answer": "RAID 5",
            "explanation": "RAID 5 uses striping with parity, distributing data and parity information across multiple drives for both performance and redundancy.",
            "topic": "Hardware",
            "difficulty": "medium"
        },
        {
            "id": 340,
            "number": 61,
            "question": "A computer technician is installing a RAID. If the RAID uses striping, which RAID level is the technician using?",
            "options": ["RAID 0", "RAID 1", "RAID 5", "RAID 6"],
            "correct_answer": "RAID 0",
            "explanation": "RAID 0 uses striping, where data is distributed across multiple drives for improved performance but with no redundancy.",
            "topic": "Hardware",
            "difficulty": "medium"
        },
        {
            "id": 341,
            "number": 62,
            "question": "A computer technician is installing a RAID. If the RAID uses striping with double parity, which RAID level is the technician using?",
            "options": ["RAID 0", "RAID 5", "RAID 6", "RAID 10"],
            "correct_answer": "RAID 6",
            "explanation": "RAID 6 uses striping with double parity, providing higher fault tolerance than RAID 5 by being able to survive the failure of two drives.",
            "topic": "Hardware",
            "difficulty": "medium"
        },
        {
            "id": 342,
            "number": 89,
            "question": "What ACPI power state describes when the CPU and RAM are off and the contents of RAM are saved to a temporary file on the hard drive?",
            "options": ["S1", "S2", "S3", "S4"],
            "correct_answer": "S4",
            "explanation": "S4 (Hibernate) saves the contents of RAM to the hard drive and then powers off the CPU and RAM. This allows the system to be restored to its exact state when powered back on.",
            "topic": "Operating Systems",
            "difficulty": "medium"
        },
        {
            "id": 343,
            "number": 90,
            "question": "What ACPI power state describes when the CPU and RAM are still receiving power but unused devices are powered down?",
            "options": ["S0", "S1", "S2", "S3"],
            "correct_answer": "S1",
            "explanation": "S1 is a light sleep state where the CPU and RAM remain powered but unused devices are powered down to save energy.",
            "topic": "Operating Systems",
            "difficulty": "medium"
        },
        {
            "id": 344,
            "number": 91,
            "question": "What ACPI power state describes when the CPU is off, but the RAM is refreshed?",
            "options": ["S1", "S2", "S3", "S4"],
            "correct_answer": "S3",
            "explanation": "S3 (Suspend to RAM) powers off the CPU and most components but continues to refresh the RAM to maintain its contents.",
            "topic": "Operating Systems",
            "difficulty": "medium"
        },
        {
            "id": 345,
            "number": 92,
            "question": "What ACPI power state describes when the computer is off?",
            "options": ["S3", "S4", "S5", "G3"],
            "correct_answer": "S5",
            "explanation": "S5 (Soft Off) is the state when the computer is off but can still be woken by certain events like Wake-on-LAN or power button press.",
            "topic": "Operating Systems",
            "difficulty": "medium"
        },
        {
            "id": 346,
            "number": 93,
            "question": "What ACPI power state describes when the CPU is off and the RAM is set to a slow refresh rate?",
            "options": ["S1", "S2", "S3", "S4"],
            "correct_answer": "S2",
            "explanation": "S2 is a deeper sleep state where the CPU is powered off and RAM is refreshed at a slower rate to save more power than S1.",
            "topic": "Operating Systems",
            "difficulty": "medium"
        },
        {
            "id": 347,
            "number": 94,
            "question": "What ACPI power state describes when the computer is on and the CPU is running?",
            "options": ["S0", "S1", "S2", "S3"],
            "correct_answer": "S0",
            "explanation": "S0 is the working state where the computer is fully operational and the CPU is running normally.",
            "topic": "Operating Systems",
            "difficulty": "medium"
        },
        {
            "id": 348,
            "number": 207,
            "question": "Which type of disk drive can provide a very fast boot experience and also provide high capacity storage?",
            "options": ["SSD", "DVD", "HDD", "SSHD"],
            "correct_answer": "SSHD",
            "explanation": "A solid-state hybrid drive (SSHD) is a compromise between a magnetic HDD and an SSD. It combines the best aspects of both technologies, being faster than an HDD but less expensive than an SSD. SSHDs integrate a magnetic HDD with onboard flash memory that serves as a nonvolatile cache.",
            "topic": "Hardware",
            "difficulty": "medium"
        },
        {
            "id": 349,
            "number": 220,
            "question": "Match the Windows 10 boot sequence after the boot manager (bootmgr.exe) loads.",
            "options": ["Winload.exe", "NTOSKRNL.exe", "HAL.dll", "Winlogon.exe"],
            "correct_answer": "Sequential loading order",
            "explanation": "After bootmgr.exe loads, the Windows 10 boot sequence continues with Winload.exe, then NTOSKRNL.exe and HAL.dll, followed by Winlogon.exe.",
            "topic": "Operating Systems",
            "difficulty": "hard"
        },
        {
            "id": 350,
            "number": 221,
            "question": "Match the correct API with its function within the Windows 10 environment.",
            "options": ["Win32 API", "DirectX API", "WinRT API", ".NET Framework"],
            "correct_answer": "Multiple matching pairs",
            "explanation": "This is a matching question where different APIs need to be paired with their specific functions in Windows 10.",
            "topic": "Operating Systems",
            "difficulty": "hard"
        },
        {
            "id": 351,
            "number": 230,
            "question": "Match the tabs of the Windows 10 Task Manager to their functions. (Not all options are used.)",
            "options": ["Processes", "Performance", "App history", "Startup", "Users", "Details", "Services"],
            "correct_answer": "Multiple matching pairs",
            "explanation": "This is a matching question where Task Manager tabs need to be paired with their specific functions.",
            "topic": "Operating Systems",
            "difficulty": "medium"
        },
        {
            "id": 352,
            "number": 231,
            "question": "Match the drive status indicators in the Disk Management utility with their descriptions.",
            "options": ["Healthy", "Failed", "Foreign", "Unallocated", "Active", "Dynamic"],
            "correct_answer": "Multiple matching pairs",
            "explanation": "This is a matching question where disk status indicators need to be paired with their descriptions in Disk Management.",
            "topic": "Operating Systems",
            "difficulty": "medium"
        },
        {
            "id": 353,
            "number": 232,
            "question": "Match the wireless security settings to the description. (Not all options are used.)",
            "options": ["WEP", "WPA", "WPA2", "WPA3", "Open", "MAC filtering"],
            "correct_answer": "Multiple matching pairs",
            "explanation": "This is a matching question where wireless security protocols need to be paired with their descriptions.",
            "topic": "Networking",
            "difficulty": "medium"
        },
        {
            "id": 354,
            "number": 243,
            "question": "Match the individual languages with their corresponding classification.",
            "options": ["HTML", "CSS", "JavaScript", "Python", "SQL", "Assembly"],
            "correct_answer": "Multiple matching pairs",
            "explanation": "This is a matching question where programming languages need to be classified by their type or purpose.",
            "topic": "General IT",
            "difficulty": "medium"
        },
        {
            "id": 355,
            "number": 347,
            "question": "Match the steps that will lead to the loading of bootmgr.exe in a 32 bit Windows 10 system.",
            "options": ["POST", "Boot sector loading", "MBR execution", "BOOTMGR loading"],
            "correct_answer": "Sequential boot order",
            "explanation": "This is a sequencing question for the Windows boot process leading to bootmgr.exe loading.",
            "topic": "Operating Systems",
            "difficulty": "hard"
        },
        {
            "id": 356,
            "number": 348,
            "question": "Select the Windows 10 version that best meets the described use.",
            "options": ["Windows 10 Home", "Windows 10 Pro", "Windows 10 Enterprise", "Windows 10 Education"],
            "correct_answer": "Multiple selections based on use case",
            "explanation": "This is a matching question where different Windows 10 versions need to be matched with their appropriate use cases.",
            "topic": "Operating Systems",
            "difficulty": "medium"
        },
        {
            "id": 357,
            "number": 349,
            "question": "Match the file system with the respective description.",
            "options": ["NTFS", "FAT32", "exFAT", "HFS+", "ext4"],
            "correct_answer": "Multiple matching pairs",
            "explanation": "This is a matching question where file systems need to be paired with their characteristics or descriptions.",
            "topic": "Operating Systems",
            "difficulty": "medium"
        },
        {
            "id": 358,
            "number": 350,
            "question": "A corporation would like to use three or more factors for the password authentication policy. How can this be achieved?",
            "options": ["2FA", "SFA", "bitlocker", "MFA"],
            "correct_answer": "MFA",
            "explanation": "MFA (Multi-Factor Authentication) requires users to present at least two, if not more, types of authentication. 2FA (Two-Factor authentication) is limited to two factors. SFA (Single-Factor Authentication) requires only one factor. Bitlocker encrypts drives.",
            "topic": "Security",
            "difficulty": "medium"
        }
    ]
    
    return corrected_questions

def merge_questions():
    """Merge the corrected questions into the main questions.json file"""
    
    json_file = "/Users/michallatal/Desktop/it/it-quiz-app/src/data/questions.json"
    backup_file = "/Users/michallatal/Desktop/it/it-quiz-app/src/data/questions_backup.json"
    
    # Load existing data
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Create backup
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Backup created at: {backup_file}")
    
    # Get corrected questions
    new_questions = create_corrected_questions()
    
    # Add new questions to the data
    data['questions'].extend(new_questions)
    
    # Update exam info
    data['exam_info']['total_questions'] = len(data['questions'])
    data['exam_info']['last_updated'] = "2025-08-13"
    
    # Sort questions by number
    data['questions'].sort(key=lambda x: x.get('number', x.get('id', 0)))
    
    # Update IDs to be sequential
    for i, question in enumerate(data['questions'], 1):
        question['id'] = i
    
    # Save updated data
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully merged {len(new_questions)} questions")
    print(f"Total questions now: {data['exam_info']['total_questions']}")
    print(f"Questions file updated: {json_file}")
    
    return data

def main():
    print("Merging corrected missing questions into questions.json...")
    
    try:
        updated_data = merge_questions()
        print("\n✅ Merge completed successfully!")
        
        # Show some statistics
        topics = {}
        for q in updated_data['questions']:
            topic = q.get('topic', 'Unknown')
            topics[topic] = topics.get(topic, 0) + 1
        
        print(f"\nQuestion distribution by topic:")
        for topic, count in sorted(topics.items()):
            print(f"  {topic}: {count}")
            
    except Exception as e:
        print(f"❌ Error during merge: {e}")
        return False
    
    return True

if __name__ == "__main__":
    main()