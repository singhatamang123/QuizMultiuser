import { create } from 'zustand'

export type GameScreen = 'join' | 'lobby' | 'review' | 'countdown' | 'question' | 'scoring' | 'gameover' | 'disconnected'

export interface Player {
  id: string
  name: string
  tole: string
  avatar: string          // ← Emoji or code
  score: number
  streak: number
}

export interface ReviewQuestion {
  text: string
  options: string[]
  answer: string
  explanation: string
  category: string
}

export interface Question {
  index: number
  total: number
  text: string
  options: string[]
  category: string
  time_limit: number
}

export interface AnswerResult {
  correct: boolean
  points: number
  your_total: number
  streak: number
}

export interface RoundResult {
  correct_answer: string
  explanation: string
  leaderboard: Player[]
}

interface QuizState {
  // identity
  myName: string
  myTole: string
  myAvatar: string
  myId: string
  isHost: boolean
  roomCode: string

  // game
  screen: GameScreen
  players: Player[]
  reviewQuestions: ReviewQuestion[] | null
  countdown: number
  question: Question | null
  answerResult: AnswerResult | null
  selectedAnswer: string | null
  streak: number
  roundResult: RoundResult | null
  finalLeaderboard: Player[]
  answeredPlayers: string[] // List of IDs who answered current question
  analytics: any[]

  // actions
  setIdentity: (name: string, tole: string, avatar: string, myId: string) => void
  setRoom: (code: string, isHost: boolean) => void
  setScreen: (s: GameScreen) => void
  setPlayers: (p: Player[]) => void
  setReviewQuestions: (q: ReviewQuestion[] | null) => void
  addPlayer: (p: Player) => void
  removePlayer: (id: string) => void
  setCountdown: (n: number) => void
  setQuestion: (q: Question) => void
  setSelectedAnswer: (a: string) => void
  setAnswerResult: (r: AnswerResult) => void
  setStreak: (n: number) => void
  setRoundResult: (r: RoundResult) => void
  setFinalLeaderboard: (lb: Player[], analytics?: any[]) => void
  addAnsweredPlayer: (id: string) => void
  reset: () => void
}

const initial = {
  myName: '', myTole: '', myAvatar: '👤', myId: '', isHost: false, roomCode: '',
  screen: 'join' as GameScreen,
  players: [], 
  reviewQuestions: null,
  countdown: 3, 
  question: null,
  answerResult: null, 
  selectedAnswer: null, 
  streak: 0,
  roundResult: null, 
  finalLeaderboard: [],
  answeredPlayers: [],
  analytics: [],
}

export const useQuizStore = create<QuizState>((set) => ({
  ...initial,
  setIdentity: (myName, myTole, myAvatar, myId) => set({ myName, myTole, myAvatar, myId }),
  setRoom: (roomCode, isHost) => set({ roomCode, isHost }),
  setScreen: (screen) => set({ screen }),
  setPlayers: (players) => set({ players }),
  setReviewQuestions: (reviewQuestions) => set({ reviewQuestions }),
  addPlayer: (p) => set((s) => {
    if (s.players.find(x => x.id === p.id)) return s
    return { players: [...s.players, p] }
  }),
  removePlayer: (id) => set((s) => ({ players: s.players.filter(p => p.id !== id) })),
  setCountdown: (countdown) => set({ countdown }),
  setQuestion: (question) => set({ 
    question, 
    selectedAnswer: null, 
    answerResult: null,
    answeredPlayers: [] // Reset for new question
  }),
  setSelectedAnswer: (selectedAnswer) => set({ selectedAnswer }),
  setAnswerResult: (answerResult) => set({ answerResult, streak: answerResult.streak }),
  setStreak: (streak) => set({ streak }),
  setRoundResult: (roundResult) => set({ roundResult }),
  setFinalLeaderboard: (finalLeaderboard, analytics) => set({ finalLeaderboard, analytics: analytics ?? [] }),
  addAnsweredPlayer: (id) => set((s) => ({ answeredPlayers: [...s.answeredPlayers, id] })),
  reset: () => set(initial),
}))

// ── Dev mock helpers ─────────────────────────────────────────────────────
export function mockLobby() {
  const s = useQuizStore.getState()
  s.setRoom('TARK42', true)
  s.setPlayers([
    { id: '1', name: 'Aarav Sharma', tole: 'Patan', score: 0, streak: 0, avatar: '👤' },
    { id: '2', name: 'Priya KC',     tole: 'Thamel', score: 0, streak: 0, avatar: '👤' },
    { id: '3', name: 'Rohan Thapa',  tole: 'Baneshwor', score: 0, streak: 0, avatar: '👤' }
  ])
  s.setScreen('lobby')
}

export function mockQuestion() {
  const s = useQuizStore.getState()
  s.setQuestion({
    index: 1,
    total: 10,
    text: 'Which city in Nepal is home to Pashupatinath Temple?',
    options: ['A. Pokhara', 'B. Bhaktapur', 'C. Kathmandu', 'D. Chitwan'],
    category: 'Nepal general',
    time_limit: 20,
  })
  s.setScreen('question')
}

export function mockScoring() {
  const s = useQuizStore.getState()
  s.setAnswerResult({ 
    correct: true, 
    points: 850, 
    your_total: 850,
    streak: 1                    // ← Also added here (good practice)
  })
  
  s.setRoundResult({
    correct_answer: 'C',
    explanation: 'Pashupatinath Temple is on the banks of the Bagmati River in Kathmandu.',
    leaderboard: [
      { id: '1', name: 'Aarav Sharma', tole: 'Patan', score: 850, streak: 3, avatar: '👤' },
      { id: '3', name: 'Rohan Thapa',  tole: 'Baneshwor', score: 700, streak: 1, avatar: '👤' },
      { id: '2', name: 'Priya KC',     tole: 'Thamel', score: 620, streak: 0, avatar: '👤' }
    ],
  })
  s.setScreen('scoring')
}

export function mockGameOver() {
  const s = useQuizStore.getState()
  s.setFinalLeaderboard([
    { id: '1', name: 'Aarav Sharma', tole: 'Patan', score: 8420, streak: 5, avatar: '👤' },
    { id: '3', name: 'Rohan Thapa',  tole: 'Baneshwor', score: 7100, streak: 2, avatar: '👤' },
    { id: '2', name: 'Priya KC',     tole: 'Thamel', score: 6250, streak: 1, avatar: '👤' }
  ])
  s.setScreen('gameover')
}