import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppSelector } from '../hooks/redux'
import DynamicBackground from '../components/DynamicBackground'
import UserMenu from '../components/UserMenu'
import SimbaMascot from '../components/SimbaMascot'
import PrimaryButton from '../components/PrimaryButton'
import { MdArrowBack } from 'react-icons/md'

interface PlayGameScreenProps {
  onNavigate: (screen: string) => void
}

type Stage = 'evaporation' | 'condensation' | 'precipitation' | 'collection' | 'quiz' | 'results'

type QuizQuestion = {
  id: string
  question: string
  options: string[]
  correctIndex: number
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What makes water evaporate?',
    options: ['Cold air', 'Heat from the sun', 'Strong wind', 'Clouds'],
    correctIndex: 1
  },
  {
    id: 'q2',
    question: 'What happens when water vapor gets cold?',
    options: ['It evaporates', 'It condenses', 'It disappears', 'It boils'],
    correctIndex: 1
  },
  {
    id: 'q3',
    question: 'What is it called when water falls from clouds?',
    options: ['Evaporation', 'Condensation', 'Precipitation', 'Collection'],
    correctIndex: 2
  },
  {
    id: 'q4',
    question: 'Where does water go after it falls?',
    options: [
      'Into space',
      'It stays in the air',
      'It collects in rivers, lakes, and oceans',
      'It turns into rocks'
    ],
    correctIndex: 2
  }
]

const stageTitles: Record<Stage, string> = {
  evaporation: "Stage 1: Evaporation",
  condensation: "Stage 2: Condensation",
  precipitation: "Stage 3: Precipitation",
  collection: "Stage 4: Collection",
  quiz: 'Quick Quiz',
  results: 'Results'
}

const stageLearnText: Record<Exclude<Stage, 'quiz' | 'results'>, string> = {
  evaporation: 'Heat from the sun causes water to evaporate (become water vapor).',
  condensation: 'Cool air causes water vapor to condense into tiny droplets (clouds).',
  precipitation: 'When clouds get heavy, water falls as precipitation (rain, snow, sleet, hail).',
  collection: 'Water collects in rivers, lakes, and oceans to start the cycle again.'
}

const PlayGameScreen: React.FC<PlayGameScreenProps> = ({ onNavigate }) => {
  const { currentTopic } = useAppSelector((state) => state.topics)

  const [stage, setStage] = useState<Stage>('evaporation')
  const [showLearn, setShowLearn] = useState<boolean>(true)
  const [condenseClicks, setCondenseClicks] = useState<number>(0)
  const [cloudFull, setCloudFull] = useState<boolean>(false)
  const [evaporated, setEvaporated] = useState<boolean>(false)
  const [collected, setCollected] = useState<boolean>(false)
  const [evaporationClicks, setEvaporationClicks] = useState<number>(0)
  const [energyBursts, setEnergyBursts] = useState<number[]>([])
  const [showEvapHint, setShowEvapHint] = useState<boolean>(false)
  const [answers, setAnswers] = useState<Record<string, number | null>>({})
  const [score, setScore] = useState<number>(0)

  useEffect(() => {
    if (!currentTopic) {
      onNavigate('activity')
    }
  }, [currentTopic, onNavigate])

  useEffect(() => {
    // Reset per-stage UI helpers
    setCondenseClicks(0)
    setCloudFull(false)
    setEvaporated(false)
    setCollected(false)
    setEvaporationClicks(0)
    setEnergyBursts([])
    setShowEvapHint(false)
    // Show learning popup at stage start, except quiz/results
    if (stage === 'quiz' || stage === 'results') {
      setShowLearn(false)
    } else {
      setShowLearn(true)
    }
  }, [stage])

  useEffect(() => {
    if (stage === 'evaporation') {
      if (evaporationClicks >= 3) {
        setEvaporated(true)
      } else {
        setEvaporated(false)
      }
    }
  }, [stage, evaporationClicks])

  const canProceed = useMemo(() => {
    switch (stage) {
      case 'evaporation':
        return evaporated
      case 'condensation':
        return condenseClicks >= 3
      case 'precipitation':
        return cloudFull
      case 'collection':
        return collected
      default:
        return true
    }
  }, [stage, evaporated, condenseClicks, cloudFull, collected])

  if (!currentTopic) {
    return null
  }

  const goNextStage = () => {
    // This function will now be used by the Continue button to advance stages
    setStage((prev) => {
      if (prev === 'evaporation') return 'condensation'
      if (prev === 'condensation') return 'precipitation'
      if (prev === 'precipitation') return 'collection'
      if (prev === 'collection') return 'quiz'
      return prev
    })
  }

  const closeLearnCard = () => setShowLearn(false)

  const resetGame = () => {
    setStage('evaporation')
    setShowLearn(true)
    setCondenseClicks(0)
    setCloudFull(false)
    setEvaporated(false)
    setCollected(false)
    setEvaporationClicks(0)
    setEnergyBursts([])
    setShowEvapHint(false)
    setAnswers({})
    setScore(0)
  }

  const submitQuiz = () => {
    let correct = 0
    for (const q of quizQuestions) {
      if (answers[q.id] === q.correctIndex) correct += 1
    }
    setScore(correct)
    setStage('results')
  }

  // Scenes
  const EvaporationScene = () => {
    const heatProgress = Math.min(1, evaporationClicks / 3)
    const narratorText = evaporationClicks === 0
      ? "Meet Aqua the water droplet! She's ready to start an amazing journey."
      : evaporationClicks === 1
      ? 'The sun is warming the water. Watch the temperature rise!'
      : evaporationClicks === 2
      ? 'Heat makes water molecules move faster into invisible water vapor!'
      : "I\'m water vapor now! The sun\'s heat helped me float up!"

    const triggerEnergyBurst = () => {
      setEnergyBursts((prev) => [...prev, Date.now()])
    }

    const handleSceneClick = () => {
      setShowEvapHint(true)
      setTimeout(() => setShowEvapHint(false), 1200)
    }

    const handleSunClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      setEvaporationClicks((c) => Math.min(3, c + 1))
      triggerEnergyBurst()
    }

    return (
      <div className="space-y-3">
        {/* Narrator */}
        <div className="text-center text-sm md:text-base text-gray-700">{narratorText}</div>
        <div
          className="relative w-full h-72 md:h-80 rounded-3xl overflow-hidden"
          onClick={handleSceneClick}
        >
          {/* Sky */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-sky-300" />

          {/* Sun with gentle pulse */}
          <motion.button
            whileHover={{ scale: 1.08, boxShadow: '0 0 30px rgba(250, 204, 21, 0.6)' }}
            whileTap={{ scale: 0.95 }}
            animate={{ scale: [1, 1.03, 1], boxShadow: ['0 0 0px rgba(0,0,0,0)', '0 0 18px rgba(250, 204, 21, 0.45)', '0 0 0px rgba(0,0,0,0)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            onClick={handleSunClick}
            className="absolute top-4 right-6 w-20 h-20 md:w-24 md:h-24 rounded-full bg-yellow-300 flex items-center justify-center text-3xl cursor-pointer"
            aria-label="Sun"
          >
            ☀️
          </motion.button>

          {/* Energy bursts from sun to water */}
          {energyBursts.map((id) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], y: 120 }}
              transition={{ duration: 1.2 }}
              className="absolute right-8 top-24 text-yellow-400"
            >
              {'✨ ✨ ✨ ✨ ✨'.split(' ').map((s, i) => (
                <motion.span
                  key={i}
                  initial={{ x: 0 }}
                  animate={{ x: (i - 2) * 14 }}
                  transition={{ duration: 1.2 }}
                  className="inline-block mr-1"
                >
                  ✨
                </motion.span>
              ))}
            </motion.div>
          ))}

          {/* Thermometer */}
          <div className="absolute top-6 left-4 w-4 md:w-5 h-40 md:h-48 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-red-500"
              style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
              animate={{ height: `${Math.max(8, heatProgress * 100)}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>

          {/* Ocean with simple wave motion */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-28 md:h-32 bg-blue-500/80"
            animate={{ y: [0, -4 - heatProgress * 4, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Molecules on the water surface */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-xs md:text-sm"
              style={{ bottom: 30 + (i % 3) * 8, left: `${8 + (i * 7) % 84}%` }}
              animate={{ x: [(i % 2 === 0 ? -1 : 1) * (4 + heatProgress * 8), 0, (i % 2 === 0 ? 1 : -1) * (4 + heatProgress * 8)] }}
              transition={{ duration: 2.2 - heatProgress, repeat: Infinity }}
            >
              ⚪
            </motion.div>
          ))}

          {/* Aqua droplet hero */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 text-5xl"
            initial={false}
            animate={{ bottom: 40 + heatProgress * 80, opacity: 1 - heatProgress * 0.15, filter: `brightness(${1 + heatProgress * 0.2})` }}
            transition={{ duration: 0.8 }}
          >
            💧
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-base">Aqua</div>
          </motion.div>

          {/* Vapor particles rising as heat increases */}
          {evaporationClicks > 0 && (
            <div className="absolute inset-x-0 bottom-28 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-[10px] text-gray-200"
                  style={{ left: `${(i * 5) % 100}%` }}
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: -60 - i * 2, opacity: [0, 0.8, 0] }}
                  transition={{ duration: 2 + (i % 5) * 0.2, repeat: Infinity, delay: (i % 7) * 0.1 }}
                >
                  •
                </motion.div>
              ))}
            </div>
          )}

          {/* Hint overlay for wrong clicks */}
          <AnimatePresence>
            {showEvapHint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm">Try clicking the sun to add heat energy!</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar for evaporation */}
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div className="h-full bg-orange-400" animate={{ width: `${heatProgress * 100}%` }} transition={{ duration: 0.6 }} />
        </div>
      </div>
    )
  }

  const CondensationScene = () => {
    return (
      <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden bg-gradient-to-b from-blue-100 to-blue-300">
        {/* Cold air particles to click */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCondenseClicks((c) => Math.min(5, c + 1))}
            className="absolute w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/70 backdrop-blur flex items-center justify-center text-xl shadow"
            style={{
              top: `${20 + i * 12}%`,
              left: `${10 + (i * 15) % 70}%`
            }}
            aria-label="Cold air particle"
          >
            ❄️
          </motion.button>
        ))}
        {/* Cloud grows with clicks */}
        <motion.div
          animate={{ scale: 1 + condenseClicks * 0.1, opacity: 0.6 + condenseClicks * 0.08 }}
          className="absolute top-10 left-1/2 -translate-x-1/2 text-7xl"
        >
          ☁️
        </motion.div>
      </div>
    )
  }

  const PrecipitationScene = () => {
    return (
      <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden bg-gradient-to-b from-slate-200 to-slate-400">
        {/* Heavy cloud */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCloudFull(true)}
          className="absolute top-8 left-1/2 -translate-x-1/2 text-8xl"
          aria-label="Cloud"
        >
          🌧️
        </motion.button>
        {/* Rain drops appear once cloudFull */}
        <AnimatePresence>
          {cloudFull && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0"
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 180, opacity: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.8, repeat: Infinity, repeatDelay: 0.8 }}
                  className="absolute text-2xl"
                  style={{ left: `${5 + (i * 8) % 90}%`, top: `${20 + (i % 3) * 8}%` }}
                >
                  💧
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const CollectionScene = () => {
    const handleTargetClick = (target: 'river' | 'rock' | 'tree') => {
      if (target === 'river') {
        setCollected(true)
      } else {
        // small shake on wrong targets handled via keyframe or just ignore
      }
    }
    return (
      <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden bg-gradient-to-b from-emerald-100 to-emerald-300">
        {/* River target */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleTargetClick('river')}
          className="absolute bottom-0 left-0 right-0 h-20 md:h-24 bg-blue-500/80 text-white font-bold"
          aria-label="River"
        >
          <span className="absolute left-1/2 -translate-x-1/2 top-1 text-white/90">River</span>
        </motion.button>
        {/* Wrong targets */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleTargetClick('tree')}
          className="absolute bottom-24 left-10 text-4xl"
          aria-label="Tree"
        >
          🌳
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleTargetClick('rock')}
          className="absolute bottom-28 right-12 text-4xl"
          aria-label="Rock"
        >
          🪨
        </motion.button>
        {/* Droplet falls into river once collected */}
        <AnimatePresence>
          {collected && (
            <motion.div
              initial={{ y: -80, opacity: 0 }}
              animate={{ y: 80, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute left-1/2 -translate-x-1/2 top-10 text-5xl"
            >
              💧
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Learning popup for stages
  const LearnCard = () => {
    if (stage === 'quiz' || stage === 'results') return null
    return (
      <AnimatePresence>
        {showLearn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-w-md w-[90%] bg-white rounded-2xl p-6 text-center shadow-xl"
            >
              <div className="mb-2 text-2xl">🧠</div>
              <h3 className="font-comic text-xl font-bold text-gray-800 mb-2">{stageTitles[stage]}</h3>
              <p className="text-gray-700 mb-4">{stageLearnText[stage as Exclude<Stage, 'quiz' | 'results'>]}</p>
              <PrimaryButton onClick={closeLearnCard} className="w-full" icon="🎮">
                Start
              </PrimaryButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  const QuizView = () => {
    return (
      <div className="space-y-6">
        {quizQuestions.map((q, idx) => (
          <div key={q.id} className="bg-white/90 rounded-xl p-4 shadow">
            <div className="flex items-start gap-3">
              <div className="text-xl">{idx + 1}.</div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800 mb-3">{q.question}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {q.options.map((opt, i) => {
                    const selected = answers[q.id] === i
                    return (
                      <button
                        key={i}
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                        className={`text-left rounded-lg border p-3 transition-all ${
                          selected ? 'bg-green-100 border-green-400' : 'bg-white hover:bg-gray-50 border-gray-300'
                        }`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
        <PrimaryButton
          onClick={submitQuiz}
          className="w-full"
          icon="✅"
        >
          Submit Answers
        </PrimaryButton>
      </div>
    )
  }

  const ResultsView = () => {
    const passed = score >= 3
    return (
      <div className="text-center space-y-4">
        <div className="text-6xl">{passed ? '🌈' : '🔄'}</div>
        <div className="font-comic text-2xl font-bold text-gray-800">
          {passed ? 'Great job!' : 'Nice try!'} You scored {score}/4
        </div>
        {!passed && (
          <div className="text-gray-700">Score 3 or more to meet the goal.</div>
        )}
        <div className="bg-white/90 rounded-xl p-4 text-left">
          <div className="font-semibold mb-2">Quick Review</div>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>Evaporation: Heat from the sun turns water into vapor.</li>
            <li>Condensation: Cool air turns vapor into tiny droplets (clouds).</li>
            <li>Precipitation: Water falls from clouds as rain, snow, sleet, or hail.</li>
            <li>Collection: Water gathers in rivers, lakes, and oceans.</li>
          </ul>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <PrimaryButton onClick={resetGame} icon="🔁" className="w-full">
            Play Again
          </PrimaryButton>
          <PrimaryButton onClick={() => onNavigate('activity')} icon="🏠" className="w-full">
            Back to Activities
          </PrimaryButton>
        </div>
      </div>
    )
  }

  const StageContent = () => {
    switch (stage) {
      case 'evaporation':
        return <EvaporationScene />
      case 'condensation':
        return <CondensationScene />
      case 'precipitation':
        return <PrecipitationScene />
      case 'collection':
        return <CollectionScene />
      case 'quiz':
        return <QuizView />
      case 'results':
        return <ResultsView />
      default:
        return null
    }
  }

  return (
    <DynamicBackground theme={currentTopic.backgroundTheme}>
      <div className="min-h-screen p-4">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <motion.button
              className="bg-white/20 backdrop-blur rounded-full p-3 text-white hover:bg-white/30 transition-all duration-300"
              onClick={() => onNavigate('activity')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {(MdArrowBack as any)({ style: { display: 'inline', fontSize: '20px' } })}
            </motion.button>
            <div>
              <h1 className="font-comic text-2xl font-bold text-white">Droplet's Journey</h1>
              <p className="text-white/80 text-sm">Click to guide the droplet through the water cycle</p>
            </div>
          </div>
          <UserMenu />
        </motion.header>

        {/* Content Card */}
        <motion.div
          className="max-w-3xl mx-auto bg-white/90 backdrop-blur rounded-3xl p-6 md:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="font-comic text-xl font-bold text-gray-800">{stageTitles[stage]}</div>
            <div className="text-sm text-gray-600">Stage {['evaporation','condensation','precipitation','collection'].indexOf(stage) + 1 || '-'} of 4</div>
          </div>

          {stage !== 'quiz' && stage !== 'results' && (
            <div className="flex justify-center mb-4">
              <SimbaMascot size="md" animate={true} />
            </div>
          )}

          <StageContent />

          {/* Footer controls for stages 1-4 */}
          {stage !== 'quiz' && stage !== 'results' && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              <PrimaryButton onClick={() => onNavigate('activity')} className="w-full" icon="🏠">
                Back to Activities
              </PrimaryButton>
              <PrimaryButton
                onClick={() => canProceed && goNextStage()}
                disabled={!canProceed}
                className="w-full"
                icon="➡️"
              >
                {stage === 'collection' ? 'Ready for Quiz' : 'Continue'}
              </PrimaryButton>
            </div>
          )}

          {stage === 'quiz' && (
            <div className="mt-4">
              <QuizView />
            </div>
          )}

          {stage === 'results' && (
            <div className="mt-2">
              <ResultsView />
            </div>
          )}
        </motion.div>
      </div>
      <LearnCard />
    </DynamicBackground>
  )
}

export default PlayGameScreen 