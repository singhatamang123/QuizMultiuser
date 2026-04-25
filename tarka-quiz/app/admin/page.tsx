'use client'

import { useQuizStore } from '../../store/quizStore'
import AdminScreen from '../../components/quiz/AdminScreen'
import LobbyScreen from '../../components/quiz/LobbyScreen'
import CountdownScreen from '../../components/quiz/CountdownScreen'
import QuestionScreen from '../../components/quiz/QuestionScreen'
import ScoringScreen from '../../components/quiz/ScoringScreen'
import GameOverScreen from '../../components/quiz/GameOverScreen'
import ReviewScreen from '../../components/quiz/ReviewScreen'

export default function AdminPage() {
  const screen = useQuizStore(s => s.screen)
  const reset = useQuizStore(s => s.reset)

  const renderScreen = () => {
    if (screen === 'review') return <ReviewScreen />
    if (screen === 'lobby') return <LobbyScreen />
    if (screen === 'countdown') return <CountdownScreen />
    if (screen === 'question') return <QuestionScreen />
    if (screen === 'scoring') return <ScoringScreen />
    if (screen === 'gameover') return <GameOverScreen />
    if (screen === 'disconnected') return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', gap: '12px',
      }}>
        <p style={{ color: '#9CA3AF' }}>Connection lost.</p>
        <button onClick={reset} style={{
          padding: '8px 20px', background: '#7C3AED', color: '#fff',
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
        }}>
          Back to Admin Start
        </button>
      </div>
    )
    return <AdminScreen />
  }

  return (
    <>
      {renderScreen()}
    </>
  )
}
