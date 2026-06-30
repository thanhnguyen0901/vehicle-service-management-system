import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { auditLogApi, type AuditLog } from './auditLogApi';

const actionSeverities: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'danger',
};

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entityOptions = useMemo(
    () => Array.from(new Set(logs.map((log) => log.entity))).sort(),
    [logs],
  );

  const loadLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rows = await auditLogApi.list({
        search: search.trim() || undefined,
        action: action || undefined,
        entity: entity || undefined,
        from: from || undefined,
        to: to || undefined,
        take: 100,
      });
      setLogs(rows);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không tải được nhật ký thao tác'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadLogs();
  };

  const resetFilters = () => {
    setSearch('');
    setAction('');
    setEntity('');
    setFrom('');
    setTo('');
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Nhật ký thao tác</h1>
          <p className="text-sm text-gray-500">Tra cứu các thao tác tạo, cập nhật và xóa trong hệ thống.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Message severity="error" text={error} />
        </div>
      )}

      <form onSubmit={handleSearch} className="filter-panel lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Tìm kiếm
          <InputText
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Action, entity, user"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Action
          <select className="p-inputtext w-full" value={action} onChange={(event) => setAction(event.target.value)}>
            <option value="">Tất cả</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Entity
          <select className="p-inputtext w-full" value={entity} onChange={(event) => setEntity(event.target.value)}>
            <option value="">Tất cả</option>
            {entityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Từ ngày
          <InputText type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Đến ngày
          <InputText type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </label>
        <div className="filter-actions">
          <Button type="submit" label="Tìm" icon="pi pi-search" loading={isLoading} />
          <Button type="button" icon="pi pi-filter-slash" severity="secondary" aria-label="Xóa lọc" onClick={resetFilters} />
        </div>
      </form>

      <div className="page-table-surface">
        <DataTable
          value={logs}
          loading={isLoading}
          dataKey="id"
          paginator
          rows={10}
          emptyMessage="Chưa có nhật ký thao tác phù hợp"
          tableStyle={{ minWidth: '76rem' }}
        >
          <Column header="Thời gian" body={(row: AuditLog) => formatDateTime(row.createdAt)} sortable />
          <Column
            header="Action"
            body={(row: AuditLog) => (
              <Tag value={row.action} severity={actionSeverities[row.action] ?? 'info'} />
            )}
          />
          <Column field="entity" header="Entity" sortable />
          <Column header="Người dùng" body={(row: AuditLog) => row.user?.fullName ?? 'System'} />
          <Column header="Role" body={(row: AuditLog) => row.user?.role ?? '-'} />
          <Column header="Entity ID" body={(row: AuditLog) => row.entityId ?? '-'} />
          <Column header="IP" body={(row: AuditLog) => row.ipAddress ?? '-'} />
          <Column
            header=""
            body={(row: AuditLog) => (
              <Button
                icon="pi pi-eye"
                text
                rounded
                aria-label={`Xem audit ${row.id}`}
                onClick={() => setSelectedLog(row)}
              />
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header={selectedLog ? `Audit ${selectedLog.action} ${selectedLog.entity}` : 'Chi tiết audit'}
        visible={!!selectedLog}
        style={{ width: 'min(58rem, 96vw)' }}
        modal
        onHide={() => setSelectedLog(null)}
      >
        {selectedLog && (
          <div className="space-y-4 text-sm text-gray-700">
            <div className="grid gap-3 rounded-md border border-gray-200 p-4 md:grid-cols-3">
              <Info label="Action" value={selectedLog.action} />
              <Info label="Entity" value={selectedLog.entity} />
              <Info label="Người dùng" value={selectedLog.user?.fullName ?? 'System'} />
              <Info label="Thời gian" value={formatDateTime(selectedLog.createdAt)} />
              <Info label="Entity ID" value={selectedLog.entityId ?? '-'} />
              <Info label="User Agent" value={selectedLog.userAgent ?? '-'} />
            </div>
            <section>
              <h2 className="mb-2 text-base font-semibold text-gray-800">Dữ liệu sau thao tác</h2>
              <pre className="max-h-96 overflow-auto rounded bg-gray-950 p-4 text-xs text-gray-100">
                {formatJson(selectedLog.after)}
              </pre>
            </section>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase text-gray-500">{label}</div>
      <div className="mt-1 break-words font-semibold text-gray-800">{value}</div>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('vi-VN');
}

function formatJson(value: unknown) {
  return JSON.stringify(value ?? null, null, 2);
}

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string | string[] } } }).response;
    const message = response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (message) return message;
  }
  return fallback;
}
