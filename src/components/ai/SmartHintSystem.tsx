import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../store'
import { generateSmartHint } from '../../features/smartTutor/smartTutorSlice'

interface SmartHintSystemProps {
  contentId: string
  userId: string
  strugglingAreas: string[]
  onHintUsed?: (hint: any) => void
  onStruggleDetected?: (context: string) => void
}

export const SmartHintSystem: React.FC<SmartHintSystemProps> = ({
  contentId,
  userId,
  strugglingAreas,
  onHintUsed,
  onStruggleDetected
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { availableHints, tutorEnabled, hintFrequency } = useSelector((state: RootState) => state.smartTutor)
  const [currentHint, setCurrentHint] = useState<any>(null)
  const [showHint, setShowHint] = useState(false)
  
  const contentHints = availableHints[contentId] || []
  
  useEffect(() => {
    if (strugglingAreas.length > 0 && tutorEnabled && !currentHint) {
      // Generate hint for struggling area
      const latestStruggle = strugglingAreas[strugglingAreas.length - 1]
      dispatch(generateSmartHint({
        contentId,
        userId,
        struggleContext: latestStruggle,
        userSpeed: 3 // TODO: Get from user state
      }))
    }
  }, [strugglingAreas, tutorEnabled, contentId, userId, dispatch])
  
  const handleHintClick = (hint: any) => {
    setCurrentHint(hint)
    setShowHint(true)
    if (onHintUsed) {
      onHintUsed(hint)
    }
  }
  
  const handleRequestHint = () => {
    if (onStruggleDetected) {
      onStruggleDetected('User requested hint')
    }
  }
  
  return (
    <div className="smart-hint-system">
      {/* Hint Request Button */}
      <button 
        className="hint-request-btn" 
        onClick={handleRequestHint}
        disabled={!tutorEnabled}
      >
        💡 Need a hint?
      </button>
      
      {/* Available Hints */}
      {contentHints.length > 0 && (
        <div className="available-hints">
          <h4>Available Hints:</h4>
          {contentHints.map((hint) => (
            <button 
              key={hint.id}
              className={`hint-btn ${hint.hintType}`}
              onClick={() => handleHintClick(hint)}
            >
              {hint.hintType} hint
            </button>
          ))}
        </div>
      )}
      
      {/* Current Hint Display */}
      {showHint && currentHint && (
        <div className="hint-display">
          <div className="hint-header">
            <span className="hint-type">{currentHint.hintType}</span>
            <button 
              className="close-hint"
              onClick={() => setShowHint(false)}
            >
              ×
            </button>
          </div>
          <div className="hint-content">
            {currentHint.hintText}
          </div>
        </div>
      )}
    </div>
  )
}

export default SmartHintSystem 