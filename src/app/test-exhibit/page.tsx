'use client'

import Image from 'next/image'
import { ExhibitDisplay } from '@/components/quiz/ExhibitDisplay'

export default function TestExhibitPage() {
  const testExhibit = {
    src: "/exhibits/question-13/exhibit.svg",
    alt: "Motherboard diagram showing different expansion slots including PCIe x16, PCIe x8, PCIe x4, and PCI legacy slots labeled as sections A, B, C, and D",
    caption: "Motherboard expansion slots diagram showing where different cards can be installed",
    width: 800,
    height: 600
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">Exhibit Testing Page</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">1. Direct Image Component Test</h2>
        <div className="border p-4">
          <Image
            src="/exhibits/question-13/exhibit.svg"
            alt="Direct image test"
            width={400}
            height={300}
            className="border"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">2. Regular img tag test</h2>
        <div className="border p-4">
          <img 
            src="/exhibits/question-13/exhibit.svg" 
            alt="Regular img test"
            style={{ width: '400px', height: '300px' }}
            className="border"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">3. ExhibitDisplay Component Test</h2>
        <div className="border p-4">
          <ExhibitDisplay exhibit={testExhibit} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">4. Raw SVG Content Check</h2>
        <div className="border p-4">
          <iframe 
            src="/exhibits/question-13/exhibit.svg" 
            width="400" 
            height="300"
            className="border"
          />
        </div>
      </div>
    </div>
  )
}