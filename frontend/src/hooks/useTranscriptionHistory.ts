import { useState, useEffect, useCallback } from 'react'
import type { TranscriptionEntry } from '../types/transcription'

const STORAGE_KEY = 'transcription-history'

export function useTranscriptionHistory() {
  const [history, setHistory] = useState<TranscriptionEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as TranscriptionEntry[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  }, [history])

  const addEntry = useCallback((text: string, duration?: number): TranscriptionEntry => {
    const entry: TranscriptionEntry = {
      id: crypto.randomUUID(),
      text,
      timestamp: new Date().toISOString(),
      duration,
    }
    setHistory((prev) => [entry, ...prev])
    return entry
  }, [])

  const removeEntry = useCallback((id: string) => {
    setHistory((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return { history, addEntry, removeEntry, clearHistory }
}
