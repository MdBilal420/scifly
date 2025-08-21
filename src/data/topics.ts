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
  image: string
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
    ],
    image: 'https://czdtrrxwoonaryalnkbc.supabase.co/storage/v1/object/sign/scifly-lessons-diagram/ss.avif?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zZTQzZjY0ZC1mOTQ2LTQwZTktOGQzMC1lZGY4NWZiZjNjOGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzY2lmbHktbGVzc29ucy1kaWFncmFtL3NzLmF2aWYiLCJpYXQiOjE3NTU3NjkxODQsImV4cCI6MTc4NzMwNTE4NH0.6O6Rwe9EZbnoFldjKiK0ZhWd26Vw6HMaaxitPCs4-sQ',
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
    ],
    image: 'https://czdtrrxwoonaryalnkbc.supabase.co/storage/v1/object/sign/scifly-lessons-diagram/photosynthesis.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zZTQzZjY0ZC1mOTQ2LTQwZTktOGQzMC1lZGY4NWZiZjNjOGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzY2lmbHktbGVzc29ucy1kaWFncmFtL3Bob3Rvc3ludGhlc2lzLnBuZyIsImlhdCI6MTc1NTc2OTk1NywiZXhwIjoxNzg3MzA1OTU3fQ.IRJOzQs8v6FUq6ZrdVi3EDDkqmVJsGXuUnCXEXH7_z0'
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
    ],
    image: 'https://czdtrrxwoonaryalnkbc.supabase.co/storage/v1/object/sign/scifly-lessons-diagram/gg.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zZTQzZjY0ZC1mOTQ2LTQwZTktOGQzMC1lZGY4NWZiZjNjOGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzY2lmbHktbGVzc29ucy1kaWFncmFtL2dnLmpwZyIsImlhdCI6MTc1NTc2OTI0NywiZXhwIjoxNzg3MzA1MjQ3fQ.ggW04D3rjkP3nI99K1mXeLWJBxBiRqvW-Y6dzj3Fqwg'
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
    ],
    image: 'https://czdtrrxwoonaryalnkbc.supabase.co/storage/v1/object/sign/scifly-lessons-diagram/wc.avif?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zZTQzZjY0ZC1mOTQ2LTQwZTktOGQzMC1lZGY4NWZiZjNjOGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzY2lmbHktbGVzc29ucy1kaWFncmFtL3djLmF2aWYiLCJpYXQiOjE3NTU3NjY1MzgsImV4cCI6MTgxODgzODUzOH0.cMitP4SxeOHlpjrePpvoObB06KER4xLL0lp8d5fwZh0'
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
    ],
    image: 'https://czdtrrxwoonaryalnkbc.supabase.co/storage/v1/object/sign/scifly-lessons-diagram/hb.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zZTQzZjY0ZC1mOTQ2LTQwZTktOGQzMC1lZGY4NWZiZjNjOGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzY2lmbHktbGVzc29ucy1kaWFncmFtL2hiLmpwZyIsImlhdCI6MTc1NTc2OTI4MCwiZXhwIjoxNzg3MzA1MjgwfQ.E_w-a40DxwJGCpnY4MxmM26BUeiq7N6xpk64R0TXlkA'
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
    ],
    image: 'https://czdtrrxwoonaryalnkbc.supabase.co/storage/v1/object/sign/scifly-lessons-diagram/ff.avif?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zZTQzZjY0ZC1mOTQ2LTQwZTktOGQzMC1lZGY4NWZiZjNjOGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzY2lmbHktbGVzc29ucy1kaWFncmFtL2ZmLmF2aWYiLCJpYXQiOjE3NTU3NjkzNzgsImV4cCI6MTc4NzMwNTM3OH0.ea9bgI2zHbVVO3nEaDP0zsUyb9N0lMXiIw0tm2won0w'
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
    ],
    image: 'https://czdtrrxwoonaryalnkbc.supabase.co/storage/v1/object/sign/scifly-lessons-diagram/som.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zZTQzZjY0ZC1mOTQ2LTQwZTktOGQzMC1lZGY4NWZiZjNjOGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzY2lmbHktbGVzc29ucy1kaWFncmFtL3NvbS53ZWJwIiwiaWF0IjoxNzU1NzY5NDAwLCJleHAiOjE3ODczMDU0MDB9.zRw8yBlrR8BsjYEKNzC1OKDblITt-f2lPPve-rJ6bQc'
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
    ],
    image: 'https://czdtrrxwoonaryalnkbc.supabase.co/storage/v1/object/sign/scifly-lessons-diagram/mm.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zZTQzZjY0ZC1mOTQ2LTQwZTktOGQzMC1lZGY4NWZiZjNjOGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzY2lmbHktbGVzc29ucy1kaWFncmFtL21tLmpwZyIsImlhdCI6MTc1NTc2OTQ0NCwiZXhwIjoxNzg3MzA1NDQ0fQ.PWsNs4oq5UIEJWV-l_buUij7M2Ov2OXjpZZtcGukXWw'
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
    ],
    image: 'https://czdtrrxwoonaryalnkbc.supabase.co/storage/v1/object/sign/scifly-lessons-diagram/rainbow.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zZTQzZjY0ZC1mOTQ2LTQwZTktOGQzMC1lZGY4NWZiZjNjOGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzY2lmbHktbGVzc29ucy1kaWFncmFtL3JhaW5ib3cucG5nIiwiaWF0IjoxNzU1NzY5NDYyLCJleHAiOjE3ODczMDU0NjJ9.Y-ARNx-8_68QZJBZcFrPqyMUi0fW1XgIQ2Y-XqZ_xQE'
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
    ],
    image: 'https://czdtrrxwoonaryalnkbc.supabase.co/storage/v1/object/sign/scifly-lessons-diagram/ff.avif?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zZTQzZjY0ZC1mOTQ2LTQwZTktOGQzMC1lZGY4NWZiZjNjOGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzY2lmbHktbGVzc29ucy1kaWFncmFtL2ZmLmF2aWYiLCJpYXQiOjE3NTU3Njk1NTEsImV4cCI6MTc4NzMwNTU1MX0.SIXrLsr6K7SFdG8XQQoe4cFaisTW0bDloCf8tdp5fgQ'
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