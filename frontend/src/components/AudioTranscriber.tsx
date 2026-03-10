import { useState, useCallback, useEffect, useRef, useId } from 'react'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { useAudioFileUpload } from '../hooks/useAudioFileUpload'
import { useTranscriptionHistory } from '../hooks/useTranscriptionHistory'
import TranscriptionHistory from './TranscriptionHistory'
import type { TranscriptionEntry } from '../types/transcription'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000'

type Mode = 'microphone' | 'file'

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AudioTranscriber() {
  const [mode, setMode] = useState<Mode>('microphone')

  const {
    recordingState,
    audioBlob,
    error: recordError,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    reset: resetRecorder,
  } = useAudioRecorder()

  const {
    uploadState,
    selectedFile,
    previewUrl: filePreviewUrl,
    error: fileError,
    setUploadState,
    setError: setFileError,
    selectFile,
    reset: resetFileUpload,
  } = useAudioFileUpload()

  const { history, addEntry, removeEntry, clearHistory } = useTranscriptionHistory()

  const [transcription, setTranscription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const audioBlobUrlRef = useRef<string | null>(null)

  const fileInputId = useId()

  // Manage object URL lifecycle for recorded audio blob
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

  const handleSwitchMode = useCallback(
    (next: Mode) => {
      if (next === mode) return
      setMode(next)
      setApiError(null)
      if (next === 'microphone') {
        resetFileUpload()
      } else {
        resetRecorder()
      }
    },
    [mode, resetFileUpload, resetRecorder],
  )

  // --- Microphone transcription ---
  const transcribeMic = useCallback(async () => {
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
      resetRecorder()
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erro ao transcrever o áudio.')
    } finally {
      setIsLoading(false)
    }
  }, [audioBlob, recordingDuration, addEntry, resetRecorder])

  // --- File upload transcription ---
  const transcribeFile = useCallback(async () => {
    if (!selectedFile) return
    setIsLoading(true)
    setApiError(null)
    setFileError(null)
    setUploadState('uploading')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile, selectedFile.name)

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
      addEntry(text)
      setUploadState('done')
      resetFileUpload()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao transcrever o arquivo.'
      setApiError(message)
      setUploadState('error')
    } finally {
      setIsLoading(false)
    }
  }, [selectedFile, addEntry, resetFileUpload, setFileError, setUploadState])

  const handleCancelFileUpload = useCallback(() => {
    resetFileUpload()
    setApiError(null)
  }, [resetFileUpload])

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

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setApiError(null)
      const file = e.target.files?.[0] ?? null
      selectFile(file)
      // Reset input value so the same file can be re-selected if needed
      e.target.value = ''
    },
    [selectFile],
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-2xl flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">🎙️ Transcrição de Áudio</h1>
          <p className="mt-1 text-gray-500 text-sm">Grave ou carregue um arquivo e obtenha o texto transcrito</p>
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
          <button
            onClick={() => handleSwitchMode('microphone')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors cursor-pointer ${
              mode === 'microphone'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            🎙️ Microfone
          </button>
          <button
            onClick={() => handleSwitchMode('file')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors cursor-pointer border-l border-gray-200 ${
              mode === 'file'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            📁 Arquivo Local
          </button>
        </div>

        {/* Microphone Card */}
        {mode === 'microphone' && (
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
                    onClick={transcribeMic}
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
                    onClick={resetRecorder}
                    className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-6 py-3 rounded-xl transition-colors cursor-pointer"
                  >
                    Nova gravação
                  </button>
                </>
              )}
            </div>

            {/* Audio preview for recording */}
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
        )}

        {/* File Upload Card */}
        {mode === 'file' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4">

            {/* Drop zone / file selector */}
            {uploadState === 'idle' || uploadState === 'error' ? (
              <label
                htmlFor={fileInputId}
                className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-xl p-8 cursor-pointer transition-colors group"
              >
                <span className="text-4xl">📂</span>
                <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600 transition-colors">
                  Clique para selecionar um arquivo de áudio
                </span>
                <span className="text-xs text-gray-400">MP3, WAV, M4A, OGG, FLAC, AAC, WebM · máx. 50 MB</span>
                <input
                  id={fileInputId}
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/wave,audio/mp4,audio/x-m4a,audio/m4a,audio/ogg,audio/flac,audio/x-flac,audio/webm,audio/aac,.mp3,.wav,.m4a,.ogg,.flac,.aac,.webm"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
            ) : null}

            {/* File info + preview */}
            {selectedFile && (uploadState === 'selected' || uploadState === 'uploading') && (
              <>
                <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <span className="text-2xl">🎵</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    onClick={handleCancelFileUpload}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
                    aria-label="Remover arquivo selecionado"
                  >
                    ✕
                  </button>
                </div>

                {filePreviewUrl && (
                  <audio controls src={filePreviewUrl} className="w-full" />
                )}

                <div className="flex items-center gap-3 flex-wrap justify-center">
                  <button
                    onClick={transcribeFile}
                    disabled={isLoading || uploadState === 'uploading'}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium px-6 py-3 rounded-xl transition-colors cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Transcrevendo…
                      </>
                    ) : (
                      <><span>📤</span> Enviar e Transcrever</>
                    )}
                  </button>
                  <button
                    onClick={handleCancelFileUpload}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-60 text-gray-700 font-medium px-6 py-3 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}

            {/* Errors */}
            {(fileError || apiError) && (
              <p className="text-sm text-red-500 text-center">{fileError ?? apiError}</p>
            )}
          </div>
        )}

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
