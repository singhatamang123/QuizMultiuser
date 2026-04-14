'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useQuizStore } from '../../store/quizStore'
import { mockQuestion } from '../../store/quizStore'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import styles from './ScoringScreen.module.css'

export default function ScoringScreen() {
  const { roundResult, answerResult } = useQuizStore()
  const { play } = useSoundEffects()

  const correct = answerResult?.correct ?? false

  useEffect(() => {
    // Play result sound
    play(correct ? 'correct' : 'wrong')

    if (correct) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#7C3AED', '#FCD34D']
      })
    }
  }, [correct, play])

  if (!roundResult) return null

  return (
    <div className={styles.page}>

      {/* Result banner */}
      <motion.div 
        className={`${styles.banner} ${correct ? styles.correct : styles.wrong}`}
        initial={{ opacity: 0, scale: 0.5, y: -50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
      >
        <p className={styles.bannerTitle}>
          {correct
            ? `Correct! +${answerResult?.points.toLocaleString()} points`
            : `Wrong! The answer was ${roundResult.correct_answer}`}
        </p>
        <p className={styles.bannerSub}>
          {roundResult.explanation}
        </p>
      </motion.div>

      {/* Leaderboard */}
      <motion.div 
        className={styles.leaderboardWrap}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
      >
        <p className={styles.lbTitle}>
          Leaderboard
        </p>

        <motion.div layout>
          <AnimatePresence>
            {roundResult.leaderboard.map((p, i) => (
              <motion.div 
                key={p.id} 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i, type: "spring", bounce: 0.3 }}
                className={`${styles.playerRow} ${i === 0 ? styles.rank1 : ''}`}
              >
                <span className={styles.rankNumber}>
                  {i + 1}
                </span>

                <div className={styles.avatar}>
                  {p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>

                <div className={styles.playerInfo}>
                  <p className={styles.playerName}>
                    {p.name}
                    {p.streak > 1 && <span className={styles.streakFire}>🔥</span>}
                  </p>
                  <p className={styles.playerTole}>{p.tole}</p>
                </div>

                <motion.span 
                  className={styles.playerScore}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ delay: 0.5 + 0.1 * i, duration: 0.3 }}
                >
                  {p.score.toLocaleString()}
                </motion.span>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Next question button — in dev mock mode */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div 
          style={{ width: '100%', maxWidth: '520px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { play('click'); mockQuestion() }} 
            className={styles.btnNext}
          >
            Next question →
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}