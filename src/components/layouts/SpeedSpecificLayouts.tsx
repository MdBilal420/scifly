import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdArrowBack, MdArrowForward } from 'react-icons/md'

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
}

// Speed 1 (🐢): Simplified + Visual Layout
export const Speed1Layout: React.FC<SpeedLayoutProps> = ({ 
  currentContent, 
  onNext, 
  onPrevious, 
  currentSection, 
  totalSections 
}) => (
  <div className="speed-1-layout h-full p-3 sm:p-4 flex flex-col overflow-hidden">
    <div className="max-w-2xl mx-auto flex flex-col h-full justify-between min-h-0">
      <div className="flex-1 flex items-center justify-center min-h-0 py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="w-full max-h-full overflow-y-auto"
          >
            <div className="p-4 sm:p-6 bg-white/95 rounded-3xl shadow-2xl max-w-lg mx-auto text-center backdrop-blur-xl border border-white/30">
              <div className="bg-gradient-to-br from-white/90 to-white/70 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-3 shadow-2xl border-4 border-white/50">
                <span className="text-4xl sm:text-5xl leading-none drop-shadow-md">
                  {currentContent?.image || '🔬'}
                </span>
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-700 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-3 font-comic">
                {currentContent?.title || 'Learning Time'}
              </h3>
              
              <p className="text-base sm:text-lg leading-relaxed text-slate-600 mb-4 font-medium">
                {currentContent?.content || 'Loading content...'}
              </p>
              
              <div className="bg-gradient-to-br from-green-100/50 to-lime-100/50 rounded-xl p-3 flex items-center gap-3 border-2 border-green-400/60 max-w-md mx-auto backdrop-blur-md shadow-lg">
                <span className="text-xl flex-shrink-0">💡</span>
                <span className="text-sm text-green-800 font-semibold text-left">
                  {currentContent?.tip || 'You\'re doing great! Keep learning!'}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="text-center relative flex-shrink-0 flex items-center justify-center gap-3 mt-3 py-2">
        <button 
          onClick={onPrevious}
          type="button"
          className={`px-6 py-3 text-base font-bold text-white rounded-xl transition-all duration-300 backdrop-blur-lg relative overflow-hidden flex items-center justify-center drop-shadow-lg ${
            currentSection === 0 
              ? 'bg-gray-500/50 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-400 to-purple-400 cursor-pointer hover:scale-105 hover:-translate-y-1 hover:shadow-xl shadow-lg'
          }`}
          disabled={currentSection === 0}
        >
          <BackIcon />
          Previous
        </button>
        
        <button 
          onClick={onNext}
          type="button"
          className={`px-6 py-3 text-base font-bold text-white rounded-xl transition-all duration-300 backdrop-blur-lg relative overflow-hidden flex items-center justify-center drop-shadow-lg hover:scale-105 hover:-translate-y-1 hover:shadow-xl ${
            currentSection === totalSections - 1 
              ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 shadow-lg animate-pulse' 
              : 'bg-gradient-to-r from-green-500 via-lime-400 to-yellow-300 shadow-lg'
          }`}
        >
          {currentSection === totalSections - 1 ? '🎉 Complete! ' : 
             <>Next <ForwardIcon /></>
          }
        </button>
      </div>
    </div>
  </div>
)

// Speed 2 (🐨): Visual + Reading Layout
export const Speed2Layout: React.FC<SpeedLayoutProps> = ({ 
  currentContent, 
  onNext, 
  onPrevious, 
  currentSection, 
  totalSections 
}) => (
  <div className="speed-2-layout h-full flex flex-col md:grid md:grid-cols-2 gap-3 p-3 sm:p-4 overflow-hidden">
    {/* Visual Column */}
    <div className="visual-column bg-white/90 rounded-2xl p-4 shadow-xl backdrop-blur-lg border border-white/30 flex flex-col min-h-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="text-center flex-1 flex flex-col justify-center"
        >
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-3 shadow-lg border-4 border-purple-200">
            <span className="text-4xl sm:text-5xl leading-none drop-shadow-md">
              {currentContent?.image || '🔬'}
            </span>
          </div>
          
          <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-3 font-comic">
            {currentContent?.title || 'Learning Time'}
          </h3>
          
          {/* Visual enhancements for Speed 2 */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-3 mt-3 border-2 border-yellow-200 shadow-md">
            <div className="text-2xl mb-1">🎨</div>
            <p className="text-xs text-orange-700 font-medium">
              Visual Learning Mode Active
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
    
    {/* Reading Column */}
    <div className="reading-column bg-white/80 rounded-2xl p-4 shadow-xl backdrop-blur-lg border border-white/30 flex flex-col min-h-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col justify-center min-h-0"
        >
          <div className="prose prose-sm max-w-none flex-1 overflow-y-auto">
            <p className="text-sm leading-relaxed text-slate-700 mb-4 font-medium text-justify">
              {currentContent?.content || 'Loading content...'}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-100/70 to-lime-100/70 rounded-xl p-3 flex items-start gap-3 border-2 border-green-300/60 shadow-lg mt-3">
            <span className="text-lg flex-shrink-0 mt-1">💡</span>
            <div>
              <p className="text-xs font-semibold text-green-800 mb-1">Key Insight:</p>
              <p className="text-xs text-green-700 leading-relaxed">
                {currentContent?.tip || 'You\'re doing great! Keep learning!'}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation at bottom of reading column */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-200 flex-shrink-0">
        <button 
          onClick={onPrevious}
          type="button"
          className={`px-4 py-2 text-sm font-bold text-white rounded-xl transition-all duration-300 flex items-center justify-center ${
            currentSection === 0 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-400 to-purple-400 cursor-pointer hover:scale-105 hover:shadow-lg'
          }`}
          disabled={currentSection === 0}
        >
          <BackIcon />
          Previous
        </button>
        
        <div className="text-center">
          <div className="text-xs text-gray-600 font-medium">
            {currentSection + 1} of {totalSections}
          </div>
        </div>
        
        <button 
          onClick={onNext}
          type="button"
          className={`px-4 py-2 text-sm font-bold text-white rounded-xl transition-all duration-300 flex items-center justify-center hover:scale-105 hover:shadow-lg ${
            currentSection === totalSections - 1 
              ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 animate-pulse' 
              : 'bg-gradient-to-r from-green-500 via-lime-400 to-yellow-300'
          }`}
        >
          {currentSection === totalSections - 1 ? '🎉 Complete! ' : 
             <>Next <ForwardIcon /></>
          }
        </button>
      </div>
    </div>
  </div>
)

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