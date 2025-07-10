import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { signUpUser, signInUser, clearError } from '../features/user/userSlice'
import PrimaryButton from './PrimaryButton'
import SimbaMascot from './SimbaMascot'

interface AuthDialogProps {
  isOpen: boolean
  onClose: () => void
  initialMode: 'signup' | 'signin'
}

const AuthDialog: React.FC<AuthDialogProps> = ({ isOpen, onClose, initialMode }) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })
  
  const dispatch = useAppDispatch()
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.user)

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setIsSignUp(initialMode === 'signup')
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: ''
      })
      dispatch(clearError())
      
      // Prevent body scroll
      document.body.classList.add('modal-open')
    } else {
      // Re-enable body scroll
      document.body.classList.remove('modal-open')
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [isOpen, initialMode, dispatch])

  // Close dialog when user successfully authenticates
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose()
    }
  }, [isAuthenticated, isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())

    if (isSignUp) {
      // Validation for sign up
      if (formData.password !== formData.confirmPassword) {
        return
      }
      if (formData.password.length < 6) {
        return
      }

              try {
          const result = await dispatch(signUpUser({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            learningSpeed: 3 // Default learning speed, will be set in onboarding
          })).unwrap()
          console.log('Signup successful:', result)
        } catch (error) {
          console.error('Sign up failed:', error)
        }
    } else {
      // Sign in
      try {
        await dispatch(signInUser({
          email: formData.email,
          password: formData.password
        })).unwrap()
      } catch (error) {
        console.error('Sign in failed:', error)
      }
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    dispatch(clearError())
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    })
  }

  const isFormValid = () => {
    if (!formData.email || !formData.password) return false
    if (isSignUp) {
      return formData.name.trim() && 
             formData.password === formData.confirmPassword && 
             formData.password.length >= 6
    }
    return true
  }

  const getPasswordError = () => {
    if (isSignUp && formData.password && formData.password.length < 6) {
      return 'Password must be at least 6 characters'
    }
    if (isSignUp && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      return 'Passwords do not match'
    }
    return null
  }



  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl max-w-md w-full modal-content"
            initial={{ scale: 0.85, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 40 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.23, 1, 0.32, 1],
              delay: isOpen ? 0.1 : 0
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-t-3xl p-6 text-center relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
              
              <SimbaMascot size="md" animate={true} />
              <h1 className="font-comic text-xl font-bold text-white mt-3">
                {isSignUp ? 'Join SciFly! 🚀' : 'Welcome Back! 🦁'}
              </h1>
              <p className="text-white/90 mt-1 text-sm">
                {isSignUp ? 'Create your science adventure account' : 'Sign in to continue learning'}
              </p>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name field (only for sign up) */}
                <AnimatePresence>
                  {isSignUp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        ease: "easeInOut",
                        opacity: { duration: 0.2 }
                      }}
                      style={{ overflow: 'hidden' }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Enter your name..."
                        className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                        required={isSignUp}
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                    required
                    autoFocus={!isSignUp}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Enter password..."
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Confirm Password (only for sign up) */}
                <AnimatePresence>
                  {isSignUp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        ease: "easeInOut",
                        opacity: { duration: 0.2 }
                      }}
                      style={{ overflow: 'hidden' }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        placeholder="Confirm password..."
                        className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                        required={isSignUp}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Password Error */}
                <AnimatePresence>
                {getPasswordError() && (
                  <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    className="text-red-500 text-sm text-center"
                  >
                    {getPasswordError()}
                  </motion.div>
                )}
                </AnimatePresence>

                {/* API Error */}
                <AnimatePresence>
                {error && (
                  <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-2xl"
                  >
                    {error}
                  </motion.div>
                )}
                </AnimatePresence>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isFormValid() || isLoading}
                  className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl py-3 px-6 font-bold hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <span>{isSignUp ? '🚀' : '🦁'}</span>
                  {isLoading 
                    ? (isSignUp ? 'Creating Account...' : 'Signing In...') 
                    : (isSignUp ? 'Create Account' : 'Sign In')
                  }
                </button>

                {/* Toggle Mode */}
                <div className="text-center pt-2">
                  <p className="text-gray-600 text-sm">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  </p>
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-primary-600 font-bold text-sm hover:text-primary-700 transition-colors"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AuthDialog 