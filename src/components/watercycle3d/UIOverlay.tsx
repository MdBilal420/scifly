import React from 'react'
import { useGameStore } from './useGameStore'

const StageLabel: React.FC = () => {
  const { getCurrentStage } = useGameStore()
  const stage = getCurrentStage()
  const titleMap: Record<string, string> = {
    chapter1_evaporation: 'Chapter 1 — Wake Up, Little Droplet! (Evaporation)',
    chapter2_ascent: 'Chapter 2 — Up, Up, and Away! (Ascent & Cooling)',
    chapter3_cloud: 'Chapter 3 — Cloud Hopping Adventure (Cloud Growth)',
    chapter4_fall: 'Chapter 4 — The Great Fall! (Precipitation)',
    chapter5_forest: 'Chapter 5A — Forest Adventure (Infiltration & Runoff)',
    chapter5_mountain: 'Chapter 5B — Mountain Rapids (Streams & Rivers)',
    chapter5_underground: 'Chapter 5C — Underground Mystery (Aquifers)',
    chapter6_home: 'Chapter 6 — Back Home Again (Collection)'
  }
  return <div className="text-white text-sm opacity-90">{titleMap[stage]}</div>
}

const UIOverlay: React.FC = () => {
  const { status, start, restart, score } = useGameStore()
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <div className="pointer-events-auto bg-sky-900/70 px-3 py-2 rounded text-white text-sm">
          Water Cycle Quest 3D
        </div>
        <div className="pointer-events-auto bg-sky-900/70 px-3 py-2 rounded text-white text-sm">
          <StageLabel />
        </div>
      </div>
      <div className="flex-1" />
      <div className="p-4 flex items-end justify-between">
        <div className="pointer-events-auto bg-sky-900/70 px-3 py-2 rounded text-white text-xs">
          Move: WASD/Arrows &nbsp; Jump: Space &nbsp; Goal: Collect all green orbs each stage
        </div>
        <div className="pointer-events-auto bg-emerald-700/80 px-3 py-2 rounded text-white text-sm">Score: {score}</div>
      </div>
      {status === 'menu' && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 rounded-xl p-6 shadow-xl text-center w-[420px]">
            <div className="text-xl font-semibold text-sky-900">Water Cycle Quest 3D</div>
            <div className="mt-2 text-sky-700">Guide Drippy through evaporation, condensation, precipitation, and collection.</div>
            <button className="mt-4 px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700" onClick={start}>Start</button>
          </div>
        </div>
      )}
      {status === 'completed' && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 rounded-xl p-6 shadow-xl text-center w-[420px]">
            <div className="text-xl font-semibold text-emerald-700">Quest Complete!</div>
            <div className="mt-2 text-slate-700">Great job exploring the water cycle stages.</div>
            <div className="mt-3 text-sky-800 font-semibold">Final Score: {score}</div>
            <button className="mt-4 px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700" onClick={restart}>Restart</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UIOverlay


