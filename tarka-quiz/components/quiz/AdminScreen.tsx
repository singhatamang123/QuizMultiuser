'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuizSocket } from '../../hooks/useQuizSocket'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import styles from './JoinScreen.module.css'

const CATEGORIES = [
  'Class V',
  'Class VI',
  'Class VII',
  'Class VIII',
]

const HOST_NAME = 'Singha'

const AVATARS = ['👤', '🐱', '🐶', '🦊', '🦁', '🐸', '🐼', '🐨', '🦖', '🦄', '🤖', '👾']

export default function AdminScreen() {
  const [name, setName] = useState(HOST_NAME)
  const [tole, setTole] = useState('Jorpati')
  const [avatar, setAvatar] = useState('👤')
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState('Class V')
  const [nameError, setNameError] = useState('')
  const [generatorMode, setGeneratorMode] = useState<'ai' | 'bank'>('ai')
  const [bankQuestions, setBankQuestions] = useState<any[]>([])
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([])
  const { connect } = useQuizSocket()
  const { play } = useSoundEffects()

  const loadBank = async () => {
    try {
      const resp = await fetch('http://localhost:8000/bank')
      const data = await resp.json()
      setBankQuestions(data)
    } catch (e) { console.error(e) }
  }

  const handleCreate = () => {
    play('click')
    if (!name.trim()) { setNameError('Please enter your name'); return }
    setNameError('')
    const code = Math.random().toString(36).slice(2, 8).toUpperCase()
    
    // Save settings
    localStorage.setItem('tarka_generator_mode', generatorMode)
    if (generatorMode === 'ai') {
      localStorage.setItem('tarka_category', category)
      localStorage.setItem('tarka_topic', topic.trim())
      localStorage.removeItem('tarka_custom_questions')
    } else {
      const selected = bankQuestions.filter((_, i) => selectedBankIds.includes(i.toString()))
      localStorage.setItem('tarka_custom_questions', JSON.stringify(selected))
    }
    
    connect(code, name.trim(), tole.trim(), avatar)
  }

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.logo}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Edu<span className={styles.logoSpan}>pulse</span> <span style={{ fontSize: '14px', background: '#ffbe0b', color: '#000', padding: '2px 8px', borderRadius: '6px', marginLeft: '8px' }}>ADMIN</span>
      </motion.div>

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className={styles.fieldWrap}>
          <label className={styles.label}>Admin Name</label>
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div className={styles.fieldWrap}>
          <label className={styles.label}>Location (Tole)</label>
          <input
            className={styles.input}
            type="text"
            value={tole}
            onChange={e => setTole(e.target.value)}
          />
        </div>

        <div className={styles.fieldWrap}>
          <label className={styles.label}>Choose your admin avatar</label>
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

        {/* Mode Selector */}
        <div className={styles.modeToggle}>
          <button 
            className={generatorMode === 'ai' ? styles.activeMode : ''} 
            onClick={() => setGeneratorMode('ai')}
          >
            ✨ AI Generator
          </button>
          <button 
            className={generatorMode === 'bank' ? styles.activeMode : ''} 
            onClick={() => { setGeneratorMode('bank'); loadBank() }}
          >
            📚 Question Bank
          </button>
        </div>

        {generatorMode === 'ai' ? (
          <div className={styles.aiSection}>
            <div className={styles.aiHeader}>
              <span>✨</span> AI Question Generator
            </div>

            <div className={styles.aiGrid}>
              <div>
                <label className={styles.label}>Grade</label>
                <select
                  className={styles.select}
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={styles.label}>Topic (Optional)</label>
                <input
                  className={styles.aiInput}
                  type="text"
                  placeholder="e.g. Space, Robotics..."
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.bankSection}>
            <div className={styles.aiHeader}>
              <span>📚</span> Saved Questions ({selectedBankIds.length} selected)
            </div>
            <div className={styles.bankList}>
              {bankQuestions.length === 0 ? (
                <p className={styles.emptyBank}>No saved questions yet.</p>
              ) : (
                bankQuestions.map((q, i) => (
                  <label key={i} className={styles.bankItem}>
                    <input 
                      type="checkbox" 
                      checked={selectedBankIds.includes(i.toString())}
                      onChange={e => {
                        if (e.target.checked) setSelectedBankIds([...selectedBankIds, i.toString()])
                        else setSelectedBankIds(selectedBankIds.filter(id => id !== i.toString()))
                      }}
                    />
                    <div className={styles.bankItemContent}>
                      <span className={styles.bankItemText}>{q.text}</span>
                      <span className={styles.bankItemCat}>{q.category}</span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={styles.btnPrimary}
          onClick={handleCreate}
        >
          Create Room &amp; Start
        </motion.button>
      </motion.div>
    </div>
  )
}
