# Exhibit Images

This directory contains images referenced in quiz questions that include "Refer to the exhibit" instructions.

## Directory Structure

```
exhibits/
├── question-13/     # Question ID 13 - Network topology diagram
├── question-157/    # Question ID 157 - System configuration
├── question-164/    # Question ID 164 - Hardware component
├── question-166/    # Question ID 166 - Network setup
├── question-172/    # Question ID 172 - Security configuration
├── question-173/    # Question ID 173 - System interface
├── question-176/    # Question ID 176 - Hardware layout
├── question-184/    # Question ID 184 - Network diagram
├── question-189/    # Question ID 189 - Component identification
├── question-190/    # Question ID 190 - System output
├── question-206/    # Question ID 206 - Configuration screen
├── question-212/    # Question ID 212 - Hardware setup
├── question-213/    # Question ID 213 - Network topology
└── question-258/    # Question ID 258 - Component diagram
```

## Image Requirements

- Format: PNG or JPEG
- Resolution: Minimum 800px width for clarity
- File naming: `exhibit.png` or `exhibit.jpg` (primary image)
- Optional: `exhibit-2x.png` for high-DPI displays
- Alt text should be descriptive for accessibility

## Usage

Images are automatically loaded by the ExhibitDisplay component when a question has an exhibit field defined in the questions data.