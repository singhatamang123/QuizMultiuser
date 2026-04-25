'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuizStore, ReviewQuestion } from '../../store/quizStore'
import { useQuizSocket } from '../../hooks/useQuizSocket'
import styles from './ReviewScreen.module.css'

const LETTERS = ['A', 'B', 'C', 'D'] as const

export default function ReviewScreen() {
  const { reviewQuestions } = useQuizStore()
  const { approveQuestions, stopGame } = useQuizSocket()

  const [questions, setQuestions] = useState<ReviewQuestion[]>(reviewQuestions ?? [])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<ReviewQuestion | null>(null)

  const handleEditOpen = (i: number) => {
    setEditingIndex(i)
    setEditDraft({ ...questions[i], options: [...questions[i].options] })
  }

  const handleEditSave = () => {
    if (editDraft === null || editingIndex === null) return
    const updated = [...questions]
    updated[editingIndex] = editDraft
    setQuestions(updated)
    setEditingIndex(null)
    setEditDraft(null)
  }

  const handleSaveToBank = async (q: ReviewQuestion) => {
    try {
      const resp = await fetch('http://localhost:8000/save-to-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([q])
      })
      const data = await resp.json()
      if (data.status === 'success') {
        alert(`Saved to bank! (${data.added} new)`)
      } else {
        alert('Error: ' + data.message)
      }
    } catch (e) {
      alert('Failed to connect to server bank.')
    }
  }

  const handleEditCancel = () => {
    setEditingIndex(null)
    setEditDraft(null)
  }

  const handleApprove = () => {
    approveQuestions(questions)
  }

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={styles.title}>📋 Review Questions</h1>
        <p className={styles.sub}>Review and edit questions before the game starts. Students are waiting in the lobby.</p>
      </motion.div>

      <div className={styles.list}>
        {questions.map((q, i) => (
          <motion.div
            key={i}
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className={styles.cardHeader}>
              <span className={styles.qNumber}>Q{i + 1}</span>
              <span className={styles.badge}>{q.category}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className={styles.bankBtn} onClick={() => handleSaveToBank(q)}>💾 Save to Bank</button>
                <button className={styles.editBtn} onClick={() => handleEditOpen(i)}>✏️ Edit</button>
              </div>
            </div>
            <p className={styles.qText}>{q.text}</p>
            <div className={styles.options}>
              {q.options.map((opt, oi) => (
                <div
                  key={oi}
                  className={`${styles.option} ${LETTERS[oi] === q.answer ? styles.correct : ''}`}
                >
                  <span className={styles.letter}>{LETTERS[oi]}</span>
                  {opt.replace(/^[A-D]\.\s*/, '')}
                  {LETTERS[oi] === q.answer && <span className={styles.tick}>✓</span>}
                </div>
              ))}
            </div>
            {q.explanation && (
              <p className={styles.explanation}>💡 {q.explanation}</p>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        className={styles.footer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          className={styles.approveBtn}
          onClick={handleApprove}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          ✅ Approve & Start Game
        </motion.button>
        <button 
          className={styles.stopBtn}
          onClick={stopGame}
        >
          Cancel & Close Room
        </button>
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingIndex !== null && editDraft && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleEditCancel}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', bounce: 0.3 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className={styles.modalTitle}>Edit Question {editingIndex! + 1}</h2>

              <label className={styles.label}>Question Text</label>
              <textarea
                className={styles.textarea}
                value={editDraft.text}
                onChange={e => setEditDraft({ ...editDraft, text: e.target.value })}
                rows={3}
              />

              <label className={styles.label}>Options</label>
              {editDraft.options.map((opt, oi) => (
                <div key={oi} className={styles.optionRow}>
                  <span className={styles.optLetter}>{LETTERS[oi]}</span>
                  <input
                    className={styles.optInput}
                    value={opt.replace(/^[A-D]\.\s*/, '')}
                    onChange={e => {
                      const updated = [...editDraft.options]
                      updated[oi] = `${LETTERS[oi]}. ${e.target.value}`
                      setEditDraft({ ...editDraft, options: updated })
                    }}
                  />
                </div>
              ))}

              <label className={styles.label}>Correct Answer</label>
              <div className={styles.answerPicker}>
                {LETTERS.map(l => (
                  <button
                    key={l}
                    className={`${styles.answerBtn} ${editDraft.answer === l ? styles.selectedAnswer : ''}`}
                    onClick={() => setEditDraft({ ...editDraft, answer: l })}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <label className={styles.label}>Explanation</label>
              <input
                className={styles.input}
                value={editDraft.explanation}
                onChange={e => setEditDraft({ ...editDraft, explanation: e.target.value })}
              />

              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={handleEditCancel}>Cancel</button>
                <button className={styles.saveBtn} onClick={handleEditSave}>Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
