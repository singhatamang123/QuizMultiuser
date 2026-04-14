'use client'

import { useCallback, useRef } from 'react'

/**
 * Synthesized game sound effects using the Web Audio API.
 * No external audio files required — all sounds are generated programmatically.
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

// ─── Individual sound generators ────────────────────────────────────

/** Short rising chime — "correct answer" */
function playCorrect() {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  // Two-note ascending chime
  const notes = [523.25, 659.25] // C5 → E5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.3, now + i * 0.12)
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now + i * 0.12)
    osc.stop(now + i * 0.12 + 0.35)
  })
}

/** Descending buzz — "wrong answer" */
function playWrong() {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(350, now)
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.3)
  gain.gain.setValueAtTime(0.2, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.35)
}

/** Single tick — countdown timer */
function playTick() {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = 880 // A5
  gain.gain.setValueAtTime(0.15, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.08)
}

/** Urgent tick for last 5 seconds */
function playUrgentTick() {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'square'
  osc.frequency.value = 1200
  gain.gain.setValueAtTime(0.18, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.06)
}

/** Soft click — button press / option select */
function playClick() {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = 600
  gain.gain.setValueAtTime(0.12, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.05)
}

/** Rising fanfare — countdown "Go!" or game start */
function playGameStart() {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  const notes = [392, 523.25, 659.25, 783.99] // G4 → C5 → E5 → G5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.25, now + i * 0.1)
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now + i * 0.1)
    osc.stop(now + i * 0.1 + 0.3)
  })
}

/** Victory fanfare — game over / winner announcement */
function playVictory() {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  // Triumphal arpeggio: C5 → E5 → G5 → C6
  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.3, now + i * 0.15)
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.5)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now + i * 0.15)
    osc.stop(now + i * 0.15 + 0.5)
  })
}

/** Soft notification — player joined lobby */
function playJoin() {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(440, now)
  osc.frequency.exponentialRampToValueAtTime(660, now + 0.15)
  gain.gain.setValueAtTime(0.15, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.2)
}

// ─── The hook ────────────────────────────────────────────────────────

export function useSoundEffects() {
  const enabledRef = useRef(true)

  const setEnabled = useCallback((v: boolean) => {
    enabledRef.current = v
  }, [])

  const play = useCallback((sound: 'correct' | 'wrong' | 'tick' | 'urgentTick' | 'click' | 'gameStart' | 'victory' | 'join') => {
    if (!enabledRef.current) return
    try {
      switch (sound) {
        case 'correct':    playCorrect(); break
        case 'wrong':      playWrong(); break
        case 'tick':       playTick(); break
        case 'urgentTick': playUrgentTick(); break
        case 'click':      playClick(); break
        case 'gameStart':  playGameStart(); break
        case 'victory':    playVictory(); break
        case 'join':       playJoin(); break
      }
    } catch {
      // Silently swallow audio errors (e.g. if AudioContext is blocked)
    }
  }, [])

  return { play, setEnabled, enabledRef }
}
