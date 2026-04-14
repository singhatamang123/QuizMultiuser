import { create } from 'zustand'

export type GameScreen = 'join' | 'lobby' | 'countdown' | 'question' | 'scoring' | 'gameover' | 'disconnected'

export interface Player {
  id: string
  name: string
  tole: string
  score: number
  streak: number
}

export interface Question {
  index: number
  total: number
  text: string
  options: string[]   // ["A. Pokhara", "B. Bhaktapur", ...]
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
  correct_answer: string   // "B"
  explanation: string
  leaderboard: Player[]
}

interface QuizState {
  // identity
  myName: string
  myTole: string
  myId: string
  isHost: boolean
  roomCode: string

  // game
  screen: GameScreen
  players: Player[]
  countdown: number
  question: Question | null
  answerResult: AnswerResult | null
  selectedAnswer: string | null
  streak: number
  roundResult: RoundResult | null
  finalLeaderboard: Player[]

  // actions
  setIdentity: (name: string, tole: string) => void
  setRoom: (code: string, isHost: boolean) => void
  setScreen: (s: GameScreen) => void
  setPlayers: (p: Player[]) => void
  addPlayer: (p: Player) => void
  removePlayer: (id: string) => void
  setCountdown: (n: number) => void
  setQuestion: (q: Question) => void
  setSelectedAnswer: (a: string) => void
  setAnswerResult: (r: AnswerResult) => void
  setStreak: (n: number) => void
  setRoundResult: (r: RoundResult) => void
  setFinalLeaderboard: (lb: Player[]) => void
  reset: () => void
}

const initial = {
  myName: '', myTole: '', myId: '', isHost: false, roomCode: '',
  screen: 'join' as GameScreen,
  players: [], countdown: 3, question: null,
  answerResult: null, selectedAnswer: null, streak: 0,
  roundResult: null, finalLeaderboard: [],
}

export const useQuizStore = create<QuizState>((set) => ({
  ...initial,
  setIdentity: (myName, myTole) => set({ myName, myTole }),
  setRoom: (roomCode, isHost) => set({ roomCode, isHost }),
  setScreen: (screen) => set({ screen }),
  setPlayers: (players) => set({ players }),
  addPlayer: (p) => set((s) => {
  // Don't add if already in list
  if (s.players.find(x => x.id === p.id)) return s
  return { players: [...s.players, p] }
}),
  removePlayer: (id) => set((s) => ({ players: s.players.filter(p => p.id !== id) })),
  setCountdown: (countdown) => set({ countdown }),
  setQuestion: (question) => set({ question, selectedAnswer: null, answerResult: null }),
  setSelectedAnswer: (selectedAnswer) => set({ selectedAnswer }),
  setAnswerResult: (answerResult) => set({ answerResult, streak: answerResult.streak }),
  setStreak: (streak) => set({ streak }),
  setRoundResult: (roundResult) => set({ roundResult }),
  setFinalLeaderboard: (finalLeaderboard) => set({ finalLeaderboard }),
  reset: () => set(initial),
  
}))


// ── Dev mock helpers ─────────────────────────────────────────────────────
export function mockLobby() {
  const s = useQuizStore.getState()
  s.setRoom('TARK42', true)
  s.setPlayers([
    { id: '1', name: 'Aarav Sharma', tole: 'Patan', score: 0 },
    { id: '2', name: 'Priya KC', tole: 'Thamel', score: 0 },
    { id: '3', name: 'Rohan Thapa', tole: 'Baneshwor', score: 0 },
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
  s.setAnswerResult({ correct: true, points: 850, your_total: 850 })
  s.setRoundResult({
    correct_answer: 'C',
    explanation: 'Pashupatinath Temple is on the banks of the Bagmati River in Kathmandu.',
    leaderboard: [
      { id: '1', name: 'Aarav Sharma', tole: 'Patan', score: 850 },
      { id: '3', name: 'Rohan Thapa', tole: 'Baneshwor', score: 700 },
      { id: '2', name: 'Priya KC', tole: 'Thamel', score: 620 },
    ],
  })
  s.setScreen('scoring')
}

export function mockGameOver() {
  const s = useQuizStore.getState()
  s.setFinalLeaderboard([
    { id: '1', name: 'Aarav Sharma', tole: 'Patan', score: 8420 },
    { id: '3', name: 'Rohan Thapa', tole: 'Baneshwor', score: 7100 },
    { id: '2', name: 'Priya KC', tole: 'Thamel', score: 6250 },
  ])
  s.setScreen('gameover')
}
