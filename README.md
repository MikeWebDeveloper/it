# IT Quiz App 📱💻

A modern, mobile-first Next.js application for IT Essentials exam preparation. Built with TypeScript, Tailwind CSS, and optimized for progressive web app capabilities.

![IT Quiz App](https://img.shields.io/badge/Next.js-15.4.6-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-success?style=for-the-badge)

## ✨ Features

### 🎯 Quiz Modes
- **Practice Mode**: Learn at your own pace with immediate feedback
- **Timed Quiz**: Simulate real exam conditions (15-minute time limit)
- **Review Mode**: Focus on topics that need improvement

### 📱 Mobile-First Design
- **Responsive**: Optimized for mobile devices with touch-friendly interfaces
- **PWA Support**: Install as a native app with offline capabilities
- **Dark/Light Mode**: Automatically adapts to user preferences
- **Touch Optimized**: Large touch targets and intuitive gestures

### 📊 Progress Tracking
- **Smart Statistics**: Track performance by topic and difficulty
- **Streak System**: Build daily learning habits
- **Topic Mastery**: Monitor progress across all IT Essentials areas
- **Detailed Analytics**: Comprehensive performance insights

### 🎮 Gamification
- **Achievement System**: Unlock badges for milestones
- **XP System**: Earn experience points for consistent learning
- **Progress Visualization**: Interactive charts and progress rings
- **Streak Tracking**: Maintain learning momentum

### 🔒 Data Privacy
- **Local Storage**: All data stored locally on your device
- **No Backend**: Completely client-side application
- **Offline Support**: Full functionality without internet connection

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd it-quiz-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3001 (or the port shown in terminal)
   ```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start

# Export static files (for hosting)
npm run export
```

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **State Management**: Zustand with localStorage persistence
- **Icons**: Lucide React
- **Theme**: next-themes for dark/light mode

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with PWA setup
│   ├── page.tsx           # Home page with quiz modes
│   └── quiz/[mode]/       # Dynamic quiz pages
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui base components
│   ├── quiz/             # Quiz-specific components
│   └── providers/        # Context providers
├── store/                # Zustand state management
├── types/                # TypeScript type definitions
├── data/                 # Static quiz questions
└── lib/                  # Utility functions
```

## 📊 Question Database

The app includes **50+ comprehensive IT Essentials questions** covering:

- **Hardware**: Motherboards, CPUs, RAM, storage devices
- **Networking**: TCP/UDP, DHCP, IPv6, protocols
- **Security**: BIOS settings, firewalls, encryption
- **Troubleshooting**: Systematic problem-solving approaches
- **Printers**: Laser vs inkjet, maintenance, common issues
- **Mobile Devices**: Configuration, synchronization, power management
- **Virtualization**: Hypervisors, cloud services, disaster recovery
- **Operating Systems**: Windows installation, configuration, management

## 🎨 Design System

### Mobile-First Approach
- **Touch Targets**: Minimum 44px for optimal mobile interaction
- **Responsive Grid**: Adapts from mobile to desktop seamlessly
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Performance**: Optimized for mobile networks and devices

### Color Scheme
- **Primary**: Modern neutral palette optimized for learning
- **Dark Mode**: Default for reduced eye strain during study sessions
- **Semantic Colors**: Green for correct, red for incorrect, blue for info

### Accessibility Features
- **WCAG 2.1 AA Compliant**: Meets accessibility standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Optimized for assistive technologies
- **High Contrast**: Sufficient color contrast ratios

## 📱 Mobile Features

### PWA Capabilities
- **Install Prompt**: Native app installation experience
- **Offline Mode**: Full functionality without internet
- **Background Sync**: Sync progress when reconnected
- **App Shortcuts**: Quick access to quiz modes

### Touch Interactions
- **Tap Gestures**: Optimized for thumb navigation
- **Swipe Support**: Navigate between questions
- **Visual Feedback**: Immediate response to user actions
- **Haptic Feedback**: Enhanced mobile experience

## 🚀 Getting Started

### Quick Test Drive

1. **Start the app**
   ```bash
   npm run dev
   ```

2. **Visit in browser**
   - Open http://localhost:3001
   - Try different quiz modes
   - Test mobile responsiveness

3. **Install as PWA**
   - Look for install prompt on mobile
   - Add to home screen for app-like experience

### Key Features to Try

1. **Practice Mode**: Start with unlimited time
2. **Dark Mode Toggle**: Switch themes in top-right
3. **Progress Tracking**: Complete quizzes to see statistics
4. **Mobile Navigation**: Test touch interactions

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

### Key Technologies

- **Next.js 15**: Latest App Router with Server Components
- **TypeScript**: Full type safety and IntelliSense
- **Tailwind CSS v4**: Utility-first styling with custom design system
- **Zustand**: Lightweight state management with persistence
- **shadcn/ui**: High-quality, accessible components

## 📊 Performance

### Metrics Targets
- **Performance**: >90 (Lighthouse)
- **Accessibility**: >95 (Lighthouse)
- **Best Practices**: >90 (Lighthouse)
- **SEO**: >90 (Lighthouse)
- **PWA**: ✅ Optimized

### Optimizations
- **Code Splitting**: Automatic by Next.js
- **Image Optimization**: WebP with fallbacks
- **Lazy Loading**: Progressive question loading
- **Service Worker**: Offline-first caching strategy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow TypeScript and accessibility standards
4. Test on mobile devices
5. Submit a pull request

### Development Guidelines
- Mobile-first approach for all features
- TypeScript strict mode
- Accessibility testing required
- Performance budget compliance

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **IT Essentials Content**: Based on official exam objectives
- **shadcn/ui**: Beautiful and accessible component library
- **Next.js Team**: Amazing React framework with App Router
- **Tailwind CSS**: Utility-first CSS framework

---

**Made with ❤️ for mobile-first IT learning**

🌟 **Perfect for studying on the go!** 📱