'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuizStore } from '../../store/quizStore'
import { useQuizSocket } from '../../hooks/useQuizSocket'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import styles from './LobbyScreen.module.css'

export default function LobbyScreen() {
  const { roomCode, players, isHost, myId } = useQuizStore()
  const { startGame, kickPlayer, stopGame } = useQuizSocket()
  const { play } = useSoundEffects()
  const prevPlayersCount = useRef(players.length)

  useEffect(() => {
    if (players.length > prevPlayersCount.current) {
      play('join')
    }
    prevPlayersCount.current = players.length
  }, [players.length, play])

  const copyCode = () => {
    play('click')
    navigator.clipboard.writeText(roomCode)
      .catch(() => { })
  }

  const canStart = players.length >= 1  // set to 2 in production

  return (
    <div className={styles.page}>
      <motion.h1 
        className={styles.title}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        Waiting for players
      </motion.h1>
      <motion.p 
        className={styles.sub}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
      >
        Share the code so friends can join
      </motion.p>

      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4, delay: 0.2 }}
      >
        <p className={styles.codeLabel}>Room code</p>
        <motion.div 
          className={styles.codeBox} 
          onClick={copyCode} 
          title="Click to copy"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {roomCode}
        </motion.div>
        <p className={styles.copyHint}>tap to copy</p>

        <p className={styles.playersLabel}>
          <span>Players joined</span>
          <span>{players.length} / 8</span>
        </p>

        <motion.div layout className={styles.playersList}>
          <AnimatePresence mode="popLayout">
            {players.length === 0 && (
              <motion.span 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{ fontSize: '14px', color: '#9CA3AF', margin: 'auto' }}
              >
                No one yet...
              </motion.span>
            )}
            {players.map(p => (
              <motion.div 
                key={p.id} 
                layout
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className={styles.chip}
              >
                <div className={styles.avatar}>{p.avatar}</div>
                <div className={styles.playerDetails}>
                  <span className={styles.playerName}>{p.name}</span>
                  <span className={styles.playerTole}>{p.tole}</span>
                </div>
                {isHost && p.id !== myId && (
                  <button 
                    onClick={() => kickPlayer(p.id)}
                    style={{
                      background: 'none', border: 'none', color: '#EF4444', 
                      marginLeft: '8px', cursor: 'pointer', fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                    title="Kick player"
                  >
                    ×
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {isHost ? (
          <div className={styles.hostActions}>
            <motion.button
              whileHover={canStart ? { scale: 1.02, y: -2 } : {}}
              whileTap={canStart ? { scale: 0.98 } : {}}
              className={canStart ? styles.btnPrimary : styles.btnDisabled}
              onClick={() => {
                if (canStart) {
                  play('click')
                  const mode = localStorage.getItem('tarka_generator_mode') || 'ai'
                  if (mode === 'bank') {
                    const custom = JSON.parse(localStorage.getItem('tarka_custom_questions') || '[]')
                    startGame('Bank', undefined, custom)
                  } else {
                    const cat = localStorage.getItem('tarka_category') || 'Class V'
                    const topic = localStorage.getItem('tarka_topic') || ''
                    startGame(cat, topic)
                  }
                }
              }}
            >
              {canStart ? 'Start game' : 'Waiting for more players...'}
            </motion.button>
            <motion.button
              whileHover={{ color: '#EF4444' }}
              className={styles.stopBtn}
              onClick={() => { play('click'); stopGame() }}
            >
              Stop & Close Room
            </motion.button>
          </div>
        ) : (
          <div className={styles.waitingText}>
            <div className={styles.spinner} />
            Waiting for host to start...
          </div>
        )}
      </motion.div>
    </div>
  )
}