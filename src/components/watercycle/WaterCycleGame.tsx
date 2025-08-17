import React, { useEffect, useMemo, useRef, useState } from 'react'

type StageKey =
  | 'evaporation'
  | 'condensation'
  | 'precipitation'
  | 'collection'
  | 'infiltration'
  | 'transpiration'

interface StageDefinition {
  key: StageKey
  title: string
  objective: string
  hint: string
}

const STAGES: StageDefinition[] = [
  {
    key: 'evaporation',
    title: 'Stage 1 — Evaporation',
    objective: 'Add enough heat for the droplet to gain energy and rise into vapor.',
    hint: 'Use the Heat slider to increase energy. Keep it above the threshold long enough to complete the phase change.'
  },
  {
    key: 'condensation',
    title: 'Stage 2 — Condensation',
    objective: 'Cool the air until vapor condenses into a cloud.',
    hint: 'Lower the Temperature slider below the dew point and hold it to form a stable cloud.'
  },
  {
    key: 'precipitation',
    title: 'Stage 3 — Precipitation',
    objective: 'Catch falling droplets to represent precipitation reaching Earth’s surface.',
    hint: 'Use the ← and → arrow keys to move the lake and catch droplets.'
  },
  {
    key: 'collection',
    title: 'Stage 4 — Collection',
    objective: 'Choose where water collects after precipitation.',
    hint: 'Select likely collection points to continue the water cycle.'
  },
  {
    key: 'infiltration',
    title: 'Stage 5 — Infiltration vs Runoff',
    objective: 'Adjust land cover to let the droplet infiltrate to groundwater.',
    hint: 'Toggle tiles to increase soil porosity and help the droplet move downward.'
  },
  {
    key: 'transpiration',
    title: 'Stage 6 — Transpiration',
    objective: 'Open stomata on leaves to release water vapor back to the air.',
    hint: 'Click leaves to open stomata briefly and release vapor. Fill the vapor gauge.'
  }
]

interface HUDProps {
  stage: StageDefinition
  stageIndex: number
  totalStages: number
  xp: number
  glossaryTerm?: string
}

const HUD: React.FC<HUDProps> = ({ stage, stageIndex, totalStages, xp, glossaryTerm }) => {
  return (
    <div className="w-full bg-sky-900 text-white px-4 py-3 flex items-center justify-between">
      <div>
        <div className="text-sm opacity-80">Quest: Journey of a Water Droplet</div>
        <div className="font-semibold">{stage.title} ({stageIndex + 1}/{totalStages})</div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-sm"><span className="opacity-80">XP:</span> <span className="font-semibold">{xp}</span></div>
        {glossaryTerm ? (
          <div className="text-xs bg-sky-800 px-2 py-1 rounded">Glossary: {glossaryTerm}</div>
        ) : null}
      </div>
    </div>
  )
}

interface PanelProps {
  title: string
  objective: string
  hint: string
  children: React.ReactNode
}

const Panel: React.FC<PanelProps> = ({ title, objective, hint, children }) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-4">
        <div className="mb-2">
          <div className="text-sky-900 font-semibold">{title}</div>
          <div className="text-sm text-sky-700">Objective: {objective}</div>
          <div className="text-xs text-sky-600 mt-1">Hint: {hint}</div>
        </div>
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  )
}

interface StageControllerProps {
  onComplete: (earnedXp: number) => void
  setGlossary: (term?: string) => void
}

// Stage 1 — Evaporation: Heat slider and threshold hold
const EvaporationStage: React.FC<StageControllerProps> = ({ onComplete, setGlossary }) => {
  const [heat, setHeat] = useState(0)
  const [hold, setHold] = useState(0)
  const target = 70
  const holdNeededMs = 2600

  useEffect(() => {
    setGlossary('Evaporation — liquid water gains energy and becomes vapor')
  }, [setGlossary])

  useEffect(() => {
    let id: number | undefined
    if (heat >= target) {
      const start = performance.now()
      id = window.requestAnimationFrame(function tick(now) {
        setHold(now - start)
        if (now - start < holdNeededMs) {
          id = window.requestAnimationFrame(tick)
        } else {
          onComplete(50)
        }
      })
    } else {
      setHold(0)
    }
    return () => {
      if (id) cancelAnimationFrame(id)
    }
  }, [heat, onComplete])

  const pct = Math.min(100, Math.round((hold / holdNeededMs) * 100))

  return (
    <div>
      <div className="flex flex-col items-center gap-4">
        <div className="w-full h-32 bg-gradient-to-t from-sky-300 to-sky-200 rounded relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center h-full">
            <div className="w-16 h-16 rounded-full bg-sky-500 shadow-lg transition-transform" style={{ transform: `translateY(-${Math.max(0, heat - target)}px)` }} />
          </div>
          <div className="absolute top-2 right-2 text-xs bg-white/70 px-2 py-1 rounded">Heat: {heat}</div>
          <div className="absolute top-2 left-2 text-xs bg-white/70 px-2 py-1 rounded">Hold: {pct}%</div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={heat}
          onChange={e => setHeat(Number(e.target.value))}
          className="w-full accent-amber-500"
        />
        <div className="text-sm text-sky-700">Hold the heat above {target} to energize the droplet until it evaporates.</div>
      </div>
    </div>
  )
}

// Stage 2 — Condensation: Temperature decrease and dew point hold
const CondensationStage: React.FC<StageControllerProps> = ({ onComplete, setGlossary }) => {
  const [temp, setTemp] = useState(30) // °C
  const [hold, setHold] = useState(0)
  const dewPoint = 12
  const holdNeededMs = 2200

  useEffect(() => {
    setGlossary('Condensation — vapor cools and becomes liquid droplets')
  }, [setGlossary])

  useEffect(() => {
    let id: number | undefined
    if (temp <= dewPoint) {
      const start = performance.now()
      id = window.requestAnimationFrame(function tick(now) {
        setHold(now - start)
        if (now - start < holdNeededMs) {
          id = window.requestAnimationFrame(tick)
        } else {
          onComplete(50)
        }
      })
    } else {
      setHold(0)
    }
    return () => {
      if (id) cancelAnimationFrame(id)
    }
  }, [temp, onComplete])

  const pct = Math.min(100, Math.round((hold / holdNeededMs) * 100))

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full h-32 bg-gradient-to-b from-sky-100 to-slate-100 rounded relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`w-6 h-6 rounded-full transition-all duration-500 ${temp <= dewPoint ? 'bg-slate-400 scale-125' : 'bg-sky-200'} opacity-80`} />
          ))}
        </div>
        <div className="absolute top-2 right-2 text-xs bg-white/70 px-2 py-1 rounded">Temp: {temp}°C</div>
        <div className="absolute top-2 left-2 text-xs bg-white/70 px-2 py-1 rounded">Cloud maturity: {pct}%</div>
      </div>
      <input
        type="range"
        min={-10}
        max={35}
        value={temp}
        onChange={e => setTemp(Number(e.target.value))}
        className="w-full accent-sky-600"
      />
      <div className="text-sm text-sky-700">Cool the air to at or below the dew point ({dewPoint}°C) and hold it until droplets form a stable cloud.</div>
    </div>
  )
}

// Stage 3 — Precipitation: Catch game with arrow keys
const PrecipitationStage: React.FC<StageControllerProps> = ({ onComplete, setGlossary }) => {
  const [bucketX, setBucketX] = useState(150)
  const [drops, setDrops] = useState<{ id: number; x: number; y: number; speed: number }[]>([])
  const [caught, setCaught] = useState(0)
  const [missed, setMissed] = useState(0)
  const needed = 8
  const width = 320
  const height = 200
  const nextDropId = useRef(1)

  useEffect(() => {
    setGlossary('Precipitation — droplets become heavy and fall to Earth')
  }, [setGlossary])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') setBucketX(x => Math.max(0, x - 24))
      if (e.key === 'ArrowRight') setBucketX(x => Math.min(width - 60, x + 24))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    let raf: number
    let last = performance.now()
    function tick(now: number) {
      const dt = Math.min(50, now - last)
      last = now
      setDrops(prev => prev
        .map(d => ({ ...d, y: d.y + d.speed * (dt / 16) }))
        .filter(d => d.y < height + 20))
      // spawn
      if (Math.random() < 0.06) {
        setDrops(prev => [...prev, { id: nextDropId.current++, x: Math.random() * (width - 10), y: -10, speed: 2 + Math.random() * 2 }])
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    // collision + scoring
    setDrops(prev => {
      const bucketRect = { x: bucketX, y: height - 20, w: 60, h: 12 }
      let caughtNow = 0
      const remaining = prev.filter(d => {
        const collide = d.y > bucketRect.y - 8 && d.y < bucketRect.y + bucketRect.h && d.x > bucketRect.x - 8 && d.x < bucketRect.x + bucketRect.w + 8
        if (collide) caughtNow += 1
        return !collide
      })
      if (caughtNow > 0) setCaught(c => c + caughtNow)
      const missedNow = prev.filter(d => d.y >= height).length
      if (missedNow > 0) setMissed(m => m + missedNow)
      return remaining
    })
  }, [bucketX, drops.length])

  useEffect(() => {
    if (caught >= needed) onComplete(70)
  }, [caught, onComplete])

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} className="bg-gradient-to-b from-sky-100 to-sky-200 rounded">
        {/* cloud */}
        <g transform="translate(40,20)">
          <circle cx="40" cy="20" r="20" fill="#d1d5db" />
          <circle cx="60" cy="24" r="24" fill="#cbd5e1" />
          <circle cx="80" cy="20" r="20" fill="#d1d5db" />
        </g>
        {drops.map(d => (
          <circle key={d.id} cx={d.x} cy={d.y} r={4} fill="#0ea5e9" />
        ))}
        {/* bucket as lake */}
        <rect x={bucketX} y={height - 20} width={60} height={12} fill="#38bdf8" rx={6} />
      </svg>
      <div className="mt-2 text-sm text-sky-700">Caught: {caught} / {needed} &nbsp; | &nbsp; Missed: {missed}</div>
      <div className="text-xs text-slate-600">Use Arrow keys to move the lake to collect precipitation.</div>
    </div>
  )
}

// Stage 4 — Collection: Choose where water gathers
const CollectionStage: React.FC<StageControllerProps> = ({ onComplete, setGlossary }) => {
  const [choices, setChoices] = useState<string[]>([])
  const valid = useMemo(() => ['River', 'Lake', 'Ocean'], [])

  useEffect(() => {
    setGlossary('Collection — water gathers in rivers, lakes, oceans, or aquifers')
  }, [setGlossary])

  function toggle(item: string) {
    setChoices(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  useEffect(() => {
    const allSelected = valid.every(v => choices.includes(v))
    if (allSelected) onComplete(40)
  }, [choices, onComplete, valid])

  return (
    <div className="grid grid-cols-3 gap-3">
      {['River', 'Lake', 'Ocean', 'Mountaintop', 'Cloud', 'Parking Lot'].map(opt => {
        const isValid = valid.includes(opt)
        const active = choices.includes(opt)
        return (
          <button
            key={opt}
            className={`border rounded p-3 text-sm ${active ? (isValid ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400') : 'bg-white hover:bg-slate-50'} transition`}
            onClick={() => toggle(opt)}
          >
            {opt}
          </button>
        )
      })}
      <div className="col-span-3 text-xs text-slate-600">Select all places where water collects after it falls. Incorrect choices will not block progress but are highlighted.</div>
    </div>
  )
}

// Stage 5 — Infiltration vs Runoff: Simple grid porosity puzzle
const InfiltrationStage: React.FC<StageControllerProps> = ({ onComplete, setGlossary }) => {
  type Cell = { porosity: number }
  const size = 5
  const [grid, setGrid] = useState<Cell[]>(() => Array.from({ length: size * size }, () => ({ porosity: 0.4 })))
  const [dropletRow, setDropletRow] = useState(0)
  const [dropletCol, setDropletCol] = useState(2)

  useEffect(() => {
    setGlossary('Infiltration — water soaks into the ground; high porosity helps')
  }, [setGlossary])

  function toggleCell(idx: number) {
    setGrid(prev => prev.map((c, i) => i === idx ? { porosity: c.porosity >= 0.7 ? 0.2 : c.porosity + 0.25 } : c))
  }

  useEffect(() => {
    let raf: number
    function step() {
      setDropletRow(r => {
        const nextRow = r + 1
        if (nextRow >= size) {
          onComplete(60)
          return r
        }
        const col = dropletCol
        const below = grid[nextRow * size + col]
        if (below && below.porosity >= 0.65) {
          return nextRow
        } else {
          // try left or right
          const left = grid[r * size + (col - 1)]
          const right = grid[r * size + (col + 1)]
          if (right && right.porosity > (left?.porosity ?? 0)) {
            setDropletCol(c => Math.min(size - 1, c + 1))
          } else if (left && left.porosity >= 0.65) {
            setDropletCol(c => Math.max(0, c - 1))
          }
          return r
        }
      })
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [grid, dropletCol, onComplete])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="grid grid-cols-5 gap-1">
        {grid.map((cell, i) => {
          const r = Math.floor(i / size)
          const c = i % size
          const active = r === dropletRow && c === dropletCol
          return (
            <button
              key={i}
              onClick={() => toggleCell(i)}
              className="w-12 h-12 rounded border flex items-center justify-center"
              style={{ backgroundColor: `rgba(16,185,129, ${cell.porosity})` }}
              title={`Porosity: ${cell.porosity.toFixed(2)}`}
            >
              {active ? '💧' : ''}
            </button>
          )
        })}
      </div>
      <div className="text-xs text-slate-600">Click tiles to increase soil porosity (greener = more porous). Help the droplet reach groundwater at the bottom.</div>
    </div>
  )
}

// Stage 6 — Transpiration clicker: Click leaves to open stomata and release vapor
const TranspirationStage: React.FC<StageControllerProps> = ({ onComplete, setGlossary }) => {
  const [vapor, setVapor] = useState(0)
  const [cooldown, setCooldown] = useState<number | null>(null)
  const needed = 100

  useEffect(() => {
    setGlossary('Transpiration — plants release water vapor through stomata')
  }, [setGlossary])

  useEffect(() => {
    let id: number | undefined
    if (cooldown !== null) {
      const start = performance.now()
      id = requestAnimationFrame(function tick(now) {
        const elapsed = now - start
        if (elapsed < 800) {
          setCooldown(800 - elapsed)
          id = requestAnimationFrame(tick)
        } else {
          setCooldown(null)
        }
      })
    }
    return () => { if (id) cancelAnimationFrame(id) }
  }, [cooldown])

  function clickLeaf() {
    if (cooldown !== null) return
    setVapor(v => Math.min(needed, v + 12))
    setCooldown(800)
  }

  useEffect(() => {
    if (vapor >= needed) onComplete(50)
  }, [vapor, onComplete])

  const pct = Math.round((vapor / needed) * 100)

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={340} height={160} className="bg-green-50 rounded">
        <g onClick={clickLeaf} className="cursor-pointer">
          <ellipse cx="100" cy="80" rx="60" ry="30" fill="#34d399" />
          <ellipse cx="240" cy="70" rx="60" ry="30" fill="#10b981" />
          {/* stem */}
          <rect x="168" y="40" width="4" height="80" fill="#065f46" />
        </g>
        {/* vapor puffs */}
        {Array.from({ length: Math.floor(vapor / 12) }).map((_, i) => (
          <circle key={i} cx={140 + i * 8} cy={50 - i * 6} r={6} fill="#a7f3d0" />
        ))}
      </svg>
      <div className="w-full h-3 bg-slate-200 rounded">
        <div className="h-3 bg-emerald-500 rounded" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-sm text-emerald-700">Vapor released: {pct}% {cooldown !== null ? '(stomata closing...)' : ''}</div>
      <div className="text-xs text-slate-600">Click leaves to briefly open stomata and release vapor into the air.</div>
    </div>
  )
}

const StageView: React.FC<{
  def: StageDefinition
  onComplete: (xp: number) => void
  setGlossary: (term?: string) => void
}> = ({ def, onComplete, setGlossary }) => {
  switch (def.key) {
    case 'evaporation':
      return (
        <Panel title={def.title} objective={def.objective} hint={def.hint}>
          <EvaporationStage onComplete={onComplete} setGlossary={setGlossary} />
        </Panel>
      )
    case 'condensation':
      return (
        <Panel title={def.title} objective={def.objective} hint={def.hint}>
          <CondensationStage onComplete={onComplete} setGlossary={setGlossary} />
        </Panel>
      )
    case 'precipitation':
      return (
        <Panel title={def.title} objective={def.objective} hint={def.hint}>
          <PrecipitationStage onComplete={onComplete} setGlossary={setGlossary} />
        </Panel>
      )
    case 'collection':
      return (
        <Panel title={def.title} objective={def.objective} hint={def.hint}>
          <CollectionStage onComplete={onComplete} setGlossary={setGlossary} />
        </Panel>
      )
    case 'infiltration':
      return (
        <Panel title={def.title} objective={def.objective} hint={def.hint}>
          <InfiltrationStage onComplete={onComplete} setGlossary={setGlossary} />
        </Panel>
      )
    case 'transpiration':
      return (
        <Panel title={def.title} objective={def.objective} hint={def.hint}>
          <TranspirationStage onComplete={onComplete} setGlossary={setGlossary} />
        </Panel>
      )
    default:
      return null
  }
}

const CompletionScreen: React.FC<{ xp: number; onRestart: () => void }>
  = ({ xp, onRestart }) => {
  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <div className="text-2xl font-semibold text-sky-900">Quest Complete!</div>
        <div className="mt-2 text-sky-700">You guided the droplet through the full water cycle.</div>
        <div className="mt-4 text-emerald-700 font-semibold">Total XP Earned: {xp}</div>
        <div className="mt-6">
          <button className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700" onClick={onRestart}>Play Again</button>
        </div>
      </div>
    </div>
  )
}

const WaterCycleGame: React.FC = () => {
  const [stageIndex, setStageIndex] = useState(0)
  const [xp, setXp] = useState(0)
  const [glossary, setGlossary] = useState<string | undefined>()

  const stage = STAGES[stageIndex]

  function handleComplete(earned: number) {
    setXp(x => x + earned)
    setStageIndex(i => i + 1)
  }

  function restart() {
    setStageIndex(0)
    setXp(0)
  }

  return (
    <div className="min-h-[100vh] bg-gradient-to-b from-sky-50 to-sky-100">
      {stage ? (
        <>
          <HUD stage={stage} stageIndex={stageIndex} totalStages={STAGES.length} xp={xp} glossaryTerm={glossary} />
          <div className="w-full max-w-5xl mx-auto mt-4 px-4">
            <div className="bg-white border border-sky-100 rounded-md p-3 text-sky-800 text-sm">
              You are Drippy the Droplet. Complete each quest step to experience how water moves through Earth’s systems.
            </div>
          </div>
          <StageView def={stage} onComplete={handleComplete} setGlossary={setGlossary} />
          <div className="w-full max-w-5xl mx-auto px-4 pb-10">
            <div className="text-xs text-slate-600">Tip: Each stage uses an interaction that models the real driver of that water cycle process (energy, temperature, gravity, surface properties, and biology).</div>
          </div>
        </>
      ) : (
        <>
          <HUD stage={{ key: 'transpiration', title: 'Complete', objective: '', hint: '' }} stageIndex={STAGES.length} totalStages={STAGES.length} xp={xp} />
          <CompletionScreen xp={xp} onRestart={restart} />
        </>
      )}
    </div>
  )
}

export default WaterCycleGame



