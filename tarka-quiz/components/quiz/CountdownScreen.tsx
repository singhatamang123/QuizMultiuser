'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuizStore } from '../../store/quizStore'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import styles from './CountdownScreen.module.css'

export default function CountdownScreen() {
  const countdown = useQuizStore(s => s.countdown)
  const { play } = useSoundEffects()

  useEffect(() => {
    play('gameStart')
  }, [play])

  useEffect(() => {
    if (countdown > 0) {
      play('tick')
    }
  }, [countdown, play])

  return (
    <div className={styles.page}>
      <motion.p 
        className={styles.sub}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Game is starting
      </motion.p>

      <div className={styles.numberContainer}>
        <AnimatePresence mode="popLayout">
          <motion.div 
            key={countdown} 
            className={styles.number}
            initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {countdown}
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.p 
        className={styles.ready}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Get ready!
      </motion.p>
    </div>
  )
}
