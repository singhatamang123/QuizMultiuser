'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuizSocket } from '../../hooks/useQuizSocket'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import styles from './JoinScreen.module.css'

const TOLES = [
  'Baneshwor', 'Thamel', 'Patan', 'Bhaktapur',
  'Kirtipur', 'Lazimpat', 'Koteshwor', 'Balkhu',
  'Boudha', 'Chabahil', 'Balaju', 'Kalanki',
]

const CATEGORIES = [
  'Nepal general', 'Food & cuisine',
  'Festivals', 'Geography', 'Sports',
]

export default function JoinScreen() {
  const [name, setName] = useState('')
  const [tole, setTole] = useState('Patan')
  const [category, setCategory] = useState('Nepal general')
  const [joinCode, setJoinCode] = useState('')
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [nameError, setNameError] = useState('')
  const { connect } = useQuizSocket()
  const { play } = useSoundEffects()

  const handleCreate = () => {
    play('click')
    if (!name.trim()) { setNameError('Please enter your name'); return }
    setNameError('')
    const code = Math.random().toString(36).slice(2, 8).toUpperCase()
    localStorage.setItem('tarka_name', name.trim())
    localStorage.setItem('tarka_tole', tole)
    connect(code, name.trim(), tole)
  }

  const handleJoin = () => {
    play('click')
    if (!name.trim()) { setNameError('Please enter your name'); return }
    if (!joinCode.trim()) return
    setNameError('')
    localStorage.setItem('tarka_name', name.trim())
    localStorage.setItem('tarka_tole', tole)
    connect(joinCode.trim().toUpperCase(), name.trim(), tole)
  }

  return (
    <div className={styles.page}>
      <motion.div 
        className={styles.logo}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Tarka <span className={styles.logoSpan}>Quiz</span>
      </motion.div>
      <motion.p 
        className={styles.tagline}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      >
        Nepal ko sabai bhanda tez trivia
      </motion.p>

      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4, delay: 0.2 }}
      >
        {/* Name field */}
        <div className={styles.fieldWrap}>
          <label className={styles.label}>Your name</label>
          <input
            className={styles.input}
            style={{ borderColor: nameError ? 'var(--error)' : undefined }}
            type="text"
            placeholder="Aarav, Priya, Rohan..."
            value={name}
            onChange={e => { setName(e.target.value); setNameError('') }}
            onKeyDown={e => e.key === 'Enter' && (mode === 'create' ? handleCreate() : handleJoin())}
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

        {/* Tole field */}
        <div className={styles.fieldWrap}>
          <label className={styles.label}>Your tole / area</label>
          <select
            className={styles.select}
            value={tole}
            onChange={e => setTole(e.target.value)}
          >
            {TOLES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Category — only shown in create mode */}
        <AnimatePresence mode="popLayout">
          {mode === 'create' && (
            <motion.div 
              key="category"
              className={styles.fieldWrap}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <label className={styles.label}>Question category</label>
              <select
                className={styles.select}
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {mode === 'create' ? (
            <motion.div
              key="createActions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }} 
                whileTap={{ scale: 0.98 }} 
                className={styles.btnPrimary} 
                onClick={handleCreate}
              >
                Create room
              </motion.button>
              <div className={styles.divider}>or join a friend</div>
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                className={styles.btnSecondary} 
                onClick={() => { play('click'); setMode('join') }}
              >
                Enter room code
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="joinActions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className={styles.fieldWrap}>
                <label className={styles.label}>Room code</label>
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
                whileHover={{ scale: 1.02, y: -2 }} 
                whileTap={{ scale: 0.98 }} 
                className={styles.btnPrimary} 
                onClick={handleJoin}
              >
                Join room
              </motion.button>
              <motion.button 
                whileHover={{ opacity: 0.8 }} 
                className={styles.backBtn} 
                onClick={() => { play('click'); setMode('create') }}
              >
                ← Back to create
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}