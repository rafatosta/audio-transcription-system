import type { TranscriptionEntry } from '../types/transcription'

interface Props {
  history: TranscriptionEntry[]
  onSelect: (entry: TranscriptionEntry) => void
  onRemove: (id: string) => void
  onClear: () => void
  onSaveHistory: () => void
}

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(seconds?: number) {
  if (!seconds) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function TranscriptionHistory({ history, onSelect, onRemove, onClear, onSaveHistory }: Props) {
  if (history.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        Nenhuma transcrição ainda.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <span className="text-sm text-gray-500">{history.length} transcrição(ões)</span>
        <div className="flex items-center gap-3">
          <button
            onClick={onSaveHistory}
            className="text-xs text-emerald-500 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            💾 Salvar Histórico
          </button>
          <button
            onClick={onClear}
            className="text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer"
          >
            Limpar tudo
          </button>
        </div>
      </div>

      <ul className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
        {history.map((entry) => (
          <li
            key={entry.id}
            className="group bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-indigo-300 transition-colors"
          >
            <button
              className="w-full text-left cursor-pointer"
              onClick={() => onSelect(entry)}
            >
              <p className="text-sm text-gray-800 line-clamp-2 mb-1">{entry.text}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{formatDate(entry.timestamp)}</span>
                {entry.duration && <span>· {formatDuration(entry.duration)}</span>}
              </div>
            </button>
            <div className="flex justify-end mt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(entry.id)
                }}
                className="text-xs text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                aria-label="Remover transcrição"
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
