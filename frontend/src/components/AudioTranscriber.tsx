import { useState, useCallback, useEffect, useRef } from 'react'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { useTranscriptionHistory } from '../hooks/useTranscriptionHistory'
import TranscriptionHistory from './TranscriptionHistory'
import type { TranscriptionEntry } from '../types/transcription'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000'

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function AudioTranscriber() {
  const {
    recordingState,
    audioBlob,
    error: recordError,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
  } = useAudioRecorder()

  const { history, addEntry, removeEntry, clearHistory } = useTranscriptionHistory()

  const [transcription, setTranscription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const audioBlobUrlRef = useRef<string | null>(null)

  // Manage object URL lifecycle to prevent memory leaks
  useEffect(() => {
    if (audioBlob && recordingState === 'stopped') {
      const url = URL.createObjectURL(audioBlob)
      audioBlobUrlRef.current = url
      return () => {
        URL.revokeObjectURL(url)
        audioBlobUrlRef.current = null
      }
    }
  }, [audioBlob, recordingState])

  const transcribe = useCallback(async () => {
    if (!audioBlob) return
    setIsLoading(true)
    setApiError(null)

    try {
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')

      const response = await fetch(`${BACKEND_URL}/audio/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = (await response.json()) as { transcription: string }
      const text = data.transcription ?? ''
      setTranscription(text)
      addEntry(text, recordingDuration)
      reset()
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erro ao transcrever o áudio.')
    } finally {
      setIsLoading(false)
    }
  }, [audioBlob, recordingDuration, addEntry, reset])

  const handleCopy = useCallback(() => {
    if (!transcription) return
    navigator.clipboard.writeText(transcription).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [transcription])

  const handleSelectHistory = useCallback((entry: TranscriptionEntry) => {
    setTranscription(entry.text)
    setShowHistory(false)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-2xl flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">🎙️ Transcrição de Áudio</h1>
          <p className="mt-1 text-gray-500 text-sm">Grave, envie e obtenha o texto transcrito</p>
        </div>

        {/* Recording Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center gap-4">

          {/* Recording indicator */}
          {recordingState === 'recording' && (
            <div className="flex items-center gap-2 text-red-500 font-medium">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span>Gravando · {formatDuration(recordingDuration)}</span>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {recordingState === 'idle' && (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-xl transition-colors cursor-pointer"
              >
                <span>⏺</span> Iniciar gravação
              </button>
            )}

            {recordingState === 'recording' && (
              <>
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-xl transition-colors cursor-pointer"
                >
                  <span>⏹</span> Parar
                </button>
                <button
                  onClick={cancelRecording}
                  className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-6 py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </>
            )}

            {recordingState === 'stopped' && (
              <>
                <button
                  onClick={transcribe}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium px-6 py-3 rounded-xl transition-colors cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Transcrevendo…
                    </>
                  ) : (
                    <><span>✉️</span> Transcrever</>
                  )}
                </button>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-6 py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Nova gravação
                </button>
              </>
            )}
          </div>

          {/* Audio preview */}
          {audioBlob && recordingState === 'stopped' && (
            <audio
              controls
              src={audioBlobUrlRef.current ?? undefined}
              className="w-full mt-1"
            />
          )}

          {/* Errors */}
          {(recordError || apiError) && (
            <p className="text-sm text-red-500 text-center">{recordError ?? apiError}</p>
          )}
        </div>

        {/* Transcription result */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Resultado</h2>
            <button
              onClick={handleCopy}
              disabled={!transcription}
              className="text-sm text-indigo-500 hover:text-indigo-700 disabled:opacity-40 transition-colors cursor-pointer"
            >
              {copied ? '✅ Copiado!' : '📋 Copiar'}
            </button>
          </div>
          <textarea
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            placeholder="O texto transcrito aparecerá aqui…"
            rows={5}
            className="w-full resize-y border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
          />
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="w-full flex items-center justify-between font-semibold text-gray-700 cursor-pointer"
          >
            <span>📚 Histórico</span>
            <span className="text-gray-400 text-sm">{showHistory ? '▲' : '▼'}</span>
          </button>

          {showHistory && (
            <div className="mt-4">
              <TranscriptionHistory
                history={history}
                onSelect={handleSelectHistory}
                onRemove={removeEntry}
                onClear={clearHistory}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
