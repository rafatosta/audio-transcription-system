import { useRef, useState, useCallback } from 'react'

export type RecordingState = 'idle' | 'recording' | 'stopped'

export function useAudioRecorder() {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startRecording = useCallback(async () => {
    setError(null)
    setAudioBlob(null)
    setRecordingDuration(0)
    chunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      mediaRecorder.start()
      setRecordingState('recording')

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err)
      setError(`Não foi possível acessar o microfone. Verifique as permissões. (${detail})`)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setRecordingState('stopped')
  }, [])

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.ondataavailable = null
      mediaRecorderRef.current.onstop = null
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    chunksRef.current = []
    setAudioBlob(null)
    setRecordingDuration(0)
    setRecordingState('idle')
  }, [])

  const reset = useCallback(() => {
    setAudioBlob(null)
    setRecordingDuration(0)
    setRecordingState('idle')
    setError(null)
  }, [])

  return {
    recordingState,
    audioBlob,
    error,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
  }
}
