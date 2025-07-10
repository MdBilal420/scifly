export interface Topic {
  id: string
  title: string
  description: string
  icon: string
  color: string
  backgroundTheme: 'space' | 'forest' | 'ocean' | 'weather' | 'laboratory' | 'human-body' | 'earth'
  difficulty: 1 | 2 | 3
  estimatedTime: number // in minutes
  keyLearningPoints: string[]
}

export const topics: Topic[] = [
  {
    id: 'solar-system',
    title: 'Solar System & Space',
    description: 'Explore planets, stars, and the mysteries of our solar system!',
    icon: '🪐',
    color: 'purple',
    backgroundTheme: 'space',
    difficulty: 2,
    estimatedTime: 15,
    keyLearningPoints: [
      'Learn about the 8 planets',
      'Understand the Sun and Moon',
      'Discover asteroids and comets',
      'Explore space exploration'
    ]
  },
  {
    id: 'plants-photosynthesis',
    title: 'Plants & Photosynthesis',
    description: 'Discover how plants make their own food and help our planet!',
    icon: '🌱',
    color: 'green',
    backgroundTheme: 'forest',
    difficulty: 2,
    estimatedTime: 12,
    keyLearningPoints: [
      'How plants make food from sunlight',
      'Parts of a plant and their functions',
      'Why plants are important for Earth',
      'Different types of plants'
    ]
  },
  {
    id: 'forces-motion',
    title: 'Forces & Motion',
    description: 'Learn about gravity, friction, and how things move!',
    icon: '⚡',
    color: 'blue',
    backgroundTheme: 'laboratory',
    difficulty: 2,
    estimatedTime: 10,
    keyLearningPoints: [
      'Understanding gravity and weight',
      'Friction and its effects',
      'Simple machines and levers',
      'Motion and speed'
    ]
  },
  {
    id: 'water-cycle',
    title: 'Water Cycle & Weather',
    description: 'Follow water\'s amazing journey through Earth\'s atmosphere!',
    icon: '🌧️',
    color: 'cyan',
    backgroundTheme: 'weather',
    difficulty: 1,
    estimatedTime: 8,
    keyLearningPoints: [
      'Evaporation and condensation',
      'How clouds form',
      'Different types of weather',
      'Water conservation'
    ]
  },
  {
    id: 'human-body',
    title: 'Human Body Systems',
    description: 'Explore the amazing systems that keep you healthy and strong!',
    icon: '🫀',
    color: 'red',
    backgroundTheme: 'human-body',
    difficulty: 3,
    estimatedTime: 18,
    keyLearningPoints: [
      'Circulatory and respiratory systems',
      'Digestive system and nutrition',
      'Skeletal and muscular systems',
      'How to stay healthy'
    ]
  },
  {
    id: 'animals-habitats',
    title: 'Animals & Habitats',
    description: 'Meet amazing animals and discover where they live!',
    icon: '🦁',
    color: 'orange',
    backgroundTheme: 'forest',
    difficulty: 1,
    estimatedTime: 10,
    keyLearningPoints: [
      'Different animal habitats',
      'How animals adapt to their environment',
      'Food chains and ecosystems',
      'Protecting wildlife'
    ]
  },
  {
    id: 'matter-materials',
    title: 'Matter & Materials',
    description: 'Discover the building blocks of everything around us!',
    icon: '🧪',
    color: 'indigo',
    backgroundTheme: 'laboratory',
    difficulty: 2,
    estimatedTime: 14,
    keyLearningPoints: [
      'Solids, liquids, and gases',
      'Properties of materials',
      'Changes in matter',
      'Mixing and separating materials'
    ]
  },
  {
    id: 'earth-surface',
    title: 'Earth\'s Surface',
    description: 'Explore mountains, valleys, and how Earth\'s surface changes!',
    icon: '🏔️',
    color: 'brown',
    backgroundTheme: 'earth',
    difficulty: 2,
    estimatedTime: 12,
    keyLearningPoints: [
      'Landforms and their formation',
      'Rocks and minerals',
      'Erosion and weathering',
      'Earthquakes and volcanoes'
    ]
  },
  {
    id: 'light-sound',
    title: 'Light & Sound',
    description: 'Discover how we see and hear the world around us!',
    icon: '🔆',
    color: 'yellow',
    backgroundTheme: 'laboratory',
    difficulty: 2,
    estimatedTime: 11,
    keyLearningPoints: [
      'How light travels and reflects',
      'Colors and the rainbow',
      'How sound is made and travels',
      'Using light and sound in technology'
    ]
  },
  {
    id: 'ecosystems',
    title: 'Ecosystems & Environment',
    description: 'Learn how all living things depend on each other!',
    icon: '🌍',
    color: 'teal',
    backgroundTheme: 'forest',
    difficulty: 3,
    estimatedTime: 16,
    keyLearningPoints: [
      'Food webs and energy flow',
      'Predators and prey',
      'Environmental protection',
      'Human impact on nature'
    ]
  }
]

export const getTopicById = (id: string): Topic | undefined => {
  return topics.find(topic => topic.id === id)
}

export const getTopicsByDifficulty = (difficulty: number): Topic[] => {
  return topics.filter(topic => topic.difficulty === difficulty)
}

export const getTopicsByTheme = (theme: string): Topic[] => {
  return topics.filter(topic => topic.backgroundTheme === theme)
} 