'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuizSocket } from '../../hooks/useQuizSocket'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import styles from './JoinScreen.module.css'

const AVATARS = ['👤', '🐱', '🐶', '🦊', '🦁', '🐸', '🐼', '🐨', '🦖', '🦄', '🤖', '👾']

export default function JoinScreen() {
  const [name, setName] = useState('')
  const [tole, setTole] = useState('')
  const [avatar, setAvatar] = useState('👤')
  const [joinCode, setJoinCode] = useState('')
  const [nameError, setNameError] = useState('')
  const { connect } = useQuizSocket()
  const { play } = useSoundEffects()

  const handleJoin = () => {
    play('click')
    if (!name.trim()) { setNameError('Please enter your name'); return }
    if (!joinCode.trim()) { return }
    setNameError('')
    connect(joinCode.trim().toUpperCase(), name.trim(), tole.trim(), avatar)
  }

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.logo}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Edu<span className={styles.logoSpan}>pulse</span>
      </motion.div>

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className={styles.fieldWrap}>
          <label className={styles.label}>Your name</label>
          <input
            className={styles.input}
            style={{ borderColor: nameError ? 'var(--error)' : undefined }}
            type="text"
            placeholder="Aarav, Priya, Rohan..."
            value={name}
            onChange={e => { setName(e.target.value); setNameError('') }}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
          />
          <AnimatePresence>
            {nameError && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ fontSize: '12px', color: 'var(--error)', marginTop: '6px' }}
              >
                {nameError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.fieldWrap}>
          <label className={styles.label}>Neighborhood (Tole)</label>
          <input
            className={styles.input}
            type="text"
            placeholder="Patan, Thamel, Baneshwor..."
            value={tole}
            onChange={e => setTole(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
          />
        </div>

        <div className={styles.fieldWrap}>
          <label className={styles.label}>Choose your avatar</label>
          <div className={styles.avatarGrid}>
            {AVATARS.map(a => (
              <motion.button
                key={a}
                className={`${styles.avatarBtn} ${avatar === a ? styles.avatarSelected : ''}`}
                onClick={() => { play('click'); setAvatar(a) }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {a}
              </motion.button>
            ))}
          </div>
        </div>

        <div className={styles.fieldWrap}>
          <label className={styles.label}>Room Code</label>
          <input
            className={styles.codeInput}
            type="text"
            placeholder="TARK42"
            maxLength={8}
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={styles.btnPrimary}
          onClick={handleJoin}
        >
          Join Room
        </motion.button>
      </motion.div>
    </div>
  )
}