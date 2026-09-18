import { useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRecordings } from '@/hooks/useRecordings';
import { useToast } from '@/hooks/useToast';
import { LibraryToolbar } from '@/components/library/LibraryToolbar';
import { RecordingCard } from '@/components/library/RecordingCard';
import { RecordingDetailsModal } from '@/components/library/RecordingDetailsModal';
import { StoragePanel } from '@/components/library/StoragePanel';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { buildRecordingFilename, extensionFromMimeType } from '@/lib/format';
import type { RecordingRecord } from '@/types/recording';

export function LibraryPage() {
  const {
    recordings,
    isLoading,
    isEmpty,
    filters,
    setFilters,
    selectedIds,
    toggleSelected,
    remove,
    removeSelected,
    rename,
  } = useRecordings();
  const { showToast } = useToast();

  const [openRecord, setOpenRecord] = useState<RecordingRecord | null>(null);
  const [pendingDelete, setPendingDelete] = useState<RecordingRecord | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  function handleDownload(record: RecordingRecord) {
    const url = URL.createObjectURL(record.videoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = buildRecordingFilename(new Date(record.createdAt), extensionFromMimeType(record.mimeType));
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    await remove(pendingDelete.id);
    showToast({ variant: 'success', title: 'Gravação excluída', description: `"${pendingDelete.name}" foi removida do armazenamento local.` });
    if (openRecord?.id === pendingDelete.id) setOpenRecord(null);
    setPendingDelete(null);
  }

  async function confirmBulkDeleteAction() {
    const count = selectedIds.size;
    await removeSelected();
    showToast({ variant: 'success', title: 'Gravações excluídas', description: `${count} gravações foram removidas.` });
    setConfirmBulkDelete(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">Minhas gravações</h1>
          <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
            Tudo o que você gravou fica salvo localmente, neste navegador.
          </p>
        </div>
        <Link to="/gravar">
          <Button>Nova gravação</Button>
        </Link>
      </div>

      {!isEmpty && (
        <div className="mb-6">
          <StoragePanel recordingCount={recordings.length} refreshKey={recordings.length} />
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5]" />
          ))}
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={FolderOpen}
          title="Nenhuma gravação ainda"
          description="Suas gravações aparecerão aqui assim que você salvar a primeira. Tudo fica guardado localmente, neste navegador."
          action={
            <Link to="/gravar">
              <Button>Começar a gravar</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="mb-5">
            <LibraryToolbar
              filters={filters}
              onChange={setFilters}
              selectedCount={selectedIds.size}
              onDeleteSelected={() => setConfirmBulkDelete(true)}
            />
          </div>

          {recordings.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="Nada encontrado"
              description="Nenhuma gravação corresponde à busca ou aos filtros aplicados."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recordings.map((record) => (
                <RecordingCard
                  key={record.id}
                  record={record}
                  isSelected={selectedIds.has(record.id)}
                  onToggleSelect={toggleSelected}
                  onOpen={setOpenRecord}
                  onDownload={handleDownload}
                  onDeleteRequest={setPendingDelete}
                />
              ))}
            </div>
          )}
        </>
      )}

      <RecordingDetailsModal
        record={openRecord}
        onClose={() => setOpenRecord(null)}
        onRename={rename}
        onDownload={handleDownload}
        onDeleteRequest={setPendingDelete}
      />

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Excluir gravação?"
        description={`Esta ação removerá "${pendingDelete?.name}" do armazenamento local. Não é possível desfazer.`}
        confirmLabel="Excluir"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        isOpen={confirmBulkDelete}
        title="Excluir gravações selecionadas?"
        description={`${selectedIds.size} gravações serão removidas do armazenamento local. Não é possível desfazer.`}
        confirmLabel="Excluir selecionadas"
        onConfirm={confirmBulkDeleteAction}
        onCancel={() => setConfirmBulkDelete(false)}
      />
    </div>
  );
}
