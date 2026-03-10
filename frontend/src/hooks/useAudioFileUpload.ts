import { useState, useCallback, useRef } from 'react'

const ACCEPTED_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'audio/ogg',
  'audio/flac',
  'audio/x-flac',
  'audio/webm',
  'audio/aac',
]

const ACCEPTED_EXTENSIONS = /\.(mp3|wav|m4a|ogg|flac|aac|webm)$/i

const MAX_FILE_SIZE_MB = 50
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export type FileUploadState = 'idle' | 'selected' | 'uploading' | 'done' | 'error'

export function useAudioFileUpload() {
  const [uploadState, setUploadState] = useState<FileUploadState>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const previewUrlRef = useRef<string | null>(null)

  const revokePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
  }, [])

  const selectFile = useCallback(
    (file: File | null) => {
      revokePreview()
      setError(null)

      if (!file) {
        setSelectedFile(null)
        setPreviewUrl(null)
        setUploadState('idle')
        return
      }

      const isValidMime = ACCEPTED_MIME_TYPES.includes(file.type)
      const isValidExt = ACCEPTED_EXTENSIONS.test(file.name)

      if (!isValidMime && !isValidExt) {
        setError(
          `Formato de arquivo não suportado. Use: MP3, WAV, M4A, OGG, FLAC, AAC ou WebM.`,
        )
        setSelectedFile(null)
        setPreviewUrl(null)
        setUploadState('idle')
        return
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`O arquivo excede o tamanho máximo de ${MAX_FILE_SIZE_MB} MB.`)
        setSelectedFile(null)
        setPreviewUrl(null)
        setUploadState('idle')
        return
      }

      const url = URL.createObjectURL(file)
      previewUrlRef.current = url
      setSelectedFile(file)
      setPreviewUrl(url)
      setUploadState('selected')
    },
    [revokePreview],
  )

  const reset = useCallback(() => {
    revokePreview()
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadState('idle')
    setError(null)
  }, [revokePreview])

  return {
    uploadState,
    selectedFile,
    previewUrl,
    error,
    setUploadState,
    setError,
    selectFile,
    reset,
  }
}
