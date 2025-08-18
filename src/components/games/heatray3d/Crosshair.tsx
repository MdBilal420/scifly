import React from 'react'

interface CrosshairProps {
  screenPosition: { x: number, y: number }
}

const Crosshair: React.FC<CrosshairProps> = ({ screenPosition }) => {

  return (
    <div 
      className="fixed pointer-events-none z-50"
      style={{
        left: screenPosition.x - 16, // Center the crosshair on aim point
        top: screenPosition.y - 16,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Outer ring */}
      <div className="w-8 h-8 border-2 border-white rounded-full opacity-80"></div>
      
      {/* Inner dot */}
      <div className="absolute w-2 h-2 bg-white rounded-full opacity-90" style={{ left: '3px', top: '3px' }}></div>
      
      {/* Crosshair lines */}
      <div className="absolute w-12 h-0.5 bg-white opacity-60" style={{ left: '-2px', top: '15px' }}></div>
      <div className="absolute h-12 w-0.5 bg-white opacity-60" style={{ left: '15px', top: '-2px' }}></div>
      
      {/* Glow effect */}
      <div className="absolute w-8 h-8 rounded-full bg-white opacity-20 blur-sm"></div>
    </div>
  )
}

export default Crosshair
