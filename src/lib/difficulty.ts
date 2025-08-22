import { Question } from '@/types/quiz'

export type DifficultyLevel = 'easy' | 'medium' | 'hard'

// Topic difficulty weights (based on IT complexity)
const TOPIC_DIFFICULTY_WEIGHTS: Record<string, number> = {
  'General IT': 1,
  'Hardware Safety': 1,
  'Mobile Devices': 1.5,
  'Hardware': 2,
  'Printers': 2,
  'Operating Systems': 2.5,
  'Command Line': 3,
  'Networking': 3.5,
  'Security': 4,
  'Cloud Computing': 4,
  'Troubleshooting': 4.5
}

// Calculate difficulty score for a question
function calculateDifficultyScore(question: Question): number {
  let score = 0

  // 1. Topic complexity (0-4.5 points)
  const topicWeight = TOPIC_DIFFICULTY_WEIGHTS[question.topic] || 2
  score += topicWeight

  // 2. Question length complexity (0-2 points)
  const questionLength = question.question.length
  if (questionLength > 200) score += 2
  else if (questionLength > 100) score += 1.5
  else if (questionLength > 50) score += 1
  else score += 0.5

  // 3. Number of options (0-1.5 points) 
  const optionCount = question.options.length
  if (optionCount >= 6) score += 1.5
  else if (optionCount >= 5) score += 1
  else if (optionCount >= 4) score += 0.5

  // 4. Multiple correct answers (0-2 points)
  if (Array.isArray(question.correctAnswer)) {
    score += 1.5 + (question.correctAnswer.length * 0.25)
  }

  // 5. Explanation complexity (0-1 point)
  if (question.explanation) {
    const explanationLength = question.explanation.length
    if (explanationLength > 300) score += 1
    else if (explanationLength > 150) score += 0.5
  }

  // 6. Technical terminology detection (0-1 point)
  const technicalTerms = [
    'TCP', 'UDP', 'IP', 'DNS', 'HTTP', 'HTTPS', 'SSL', 'TLS', 'API',
    'CPU', 'GPU', 'RAM', 'SSD', 'HDD', 'BIOS', 'UEFI', 'POST',
    'CLI', 'GUI', 'SSH', 'FTP', 'SMTP', 'POP3', 'IMAP',
    'RAID', 'DHCP', 'NAT', 'VPN', 'LAN', 'WAN', 'VLAN',
    'malware', 'firewall', 'encryption', 'authentication', 'authorization',
    'virtualization', 'container', 'cloud', 'SaaS', 'PaaS', 'IaaS'
  ]

  const questionText = (question.question + ' ' + question.options.join(' ')).toLowerCase()
  const termCount = technicalTerms.filter(term => 
    questionText.includes(term.toLowerCase())
  ).length

  if (termCount >= 3) score += 1
  else if (termCount >= 2) score += 0.5

  return score
}

// Convert difficulty score to level
export function getQuestionDifficulty(question: Question): DifficultyLevel {
  const score = calculateDifficultyScore(question)
  
  // Thresholds based on scoring system (max ~11 points)
  if (score >= 7) return 'hard'
  if (score >= 4) return 'medium'
  return 'easy'
}

// Get difficulty color class
export function getDifficultyColor(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
    case 'hard':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
  }
}

// Get difficulty icon
export function getDifficultyIcon(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case 'easy':
      return '🟢'
    case 'medium':
      return '🟡'
    case 'hard':
      return '🔴'
  }
}

// Get difficulty stats for a set of questions
export function getDifficultyStats(questions: Question[]) {
  const counts = { easy: 0, medium: 0, hard: 0 }
  
  questions.forEach(question => {
    const difficulty = getQuestionDifficulty(question)
    counts[difficulty]++
  })

  return {
    counts,
    percentages: {
      easy: Math.round((counts.easy / questions.length) * 100),
      medium: Math.round((counts.medium / questions.length) * 100),
      hard: Math.round((counts.hard / questions.length) * 100)
    },
    total: questions.length
  }
}