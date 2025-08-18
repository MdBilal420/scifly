import React from 'react'
import { useCloudCatcherStore } from './useCloudCatcherStore'

const UIOverlay: React.FC = () => {
  const { state, dispatch } = useCloudCatcherStore()
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Top HUD */}
      <div className="pointer-events-auto p-4 flex justify-between items-center">
        <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-lg shadow text-gray-800">
          Score: <span className="font-bold">{state.score}</span>
        </div>
        <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-lg shadow text-gray-800 flex items-center gap-2">
          <div className="w-40 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${state.cloudCapacity * 100}%` }} />
          </div>
          <span className="text-sm">Cloud Capacity</span>
        </div>
        <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-lg shadow text-gray-800">
          Cycles: <span className="font-bold">{state.cyclesCompleted}</span>
        </div>
      </div>

      {/* Center prompts */}
      {state.status === 'menu' && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md">
            <div className="text-4xl mb-2">☁️ Cloud Catcher</div>
            <div className="text-gray-700 mb-4">
              Move the cloud with Left/Right arrows to catch rising vapor. Fill the cloud and make it rain!
            </div>
            <div className="bg-blue-50 p-3 rounded mb-4 text-sm text-blue-800">
              Educational Goal: Condensation → Precipitation loop
            </div>
            <button onClick={() => dispatch({ type: 'START' })} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
              Start
            </button>
          </div>
        </div>
      )}

      {state.status === 'rain' && (
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 text-white px-4 py-2 rounded">
          Precipitation: The cloud is full — it rains!
        </div>
      )}

      {/* Gust indicator */}
      {state.gustActive && (
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 bg-sky-600/80 text-white px-3 py-1 rounded shadow text-sm">
          Whoosh! Wind gust {state.gustDirection === 1 ? '→' : '←'} ({state.gustStrength})
        </div>
      )}

      {/* Bottom controls hint */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur px-4 py-2 rounded shadow text-gray-800 text-sm">
        ← → Move • Z Pull Vapors • X Freeze Time • Random wind gusts every few seconds!
      </div>
    </div>
  )
}

export default UIOverlay


