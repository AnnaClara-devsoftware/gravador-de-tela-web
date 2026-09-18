import { BROWSER_COMPAT_MATRIX } from '@/lib/compat/browserMatrix';
import { MatrixCell } from './SupportBadge';

const COLUMNS = [
  { key: 'chrome', label: 'Chrome' },
  { key: 'edge', label: 'Edge' },
  { key: 'firefox', label: 'Firefox' },
  { key: 'safari', label: 'Safari' },
] as const;

export function BrowserMatrixTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)] text-left">
            <th className="px-4 py-3 font-medium text-[var(--color-text)]">Recurso</th>
            {COLUMNS.map((col) => (
              <th key={col.key} className="px-4 py-3 text-center font-medium text-[var(--color-text)]">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BROWSER_COMPAT_MATRIX.map((row) => (
            <tr key={row.feature} className="border-b border-[var(--color-border)] last:border-0">
              <td className="px-4 py-3 align-top">
                <p className="text-[var(--color-text)]">{row.feature}</p>
                {row.notes && <p className="mt-1 text-xs text-[var(--color-text-faint)]">{row.notes}</p>}
              </td>
              {COLUMNS.map((col) => (
                <td key={col.key} className="px-4 py-3 text-center align-top">
                  <MatrixCell value={row[col.key]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
