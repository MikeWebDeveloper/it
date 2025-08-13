'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Monitor, 
  Shield, 
  Network, 
  Settings, 
  Smartphone, 
  Printer, 
  Cloud, 
  Terminal,
  Wrench,
  Computer,
  AlertTriangle
} from 'lucide-react'
import { useQuizStore } from '@/store/useQuizStore'
import questionData from '@/data/questions.json'

const topicIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Hardware': Computer,
  'Hardware Safety': AlertTriangle,
  'Networking': Network,
  'Operating Systems': Monitor,
  'Security': Shield,
  'Troubleshooting': Wrench,
  'Printers': Printer,
  'Mobile Devices': Smartphone,
  'Cloud Computing': Cloud,
  'Command Line': Terminal,
  'General IT': Settings
}

const topicColors: Record<string, string> = {
  'Hardware': 'bg-blue-500',
  'Hardware Safety': 'bg-red-500',
  'Networking': 'bg-green-500',
  'Operating Systems': 'bg-purple-500',
  'Security': 'bg-orange-500',
  'Troubleshooting': 'bg-yellow-500',
  'Printers': 'bg-pink-500',
  'Mobile Devices': 'bg-indigo-500',
  'Cloud Computing': 'bg-cyan-500',
  'Command Line': 'bg-gray-500',
  'General IT': 'bg-teal-500'
}

interface CategorySelectorProps {
  onCategorySelect: (categories: string[]) => void
  selectedCategories: string[]
}

export function CategorySelector({ onCategorySelect, selectedCategories }: CategorySelectorProps) {
  const { userProgress } = useQuizStore()
  
  // Get question counts by topic
  const topicCounts = questionData.exam_info.topics.reduce((acc, topic) => {
    acc[topic] = questionData.questions.filter(q => q.topic === topic).length
    return acc
  }, {} as Record<string, number>)

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategorySelect(selectedCategories.filter(c => c !== category))
    } else {
      onCategorySelect([...selectedCategories, category])
    }
  }

  const handleSelectAll = () => {
    onCategorySelect(questionData.exam_info.topics)
  }

  const handleSelectNone = () => {
    onCategorySelect([])
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          variant={selectedCategories.length === questionData.exam_info.topics.length ? "default" : "outline"}
          onClick={handleSelectAll}
          className="flex-1"
        >
          Select All Topics ({questionData.exam_info.total_questions} questions)
        </Button>
        <Button 
          variant="outline" 
          onClick={handleSelectNone}
          disabled={selectedCategories.length === 0}
          className="flex-1"
        >
          Clear Selection
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {questionData.exam_info.topics.map((topic) => {
          const IconComponent = topicIcons[topic] || Settings
          const isSelected = selectedCategories.includes(topic)
          const topicProgress = userProgress.topicProgress[topic]
          const masteryLevel = topicProgress?.masteryLevel || 'beginner'
          const accuracy = topicProgress ? 
            Math.round((topicProgress.correctAnswers / topicProgress.questionsAnswered) * 100) : 0

          return (
            <Card 
              key={topic}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                isSelected 
                  ? 'ring-2 ring-primary border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleCategoryToggle(topic)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${topicColors[topic]} text-white`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium leading-tight">
                        {topic}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {topicCounts[topic]} questions
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <Badge variant="default" className="text-xs">
                      Selected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              {topicProgress && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{accuracy}% accuracy</span>
                    </div>
                    <Progress value={accuracy} className="h-2" />
                    <div className="flex justify-between items-center">
                      <Badge 
                        variant={masteryLevel === 'advanced' ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {masteryLevel}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {topicProgress.questionsAnswered} completed
                      </span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {selectedCategories.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Selected {selectedCategories.length} topic{selectedCategories.length !== 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedCategories.map(category => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category} ({topicCounts[category]})
                  </Badge>
                ))}
              </div>
              <p className="text-lg font-semibold mt-3">
                Total: {selectedCategories.reduce((sum, cat) => sum + topicCounts[cat], 0)} questions
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}