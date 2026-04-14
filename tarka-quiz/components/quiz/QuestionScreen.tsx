'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuizStore } from '../../store/quizStore'
import { useQuizSocket } from '../../hooks/useQuizSocket'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import styles from './QuestionScreen.module.css'

const LETTERS = ['A', 'B', 'C', 'D']

export default function QuestionScreen() {
  const { question, selectedAnswer, answerResult } = useQuizStore()
  const { sendAnswer } = useQuizSocket()
  const [timeLeft, setTimeLeft] = useState(20)
  const { play } = useSoundEffects()

  useEffect(() => {
    if (!question) return
    setTimeLeft(question.time_limit)
    const iv = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(iv); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [question?.index])

  useEffect(() => {
    // Tick sound every second if game is active
    if (timeLeft > 0 && !answerResult) {
      if (timeLeft <= 5) {
        play('urgentTick')
      } else {
        play('tick')
      }
    }
  }, [timeLeft, play, answerResult])

  useEffect(() => {
    // Final result sound
    if (answerResult) {
      play(answerResult.correct ? 'correct' : 'wrong')
    }
  }, [answerResult, play])

  if (!question) return null

  const pct = Math.round((timeLeft / question.time_limit) * 100)
  const timerColor = timeLeft > 10 ? 'var(--primary)' : timeLeft > 5 ? '#F59E0B' : 'var(--error)'

  const getOptClass = (letter: string) => {
    let cls = styles.option

    if (answerResult) {
      if (letter === selectedAnswer) {
        return cls + (answerResult.correct ? ` ${styles.correct}` : ` ${styles.wrong}`)
      }
      return cls + ` ${styles.faded}`
    }

    if (selectedAnswer) {
      cls += ` ${styles.locked}`
      if (letter === selectedAnswer) cls += ` ${styles.selected}`
    }

    return cls
  }

  const handlePick = (letter: string) => {
    if (selectedAnswer) return
    play('click')
    useQuizStore.getState().setSelectedAnswer(letter)
    // Server is usually processing answer here
    sendAnswer(letter)
  }

  return (
    <div className={styles.page}>
      {/* Header row */}
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className={styles.questionMeta}>
          Question <strong>{question.index + 1}</strong> of {question.total}
          {' · '}
          <span className={styles.category}>{question.category}</span>
        </span>

        {/* Timer */}
        <div className={styles.timerWrap}>
          <div className={styles.timerBar}>
            <motion.div 
              className={styles.timerFill}
              initial={{ width: '100%' }}
              animate={{ width: `${pct}%`, backgroundColor: timerColor }}
              transition={{ ease: "linear", duration: 1 }}
            />
          </div>
          <motion.span 
            className={styles.timeLeft} 
            animate={{ color: timerColor, scale: timeLeft <= 5 ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.5, repeat: timeLeft <= 5 ? Infinity : 0 }}
          >
            {timeLeft}
          </motion.span>
        </div>
      </motion.div>

      {/* Question text */}
      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
      >
        <p className={styles.questionText}>
          {question.text}
        </p>
      </motion.div>

      {/* Options grid */}
      <div className={styles.optionsGrid}>
        {question.options.map((opt, i) => {
          const letter = LETTERS[i]
          const label = opt.replace(/^[A-D]\.\s*/, '')
          return (
            <motion.button
              key={letter}
              className={getOptClass(letter)}
              onClick={() => handlePick(letter)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, type: "spring", stiffness: 300 }}
              whileHover={!selectedAnswer && !answerResult ? { scale: 1.02, y: -2 } : {}}
              whileTap={!selectedAnswer && !answerResult ? { scale: 0.98 } : {}}
            >
              <span className={styles.letter}>{letter}</span>
              {label}
            </motion.button>
          )
        })}
      </div>

      {/* Status message */}
      <div className={styles.statusWrap}>
        <AnimatePresence mode="wait">
          {selectedAnswer && !answerResult && (
            <motion.p 
              key="waiting"
              className={styles.statusWaiting}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              Answer locked. Waiting for others...
            </motion.p>
          )}
          {answerResult && (
            <motion.p 
              key="result"
              className={`${styles.statusResult} ${answerResult.correct ? styles.correct : styles.wrong}`}
              initial={{ opacity: 0, scale: 0.8, rotate: answerResult.correct ? -2 : 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.6 }}
            >
              {answerResult.correct
                ? (
                  <div className={styles.correctInfo}>
                    <span>Correct! +{answerResult.points.toLocaleString()} pts</span>
                    {answerResult.streak > 1 && (
                      <motion.div 
                        className={styles.streakBadge}
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", bounce: 0.7 }}
                      >
                        🔥 {answerResult.streak} STREAK
                      </motion.div>
                    )}
                  </div>
                )
                : 'Wrong answer'}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}