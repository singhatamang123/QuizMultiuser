'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useQuizStore } from '../../store/quizStore'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import styles from './GameOverScreen.module.css'

export default function GameOverScreen() {
  const { finalLeaderboard, reset, isHost } = useQuizStore()
  const { play } = useSoundEffects()
  const winner = finalLeaderboard[0]

  const downloadCSV = () => {
    const rows = [
      ['Rank', 'Name', 'Score', 'Max Streak'],
      ...finalLeaderboard.map((p, i) => [
        i + 1,
        p.name,
        p.score,
        p.streak ?? 0
      ])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `edupulse_results_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    // Play victory fanfare
    play('victory')

    const duration = 4 * 1000
    const end = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }
    const rand = (m: number, x: number) => Math.random() * (x - m) + m

    const iv = setInterval(() => {
      const timeLeft = end - Date.now()
      if (timeLeft <= 0) return clearInterval(iv)
      const pc = 50 * (timeLeft / duration)
      confetti({ ...defaults, particleCount: pc, origin: { x: rand(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount: pc, origin: { x: rand(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)

    return () => clearInterval(iv)
  }, [play])

  return (
    <div className={styles.page}>

      {/* Trophy */}
      <motion.div 
        className={styles.trophy}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        🏆
      </motion.div>
      <motion.h2 
        className={styles.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {winner?.name} wins!
      </motion.h2>
      <motion.p 
        className={styles.subtitle}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {winner?.score.toLocaleString()} points · {winner?.tole}
      </motion.p>

      {/* Final leaderboard */}
      <motion.div 
        className={styles.lbWrap}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <p className={styles.lbTitle}>Final standings</p>

        {finalLeaderboard.map((p, i) => (
          <motion.div 
            key={p.id} 
            className={`${styles.playerRow} ${i === 0 ? styles.rank1 : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
          >

            <span className={styles.rankNumber}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
            </span>

            <div className={styles.avatar}>
              {p.avatar}
            </div>

            <div className={styles.playerInfo}>
              <p className={styles.playerName}>
                {p.name}
                {p.streak > 1 && <span className={styles.streakFire}>🔥</span>}
              </p>
              <p className={styles.playerTole}>{p.tole}</p>
            </div>

            <span className={styles.playerScore}>
              {p.score.toLocaleString()}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Teacher's Analytics */}
      {isHost && useQuizStore.getState().analytics.length > 0 && (
        <motion.div 
          className={styles.analyticsWrap}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <p className={styles.lbTitle}>📊 Teacher's Report (Question Insights)</p>
          <div className={styles.analyticsList}>
            {useQuizStore.getState().analytics.map((stat, i) => {
              const successRate = Math.round((stat.correct_count / stat.total_players) * 100) || 0
              const isDifficult = successRate < 50
              return (
                <div key={i} className={`${styles.statRow} ${isDifficult ? styles.difficult : ''}`}>
                  <div className={styles.statInfo}>
                    <p className={styles.statText}>Q{i+1}: {stat.text}</p>
                    <p className={styles.statMeta}>
                      Avg Time: <strong>{stat.avg_time}s</strong> · 
                      Success: <strong style={{ color: isDifficult ? '#EF4444' : '#10B981' }}>{successRate}%</strong>
                    </p>
                  </div>
                  {isDifficult && <span className={styles.alertIcon}>⚠️ Focus</span>}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div 
        className={styles.actions}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={styles.btnPrimary} 
          onClick={() => { play('click'); reset() }}
        >
          Play again
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={styles.btnSecondary}
          onClick={() => {
            play('click')
            const text = `I scored ${winner?.score.toLocaleString()} on Edupulse! 🏆`
            navigator.share?.({ text }) ?? navigator.clipboard.writeText(text)
          }}
        >
          Share result
        </motion.button>
        {isHost && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.btnSecondary}
            style={{ background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)', color: '#34D399' }}
            onClick={() => { play('click'); downloadCSV() }}
          >
            📥 Download Results (CSV)
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}