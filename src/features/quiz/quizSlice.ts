import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizState {
  currentQuiz: string | null
  questions: QuizQuestion[]
  currentQuestionIndex: number
  answers: { [questionId: string]: number }
  score: number
  totalQuestions: number
  isCompleted: boolean
  showResults: boolean
}

const sampleQuestions: QuizQuestion[] = [
  {
    id: 'gravity-1',
    question: 'What makes things fall down to Earth?',
    options: ['Magic', 'Gravity', 'Wind', 'Magnets'],
    correctAnswer: 1,
    explanation: 'Gravity is the force that pulls objects toward Earth!'
  },
  {
    id: 'gravity-2',
    question: 'What would happen if you dropped a ball on the Moon?',
    options: ['It would float away', 'It would fall slower than on Earth', 'It would fall faster', 'Nothing would happen'],
    correctAnswer: 1,
    explanation: 'The Moon has less gravity than Earth, so things fall slower!'
  }
]

const initialState: QuizState = {
  currentQuiz: null,
  questions: sampleQuestions,
  currentQuestionIndex: 0,
  answers: {},
  score: 0,
  totalQuestions: sampleQuestions.length,
  isCompleted: false,
  showResults: false,
}

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    startQuiz: (state, action: PayloadAction<string>) => {
      state.currentQuiz = action.payload
      state.currentQuestionIndex = 0
      state.answers = {}
      state.score = 0
      state.isCompleted = false
      state.showResults = false
    },
    answerQuestion: (state, action: PayloadAction<{ questionId: string; answer: number }>) => {
      state.answers[action.payload.questionId] = action.payload.answer
      
      const question = state.questions.find(q => q.id === action.payload.questionId)
      if (question && action.payload.answer === question.correctAnswer) {
        state.score += 1
      }
    },
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1
      } else {
        state.isCompleted = true
        state.showResults = true
      }
    },
    resetQuiz: (state) => {
      state.currentQuestionIndex = 0
      state.answers = {}
      state.score = 0
      state.isCompleted = false
      state.showResults = false
    },
  },
})

export const { startQuiz, answerQuestion, nextQuestion, resetQuiz } = quizSlice.actions
export default quizSlice.reducer 