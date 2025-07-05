import { lazy } from 'react'

// Lazy load components based on user speed to improve initial load times
export const LazyComponents = {
  // Phase 2 Speed-based Components
  SpeedBasedLayout: lazy(() => import('../components/layouts/SpeedBasedLayout')),
  VisualContentRenderer: lazy(() => import('../components/content/VisualContentRenderer')),
  InteractiveContentRenderer: lazy(() => import('../components/content/InteractiveContentRenderer')),
  ConversationalContentRenderer: lazy(() => import('../components/content/ConversationalContentRenderer')),
  MasterContentRenderer: lazy(() => import('../components/content/MasterContentRenderer')),
  
  // Phase 3 AI Components
  AIContentRenderer: lazy(() => import('../components/ai/AIContentRenderer')),
  SmartHintSystem: lazy(() => import('../components/ai/SmartHintSystem')),
  AdaptiveQuestioningInterface: lazy(() => import('../components/ai/AdaptiveQuestioningInterface')),
  PersonalizedFeedback: lazy(() => import('../components/ai/PersonalizedFeedback')),
  
  // Phase 5 Advanced Components
  ThreeDVisualization: lazy(() => import('../components/advanced/3DVisualization')),
  AdvancedSimulations: lazy(() => import('../components/advanced/AdvancedSimulations')),
  SpeedAwareChatInterface: lazy(() => import('../components/advanced/SpeedAwareChatInterface')),
  
  // Demo Components
  Phase2Demo: lazy(() => import('../components/Phase2Demo')),
  Phase3Demo: lazy(() => import('../components/Phase3Demo'))
}

// Code splitting strategy based on user speed
export const getComponentsForSpeed = (userSpeed: number) => {
  const baseComponents = [
    'SpeedBasedLayout',
    'MasterContentRenderer'
  ]
  
  const speedSpecificComponents: Record<number, string[]> = {
    1: ['VisualContentRenderer'],
    2: ['VisualContentRenderer', 'InteractiveContentRenderer'],
    3: ['VisualContentRenderer', 'InteractiveContentRenderer', 'ConversationalContentRenderer'],
    4: ['ConversationalContentRenderer', 'AIContentRenderer', 'SmartHintSystem'],
    5: ['ConversationalContentRenderer', 'AIContentRenderer', 'ThreeDVisualization', 'AdvancedSimulations']
  }
  
  return [
    ...baseComponents,
    ...(speedSpecificComponents[userSpeed] || speedSpecificComponents[3])
  ]
}

// Preload components based on likely next actions
export const preloadComponentsForUser = async (userSpeed: number, currentRoute: string) => {
  const preloadPromises: Promise<any>[] = []
  
  if (currentRoute === 'home') {
    // Likely to go to lessons next
    preloadPromises.push(import('../components/content/MasterContentRenderer'))
    if (userSpeed >= 3) {
      preloadPromises.push(import('../components/ai/AIContentRenderer'))
    }
  } else if (currentRoute === 'lesson') {
    // Likely to use interactive features
    if (userSpeed <= 2) {
      preloadPromises.push(import('../components/content/VisualContentRenderer'))
    } else if (userSpeed >= 4) {
      preloadPromises.push(import('../components/advanced/SpeedAwareChatInterface'))
    }
  }
  
  await Promise.all(preloadPromises)
}

// Memory optimization utilities
export const optimizeMemoryUsage = () => {
  // Clear unused components from memory
  if (typeof window !== 'undefined' && 'gc' in window && typeof window.gc === 'function') {
    window.gc()
  }
  
  // Clear cached images that haven't been used recently
  clearUnusedImageCache()
}

const clearUnusedImageCache = () => {
  const images = document.querySelectorAll('img')
  images.forEach(img => {
    if (!img.isConnected || img.offsetParent === null) {
      img.src = ''
      img.srcset = ''
    }
  })
}

// Bundle size analyzer for development
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const memoryInfo = (performance as any).memory || {}
    const bundleAnalysis = {
      loadedChunks: (window as any).__webpack_require__?.cache || {},
      memoryUsage: memoryInfo,
      componentStats: getComponentLoadStats()
    }
    
    console.table({
      'Total Chunks': Object.keys(bundleAnalysis.loadedChunks).length,
      'Memory Used (MB)': Math.round((memoryInfo.usedJSHeapSize || 0) / 1024 / 1024),
      'Memory Limit (MB)': Math.round((memoryInfo.jsHeapSizeLimit || 0) / 1024 / 1024),
      'Components Loaded': bundleAnalysis.componentStats.loaded,
      'Components Pending': bundleAnalysis.componentStats.pending
    })
    
    return bundleAnalysis
  }
}

const getComponentLoadStats = () => {
  const stats = {
    loaded: 0,
    pending: 0,
    failed: 0
  }
  
  Object.values(LazyComponents).forEach(component => {
    try {
      if ((component as any)._result) {
        stats.loaded++
      } else {
        stats.pending++
      }
    } catch {
      stats.failed++
    }
  })
  
  return stats
}

// Progressive loading strategy
export const setupProgressiveLoading = (userSpeed: number) => {
  // Priority loading based on user speed
  const loadingPriorities = {
    1: ['essential', 'visual'],
    2: ['essential', 'visual', 'interactive'],
    3: ['essential', 'visual', 'interactive', 'conversational'],
    4: ['essential', 'conversational', 'ai', 'advanced'],
    5: ['essential', 'ai', 'advanced', 'experimental']
  }
  
  const priorities = loadingPriorities[userSpeed as keyof typeof loadingPriorities] || loadingPriorities[3]
  
  // Load components in priority order with delays
  priorities.forEach((priority, index) => {
    setTimeout(() => {
      loadComponentsByPriority(priority)
    }, index * 500) // Stagger loading by 500ms
  })
}

const loadComponentsByPriority = async (priority: string) => {
  const componentImports = {
    essential: [
      () => import('../components/layouts/SpeedBasedLayout'),
      () => import('../components/content/MasterContentRenderer')
    ],
    visual: [
      () => import('../components/content/VisualContentRenderer')
    ],
    interactive: [
      () => import('../components/content/InteractiveContentRenderer')
    ],
    conversational: [
      () => import('../components/content/ConversationalContentRenderer'),
      () => import('../components/advanced/SpeedAwareChatInterface')
    ],
    ai: [
      () => import('../components/ai/AIContentRenderer'),
      () => import('../components/ai/SmartHintSystem')
    ],
    advanced: [
      () => import('../components/advanced/3DVisualization'),
      () => import('../components/advanced/AdvancedSimulations')
    ],
    experimental: [
      () => import('../components/Phase3Demo')
    ]
  }
  
  const importFunctions = componentImports[priority as keyof typeof componentImports] || []
  
  try {
    await Promise.all(importFunctions.map(importFn => importFn()))
    console.log(`✅ Loaded ${priority} components`)
  } catch (error) {
    console.warn(`⚠️ Failed to preload ${priority} components:`, error)
  }
}

export default {
  LazyComponents,
  getComponentsForSpeed,
  preloadComponentsForUser,
  optimizeMemoryUsage,
  analyzeBundleSize,
  setupProgressiveLoading
} 