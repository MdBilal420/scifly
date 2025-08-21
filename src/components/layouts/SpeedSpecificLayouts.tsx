import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdArrowBack, MdArrowForward } from 'react-icons/md'
import { Topic } from '../../data/topics'

// Helper functions to properly render icons with TypeScript compatibility
const BackIcon = () => (MdArrowBack as any)({ style: { display: 'inline', marginRight: '0.5rem' } })
const ForwardIcon = () => (MdArrowForward as any)({ style: { display: 'inline', marginLeft: '0.5rem' } })

interface ContentSection {
  title: string
  content: string
  tip: string
  image: string
}

interface SpeedLayoutProps {
  currentContent: ContentSection
  onNext: () => void
  onPrevious: () => void
  currentSection: number
  totalSections: number
  currentTopic: Topic
}

// Speed 1 (🐢): Re-designed for Grade 5 UX
export const Speed1Layout: React.FC<SpeedLayoutProps> = ({ 
  currentContent, 
  onNext, 
  onPrevious, 
  currentSection, 
  totalSections,
  currentTopic
}) => {

  console.log("currentTopic", currentTopic)

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-transparent rounded-3xl">
      {/* Left Column: Image only */}
      <div className="flex items-center justify-center overflow-hidden min-h-0">
        <motion.img 
          src={currentTopic?.image}
          alt={currentContent?.title || 'Lesson Image'} 
          className="max-w-full h-auto max-h-[66vh] object-contain rounded-2xl shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        />
      </div>

      {/* Right Column: Text Content */}
      <div className="bg-white text-gray-800 rounded-2xl p-8 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-3xl font-bold text-blue-900 mb-4">{currentContent?.title || 'Lesson Title'}</h3>
          <p className="text-lg mb-6 leading-relaxed">
            {currentContent?.content || 'Loading lesson content...'}
          </p>

          {currentContent?.tip && (
            <div className="bg-yellow-300 text-yellow-900 rounded-xl p-4">
              <h4 className="font-bold flex items-center gap-2 mb-2"><span className="text-xl">🌟</span> Fun Fact!</h4>
              <p>{currentContent.tip}</p>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
            <button 
              onClick={onPrevious} 
              disabled={currentSection === 0}
              className="bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded-full disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              onClick={onNext}
              className="bg-green-500 text-white font-bold py-2 px-8 rounded-full"
            >
              {currentSection === totalSections - 1 ? 'Finish' : 'Next'}
            </button>
        </div>
      </div>
    </div>
  )
}

// Speed 2 (🐨): Re-designed for Grade 5 UX
export const Speed2Layout: React.FC<SpeedLayoutProps> = ({ 
  currentContent, 
  onNext, 
  onPrevious, 
  currentSection, 
  totalSections 
}) => {
  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-transparent rounded-3xl">
      {/* Left Column: Image only */}
      <div className="flex items-center justify-center overflow-hidden min-h-0">
        <motion.img 
          src="https://czdtrrxwoonaryalnkbc.supabase.co/storage/v1/object/sign/scifly-lessons-diagram/photosynthesis.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zZTQzZjY0ZC1mOTQ2LTQwZTktOGQzMC1lZGY4NWZiZjNjOGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzY2lmbHktbGVzc29ucy1kaWFncmFtL3Bob3Rvc3ludGhlc2lzLnBuZyIsImlhdCI6MTc1MjIxNTQ4MiwiZXhwIjoxNzgzNzUxNDgyfQ.iNB3njt5EWASJEWOlFqsQORKvd78TAipCwOO6RVpUEk" 
          alt={currentContent?.title || 'Lesson Image'} 
          className="max-w-full h-auto max-h-[66vh] object-contain rounded-2xl shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        />
      </div>

      {/* Right Column: Text Content */}
      <div className="bg-white text-gray-800 rounded-2xl p-8 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-3xl font-bold text-blue-900 mb-4">{currentContent?.title || 'Lesson Title'}</h3>
          <p className="text-lg mb-6 leading-relaxed">
            {currentContent?.content || 'Loading lesson content...'}
          </p>

          {currentContent?.tip && (
            <div className="bg-yellow-300 text-yellow-900 rounded-xl p-4">
              <h4 className="font-bold flex items-center gap-2 mb-2"><span className="text-xl">🌟</span> Fun Fact!</h4>
              <p>{currentContent.tip}</p>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
            <button 
              onClick={onPrevious} 
              disabled={currentSection === 0}
              className="bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded-full disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              onClick={onNext}
              className="bg-green-500 text-white font-bold py-2 px-8 rounded-full"
            >
              {currentSection === totalSections - 1 ? 'Finish' : 'Next'}
            </button>
        </div>
      </div>
    </div>
  )
}

// Speed 3 (🦁): Visual + Kinesthetic Layout
export const Speed3Layout: React.FC<SpeedLayoutProps> = ({ 
  currentContent, 
  onNext, 
  onPrevious, 
  currentSection, 
  totalSections 
}) => (
  <div className="speed-3-layout h-full flex flex-col lg:grid lg:grid-cols-3 gap-3 p-3 overflow-hidden">
    {/* Main Content */}
    <div className="lg:col-span-2 bg-white/90 rounded-2xl p-4 shadow-xl backdrop-blur-lg border border-white/30 flex flex-col min-h-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-4 border-blue-200 flex-shrink-0">
              <span className="text-2xl leading-none drop-shadow-md">
                {currentContent?.image || '🔬'}
              </span>
            </div>
            
            <div className="flex-1 min-h-0">
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-green-500 to-purple-600 bg-clip-text text-transparent mb-2 font-comic">
                {currentContent?.title || 'Learning Time'}
              </h3>
              
              <div className="overflow-y-auto max-h-32">
                <p className="text-sm leading-relaxed text-slate-700 font-medium">
                  {currentContent?.content || 'Loading content...'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-100/70 to-yellow-100/70 rounded-xl p-3 flex items-start gap-3 border-2 border-orange-300/60 shadow-lg">
            <span className="text-lg flex-shrink-0 mt-1">🎯</span>
            <div>
              <p className="text-xs font-semibold text-orange-800 mb-1">Interactive Tip:</p>
              <p className="text-xs text-orange-700 leading-relaxed">
                {currentContent?.tip || 'You\'re doing great! Keep learning!'}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
    
    {/* Interactive Sidebar */}
    <div className="bg-white/80 rounded-2xl p-3 shadow-xl backdrop-blur-lg border border-white/30 flex flex-col min-h-0">
      <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span className="text-xl">🎮</span>
        Interactive Zone
      </h4>
      
      <div className="flex-1 space-y-2 overflow-y-auto">
        {/* Mock interactive elements */}
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-2 border-2 border-blue-200 cursor-pointer hover:scale-105 transition-transform">
          <div className="text-lg mb-1">🔬</div>
          <p className="text-xs text-blue-800 font-medium">Experiment</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-100 to-lime-100 rounded-xl p-2 border-2 border-green-200 cursor-pointer hover:scale-105 transition-transform">
          <div className="text-lg mb-1">📊</div>
          <p className="text-xs text-green-800 font-medium">Data Analysis</p>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-2 border-2 border-yellow-200 cursor-pointer hover:scale-105 transition-transform">
          <div className="text-lg mb-1">🧩</div>
          <p className="text-xs text-orange-800 font-medium">Puzzle</p>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-200 flex-shrink-0">
        <button 
          onClick={onPrevious}
          type="button"
          className={`px-3 py-2 text-xs font-bold text-white rounded-xl transition-all duration-300 flex items-center justify-center ${
            currentSection === 0 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-400 to-purple-400 cursor-pointer hover:scale-105'
          }`}
          disabled={currentSection === 0}
        >
          <BackIcon />
          Prev
        </button>
        
        <div className="text-xs text-gray-600 font-medium">
          {currentSection + 1}/{totalSections}
        </div>
        
        <button 
          onClick={onNext}
          type="button"
          className={`px-3 py-2 text-xs font-bold text-white rounded-xl transition-all duration-300 flex items-center justify-center hover:scale-105 ${
            currentSection === totalSections - 1 
              ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 animate-pulse' 
              : 'bg-gradient-to-r from-green-500 via-lime-400 to-yellow-300'
          }`}
        >
          {currentSection === totalSections - 1 ? '🎉 Done' : 
             <>Next <ForwardIcon /></>
          }
        </button>
      </div>
    </div>
  </div>
)

// Speed 4 (🐎): Reading + Conversational Layout
export const Speed4Layout: React.FC<SpeedLayoutProps> = ({ 
  currentContent, 
  onNext, 
  onPrevious, 
  currentSection, 
  totalSections 
}) => (
  <div className="speed-4-layout h-full flex flex-col lg:grid lg:grid-cols-3 gap-3 p-3 overflow-hidden">
    {/* Main Reading Area */}
    <div className="lg:col-span-2 bg-white/90 rounded-2xl p-4 shadow-xl backdrop-blur-lg border border-white/30 flex flex-col min-h-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg w-10 h-10 flex items-center justify-center shadow-lg">
              <span className="text-xl leading-none">
                {currentContent?.image || '🔬'}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 font-serif">
              {currentContent?.title || 'Learning Time'}
            </h3>
          </div>
          
          <div className="prose prose-sm max-w-none flex-1 overflow-y-auto">
            <p className="text-sm leading-relaxed text-slate-700 font-medium mb-4 text-justify">
              {currentContent?.content || 'Loading content...'}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border-l-4 border-blue-400 shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0 mt-1">💭</span>
              <div>
                <p className="text-xs font-semibold text-blue-800 mb-1">Think About This:</p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  {currentContent?.tip || 'You\'re doing great! Keep learning!'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
    
    {/* Conversational Panel */}
    <div className="bg-white/80 rounded-2xl p-3 shadow-xl backdrop-blur-lg border border-white/30 flex flex-col min-h-0">
      <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span className="text-xl">💬</span>
        AI Tutor
      </h4>
      
      <div className="flex-1 space-y-2 overflow-y-auto">
        {/* Mock conversation */}
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-2 border border-blue-200">
          <p className="text-xs text-blue-800 font-medium">
            "What questions do you have about {currentContent?.title?.toLowerCase()}?"
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-green-100 to-lime-100 rounded-xl p-2 border border-green-200">
          <p className="text-xs text-green-800 font-medium">
            "Can you explain the main concept in your own words?"
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-2 border border-yellow-200">
          <p className="text-xs text-orange-800 font-medium">
            "How does this relate to what you already know?"
          </p>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-200 flex-shrink-0">
        <button 
          onClick={onPrevious}
          type="button"
          className={`px-3 py-2 text-xs font-bold text-white rounded-xl transition-all duration-300 flex items-center justify-center ${
            currentSection === 0 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-400 to-purple-400 cursor-pointer hover:scale-105'
          }`}
          disabled={currentSection === 0}
        >
          <BackIcon />
          Back
        </button>
        
        <div className="text-xs text-gray-600 font-medium">
          {currentSection + 1}/{totalSections}
        </div>
        
        <button 
          onClick={onNext}
          type="button"
          className={`px-3 py-2 text-xs font-bold text-white rounded-xl transition-all duration-300 flex items-center justify-center hover:scale-105 ${
            currentSection === totalSections - 1 
              ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 animate-pulse' 
              : 'bg-gradient-to-r from-green-500 via-lime-400 to-yellow-300'
          }`}
        >
          {currentSection === totalSections - 1 ? '🎉 Finish' : 
             <>Continue <ForwardIcon /></>
          }
        </button>
      </div>
    </div>
  </div>
)

// Speed 5 (🚀): Conversational + Kinesthetic Layout
export const Speed5Layout: React.FC<SpeedLayoutProps> = ({ 
  currentContent, 
  onNext, 
  onPrevious, 
  currentSection, 
  totalSections 
}) => (
  <div className="speed-5-layout max-h-full flex flex-col lg:grid lg:grid-cols-4 gap-2 p-3 bg-slate-900/50 text-white overflow-hidden">
    {/* Main Content */}
    <div className="lg:col-span-2 bg-slate-800/90 rounded-2xl p-3 shadow-xl backdrop-blur-lg border border-slate-600/50 flex flex-col min-h-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg w-10 h-10 flex items-center justify-center shadow-lg">
              <span className="text-xl leading-none">
                {currentContent?.image || '🔬'}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-white font-mono">
              {currentContent?.title || 'Learning Time'}
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <p className="text-xs leading-relaxed text-slate-300 font-mono mb-4">
              {currentContent?.content || 'Loading content...'}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-3 border border-purple-500/30 shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0 mt-1">🚀</span>
              <div>
                <p className="text-xs font-semibold text-purple-300 mb-1">Advanced Insight:</p>
                <p className="text-xs text-purple-200 leading-relaxed">
                  {currentContent?.tip || 'You\'re doing great! Keep learning!'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
    
    {/* Experimental Zone */}
    <div className="bg-slate-800/80 rounded-2xl p-3 shadow-xl backdrop-blur-lg border border-slate-600/50 flex flex-col min-h-0">
      <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
        <span className="text-xl">🧪</span>
        Experiments
      </h4>
      
      <div className="space-y-2 flex-1 overflow-y-auto">
        <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-xl p-2 border border-red-500/30 cursor-pointer hover:scale-105 transition-transform">
          <div className="text-lg mb-1">⚗️</div>
          <p className="text-xs text-red-200 font-medium">Lab Test</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-900/50 to-teal-900/50 rounded-xl p-2 border border-green-500/30 cursor-pointer hover:scale-105 transition-transform">
          <div className="text-lg mb-1">🔬</div>
          <p className="text-xs text-green-200 font-medium">Analysis</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-2 border border-blue-500/30 cursor-pointer hover:scale-105 transition-transform">
          <div className="text-lg mb-1">🧬</div>
          <p className="text-xs text-blue-200 font-medium">Simulation</p>
        </div>
      </div>
    </div>
    
    {/* AI Collaboration */}
    <div className="bg-slate-800/80 rounded-2xl p-3 shadow-xl backdrop-blur-lg border border-slate-600/50 flex flex-col min-h-0">
      <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
        <span className="text-xl">🤖</span>
        AI Lab
      </h4>
      
      <div className="space-y-2 flex-1 overflow-y-auto">
        <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 rounded-xl p-2 border border-cyan-500/30">
          <p className="text-xs text-cyan-200 font-medium">
            "Ready to explore advanced concepts?"
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-2 border border-purple-500/30">
          <p className="text-xs text-purple-200 font-medium">
            "Let's design an experiment together!"
          </p>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-600 flex-shrink-0">
        <button 
          onClick={onPrevious}
          type="button"
          className={`px-3 py-2 text-xs font-bold text-white rounded-xl transition-all duration-300 flex items-center justify-center ${
            currentSection === 0 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500 cursor-pointer hover:scale-105'
          }`}
          disabled={currentSection === 0}
        >
          <BackIcon />
          Back
        </button>
        
        <div className="text-xs text-slate-400 font-medium text-center">
          {currentSection + 1}/{totalSections}
        </div>
        
        <button 
          onClick={onNext}
          type="button"
          className={`px-3 py-2 text-xs font-bold text-white rounded-xl transition-all duration-300 flex items-center justify-center hover:scale-105 ${
            currentSection === totalSections - 1 
              ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 animate-pulse' 
              : 'bg-gradient-to-r from-green-500 via-lime-500 to-yellow-500'
          }`}
        >
          {currentSection === totalSections - 1 ? '🎉 Complete' : 
             <>Next <ForwardIcon /></>
          }
        </button>
      </div>
    </div>
  </div>
) 