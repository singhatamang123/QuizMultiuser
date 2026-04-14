'use client'

import { useRef, useCallback } from 'react'
import { useQuizStore } from '../store/quizStore'

function getWsUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL
  if (typeof window !== 'undefined') return `ws://${window.location.hostname}:8000`
  return 'ws://localhost:8000'
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function getOrCreateId(): string {
  if (typeof window === 'undefined') return generateId()
  let id = sessionStorage.getItem('tarka_player_id')
  if (!id) {
    id = generateId()
    sessionStorage.setItem('tarka_player_id', id)
  }
  return id
}

let globalWs: WebSocket | null = null

export function useQuizSocket() {
  const store = useQuizStore()

  const connect = useCallback((roomCode: string, name: string, tole: string) => {
    // Close any existing connection first
    if (globalWs) {
      globalWs.close()
      globalWs = null
    }

    const playerId = getOrCreateId()
    store.setIdentity(name, tole)

    const wsUrl = getWsUrl()
    const url = `${wsUrl}/ws/${roomCode.toUpperCase()}/${playerId}`
    console.log('[WS] Connecting to:', url)

    const socket = new WebSocket(url)
    globalWs = socket

    socket.onopen = () => {
      console.log('[WS] Connected')
      // Send join payload immediately on open
      const payload = JSON.stringify({ name, tole })
      socket.send(payload)
      console.log('[WS] Sent join payload:', payload)
    }

    socket.onmessage = (e) => {
      let msg: Record<string, any>
      try {
        msg = JSON.parse(e.data)
      } catch {
        return
      }

      console.log('[WS] Received:', msg.event, msg)

      switch (msg.event) {
        case 'joined':
          store.setRoom(roomCode.toUpperCase(), msg.is_host)
          // Set players from the joined event
          store.setPlayers(msg.players ?? [])
          store.setScreen('lobby')
          break

        case 'player_joined':
          // Another player joined — add them if not already in list
          store.addPlayer(msg.player)
          break

        case 'player_left':
          store.removePlayer(msg.player_id)
          break

        case 'countdown':
          store.setScreen('countdown')
          store.setCountdown(msg.tick)
          break

        case 'question':
          store.setScreen('question')
          store.setQuestion({
            index: (msg.index ?? 0) + 1,
            total: msg.total ?? 10,
            text: msg.text ?? '',
            options: msg.options ?? [],
            category: msg.category ?? '',
            time_limit: msg.time_limit ?? 20,
          })
          break

        case 'answer_ack':
          store.setAnswerResult({
            correct: msg.correct,
            points: msg.points,
            your_total: msg.your_total,
            streak: msg.streak ?? 0,
          })
          break

        case 'round_result':
          store.setRoundResult({
            correct_answer: msg.correct_answer,
            explanation: msg.explanation,
            leaderboard: msg.leaderboard ?? [],
          })
          store.setScreen('scoring')
          break

        case 'game_over':
          store.setFinalLeaderboard(msg.final_leaderboard ?? [])
          store.setScreen('gameover')
          break

        default:
          console.log('[WS] Unknown event:', msg.event)
      }
    }

    socket.onclose = (e) => {
      console.log('[WS] Closed:', e.code, e.reason)
      store.setScreen('disconnected')
    }

    socket.onerror = (e) => {
      console.error('[WS] Error:', e)
      store.setScreen('disconnected')
    }
  }, [])

  const send = useCallback((data: object) => {
    if (globalWs?.readyState === WebSocket.OPEN) {
      const msg = JSON.stringify(data)
      console.log('[WS] Sending:', msg)
      globalWs.send(msg)
    } else {
      console.warn('[WS] Cannot send — socket not open. State:', globalWs?.readyState)
    }
  }, [])

  const startGame = useCallback((category: string) => {
    send({ event: 'start_game', category })
  }, [send])

  const sendAnswer = useCallback((answer: string) => {
    send({ event: 'answer', answer })
    store.setSelectedAnswer(answer)
  }, [send])

  const disconnect = useCallback(() => {
    globalWs?.close()
    globalWs = null
  }, [])

  return { connect, startGame, sendAnswer, disconnect }
}