import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { signOutUser } from '../features/user/userSlice'

interface UserMenuProps {
  className?: string
}

const UserMenu: React.FC<UserMenuProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dispatch = useAppDispatch()
  const { currentUser } = useAppSelector((state) => state.user)
  

  const handleLogout = async () => {
    console.log("handleLogout called")

    if (window.confirm(`Sign out of SciFly? You'll need to sign in again to continue your learning journey.`)) {
      console.log("User confirmed logout")
      try {
        console.log("Dispatching signOutUser action...")
        const result = await dispatch(signOutUser()).unwrap()
        console.log("Logout successful, result:", result)
        // The App component will handle navigation to landing page
      } catch (error) {
        console.error("Logout failed:", error)
        alert("Failed to sign out. Please try again.")
      }
    } else {
      console.log("User cancelled logout")
    }
    setIsOpen(false)
  }

  if (!currentUser) return null

  return (
    <div className={`relative ${className}`}>
      {/* User Avatar Button */}
      <motion.button
        className="flex items-center gap-2 bg-white/20 backdrop-blur rounded-xl px-3 py-2 glass-3d border border-white/20"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="text-2xl">{currentUser.avatar}</div>
        <div className="text-left hidden sm:block">
          <p className="text-white text-sm font-medium">{currentUser.name}</p>
          <p className="text-white/70 text-xs">Speed {currentUser.learningSpeed}/5</p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/70"
        >
          ▼
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur rounded-xl shadow-xl border border-white/20 z-50"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-2">
                {/* User Info */}
                <div className="px-3 py-2 border-b border-gray-200">
                  <p className="font-medium text-gray-800">{currentUser.name}</p>
                  <p className="text-sm text-gray-600">
                    {currentUser.learningSpeed <= 2 ? 'Careful Explorer' : 
                     currentUser.learningSpeed >= 4 ? 'Quick Thinker' : 'Balanced Student'}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  {/* <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-lg">👤</span>
                    <span className="text-sm">Profile</span>
                  </button>
                  
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-lg">⚙️</span>
                    <span className="text-sm">Settings</span>
                  </button>
                  
                  <hr className="my-1 border-gray-200" /> */}
                  
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-600 cursor-pointer hover:bg-red-50 rounded-lg transition-colors"
                    onClick={handleLogout}
                  >
                    <span className="text-lg">🚪</span>
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserMenu 