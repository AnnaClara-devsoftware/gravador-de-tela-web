import { Search, ArrowUpDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { LibraryFilters, SortField } from '@/types/recording';

const SORT_OPTIONS: Array<{ value: SortField; label: string }> = [
  { value: 'createdAt', label: 'Data' },
  { value: 'name', label: 'Nome' },
  { value: 'durationMs', label: 'Duração' },
  { value: 'sizeBytes', label: 'Tamanho' },
];

interface LibraryToolbarProps {
  filters: LibraryFilters;
  onChange: (next: LibraryFilters) => void;
  selectedCount: number;
  onDeleteSelected: () => void;
}

export function LibraryToolbar({ filters, onChange, selectedCount, onDeleteSelected }: LibraryToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 sm:max-w-xs">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
        <input
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="Buscar gravações…"
          aria-label="Buscar gravações"
          className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] py-2 pl-9 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {selectedCount > 0 && (
          <Button variant="danger" size="sm" onClick={onDeleteSelected}>
            <Trash2 size={14} /> Excluir ({selectedCount})
          </Button>
        )}

        <label className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
          <input
            type="checkbox"
            checked={filters.onlyWithWebcam}
            onChange={(e) => onChange({ ...filters, onlyWithWebcam: e.target.checked })}
            className="h-3.5 w-3.5 accent-[var(--color-accent)]"
          />
          Com webcam
        </label>
        <label className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
          <input
            type="checkbox"
            checked={filters.onlyWithAudio}
            onChange={(e) => onChange({ ...filters, onlyWithAudio: e.target.checked })}
            className="h-3.5 w-3.5 accent-[var(--color-accent)]"
          />
          Com áudio
        </label>

        <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2 py-1.5">
          <ArrowUpDown size={13} className="text-[var(--color-text-faint)]" />
          <select
            value={filters.sortField}
            onChange={(e) => onChange({ ...filters, sortField: e.target.value as SortField })}
            aria-label="Ordenar por"
            className="bg-transparent text-xs text-[var(--color-text)] outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => onChange({ ...filters, sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc' })}
            aria-label={filters.sortDirection === 'asc' ? 'Ordem crescente' : 'Ordem decrescente'}
            className="text-xs text-[var(--color-text-muted)]"
          >
            {filters.sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
    </div>
  );
}
