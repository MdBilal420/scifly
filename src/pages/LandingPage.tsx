import React, { useState } from 'react'
import { motion } from 'framer-motion'
import SimbaMascot from '../components/SimbaMascot'
import PrimaryButton from '../components/PrimaryButton'
import SpaceDecorations from '../components/SpaceDecorations'
import AuthDialog from '../components/AuthDialog'

const LandingPage: React.FC = () => {
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup')

  const handleSignUp = () => {
    setAuthMode('signup')
    setShowAuthDialog(true)
  }

  const handleSignIn = () => {
    setAuthMode('signin')
    setShowAuthDialog(true)
  }

  const features = [
    {
      icon: '🧪',
      title: 'Interactive Science Lessons',
      description: 'Learn with fun, engaging content tailored to your learning speed'
    },
    {
      icon: '🤖',
      title: 'AI-Powered Learning',
      description: 'Chat with Simba, your AI science companion who answers all your questions'
    },
    {
      icon: '🏆',
      title: 'Achievements & Progress',
      description: 'Unlock badges and track your progress as you master science concepts'
    },
    {
      icon: '⚡',
      title: 'Personalized Experience',
      description: 'Content adapts to your learning style - from careful explorer to lightning fast'
    }
  ]

  return (
    <div className="min-h-screen space-background relative overflow-hidden">
      <SpaceDecorations />
      
      {/* Navigation */}
      <motion.nav
        className="flex justify-between items-center p-6 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🚀
          </motion.div>
          <h1 className="font-comic text-2xl font-bold text-white">SciFly</h1>
        </div>
        
        <div className="flex gap-3">
          <motion.button
            onClick={handleSignIn}
            className="text-white hover:text-primary-200 transition-colors font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
          <PrimaryButton
            onClick={handleSignUp}
            size="sm"
            variant="secondary"
          >
            Get Started
          </PrimaryButton>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Content */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex justify-center mb-6">
              <SimbaMascot size="lg" animate={true} />
            </div>
            
            <h1 className="font-comic text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Science Learning
              <br />
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent font-extrabold animate-pulse" style={{ WebkitBackgroundClip: 'text', filter: 'drop-shadow(0 2px 4px rgba(255,255,255,0.3))' }}>
                Made Fun! 🚀
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join Simba on an amazing science adventure! Learn at your own pace with 
              interactive lessons, AI-powered assistance, and personalized content 
              that makes science exciting.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <PrimaryButton
                onClick={handleSignUp}
                size="lg"
                className="w-full sm:w-auto"
                icon="🚀"
              >
                Start Learning for Free
              </PrimaryButton>
              
              <motion.button
                onClick={handleSignIn}
                className="text-white border-2 border-white/30 hover:border-white/60 rounded-2xl px-8 py-4 font-bold transition-all backdrop-blur"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.95 }}
              >
                I Already Have an Account
              </motion.button>
            </div>
          </motion.div>

          {/* Demo Preview */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-white/10 backdrop-blur rounded-3xl p-8 max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="text-white">
                  <div className="text-4xl mb-3">📚</div>
                  <div className="font-bold text-lg">10+ Topics</div>
                  <div className="text-sm opacity-80">From gravity to ecosystems</div>
                </div>
                <div className="text-white">
                  <div className="text-4xl mb-3">🎯</div>
                  <div className="font-bold text-lg">Adaptive Learning</div>
                  <div className="text-sm opacity-80">Personalized to your speed</div>
                </div>
                <div className="text-white">
                  <div className="text-4xl mb-3">🏆</div>
                  <div className="font-bold text-lg">Achievement System</div>
                  <div className="text-sm opacity-80">Unlock badges & rewards</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="font-comic text-3xl font-bold text-white text-center mb-12">
            Why Kids Love SciFly ✨
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur rounded-3xl p-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
                <p className="text-white/90 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Learning Speed Preview */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="bg-white/10 backdrop-blur rounded-3xl p-8 max-w-4xl mx-auto text-center">
            <h3 className="font-comic text-2xl font-bold text-white mb-6">
              Choose Your Learning Adventure 🎯
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[
                { emoji: '🐢', name: 'Careful Explorer', desc: 'Take your time' },
                { emoji: '🐨', name: 'Steady Learner', desc: 'Balanced pace' },
                { emoji: '🦁', name: 'Balanced Student', desc: 'Perfect mix' },
                { emoji: '🐎', name: 'Quick Thinker', desc: 'Fast learner' },
                { emoji: '🚀', name: 'Lightning Fast', desc: 'Super quick' }
              ].map((speed, index) => (
                <motion.div
                  key={index}
                  className="bg-white/10 rounded-2xl p-4 text-white"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-3xl mb-2">{speed.emoji}</div>
                  <div className="font-bold text-sm">{speed.name}</div>
                  <div className="text-xs opacity-80">{speed.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          className="text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 backdrop-blur rounded-3xl p-8 max-w-2xl mx-auto">
            <h3 className="font-comic text-3xl font-bold text-white mb-4">
              Ready to Blast Off? 🚀
            </h3>
            <p className="text-white/90 text-lg mb-6">
              Join thousands of young scientists exploring the amazing world of science!
            </p>
            
            <PrimaryButton
              onClick={handleSignUp}
              size="lg"
              className="w-full sm:w-auto"
              icon="🎉"
            >
              Create Free Account
            </PrimaryButton>
            
            <p className="text-white/70 text-sm mt-4">
              No credit card required • 100% Free • Kid-friendly
            </p>
          </div>
        </motion.section>
      </div>

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        initialMode={authMode}
      />
    </div>
  )
}

export default LandingPage 