import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { confirmDelete } from '../../shared/utils/confirmDelete';
import { selectCurrentUser } from '../auth/authSlice';
import { customerApi, type Customer, type CustomerType } from './customerApi';

interface CustomerFormState {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  type: CustomerType;
  companyName: string;
  taxCode: string;
  notes: string;
}

const emptyForm: CustomerFormState = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  type: 'Individual',
  companyName: '',
  taxCode: '',
  notes: '',
};

const typeOptions = [
  { label: 'Cá nhân', value: 'Individual' },
  { label: 'Doanh nghiệp', value: 'Corporate' },
];

export function CustomerListPage() {
  const currentUser = useSelector(selectCurrentUser);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerFormState>(emptyForm);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<CustomerType | null>(null);

  const canRead = Boolean(currentUser);
  const canWrite = currentUser?.role === 'Admin' || currentUser?.role === 'ServiceAdvisor';
  const canDelete = currentUser?.role === 'Admin';

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesType = !typeFilter || customer.type === typeFilter;
      const matchesKeyword =
        !keyword ||
        [
          customer.fullName,
          customer.phone,
          customer.email,
          customer.address,
          customer.companyName,
          customer.taxCode,
          customer.notes,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));

      return matchesType && matchesKeyword;
    });
  }, [customers, search, typeFilter]);

  const loadCustomers = async () => {
    if (!canRead) return;
    setIsLoading(true);
    setError(null);
    try {
      setCustomers(await customerApi.list());
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không tải được danh sách khách hàng'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCustomers();
  }, [canRead]);

  const openCreateDialog = () => {
    setEditingCustomer(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email ?? '',
      address: customer.address ?? '',
      type: customer.type,
      companyName: customer.companyName ?? '',
      taxCode: customer.taxCode ?? '',
      notes: customer.notes ?? '',
    });
    setDialogOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload = {
      fullName: form.fullName,
      phone: form.phone,
      email: form.email || null,
      address: form.address || null,
      type: form.type,
      companyName: form.type === 'Corporate' ? form.companyName || null : null,
      taxCode: form.type === 'Corporate' ? form.taxCode || null : null,
      notes: form.notes || null,
    };

    try {
      if (editingCustomer) {
        await customerApi.update(editingCustomer.id, payload);
      } else {
        await customerApi.create(payload);
      }
      setDialogOpen(false);
      await loadCustomers();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không lưu được khách hàng'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (customer: Customer) => {
    setIsSaving(true);
    setError(null);
    try {
      await customerApi.delete(customer.id);
      await loadCustomers();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không xóa được khách hàng'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Khách hàng</h1>
          <p className="text-sm text-gray-500">Quản lý hồ sơ cá nhân, doanh nghiệp và thông tin xuất hóa đơn.</p>
        </div>
        <div className="page-toolbar">
          <span className="p-input-icon-left page-search">
            <i className="pi pi-search" />
            <InputText
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm khách hàng"
            />
          </span>
          <Dropdown
            value={typeFilter}
            options={[{ label: 'Tất cả loại', value: null }, ...typeOptions]}
            placeholder="Tất cả loại"
            onChange={(event) => setTypeFilter((event.value as CustomerType | null) ?? null)}
            className="page-filter"
          />
          <Button
            label="Tạo khách hàng"
            icon="pi pi-plus"
            className="page-create-button"
            onClick={openCreateDialog}
            disabled={!canWrite}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Message severity="error" text={error} />
        </div>
      )}

      <div className="page-table-surface">
        <DataTable
          value={filteredCustomers}
          loading={isLoading}
          dataKey="id"
          paginator
          rows={10}
          emptyMessage="Chưa có khách hàng phù hợp"
          tableStyle={{ minWidth: '72rem' }}
        >
          <Column field="fullName" header="Họ tên" sortable />
          <Column field="phone" header="SĐT" />
          <Column field="email" header="Email" />
          <Column
            header="Loại"
            body={(row: Customer) => (
              <Tag value={row.type === 'Corporate' ? 'Doanh nghiệp' : 'Cá nhân'} severity={row.type === 'Corporate' ? 'info' : 'success'} />
            )}
          />
          <Column field="companyName" header="Công ty" />
          <Column field="taxCode" header="MST" />
          <Column header="Xe" body={(row: Customer) => row._count?.vehicles ?? 0} />
          <Column
            header="Thao tác"
            body={(row: Customer) => (
              <div className="flex gap-2">
                <Button
                  icon="pi pi-pencil"
                  rounded
                  text
                  aria-label={`Sửa ${row.fullName}`}
                  disabled={!canWrite}
                  onClick={() => openEditDialog(row)}
                />
                <Button
                  icon="pi pi-trash"
                  rounded
                  text
                  severity="danger"
                  aria-label={`Xóa ${row.fullName}`}
                  disabled={!canDelete}
                  onClick={() =>
                    confirmDelete({
                      itemName: `khách hàng ${row.fullName}`,
                      accept: () => void handleDelete(row),
                    })
                  }
                />
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header={editingCustomer ? 'Cập nhật khách hàng' : 'Tạo khách hàng'}
        visible={dialogOpen}
        className="w-[min(94vw,760px)]"
        onHide={() => setDialogOpen(false)}
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Họ tên
              <InputText
                value={form.fullName}
                required
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              SĐT
              <InputText
                value={form.phone}
                required
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Email
              <InputText
                type="email"
                value={form.email}
                autoComplete="off"
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </label>
            <div className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              <label htmlFor="customer-type">Loại khách hàng</label>
              <Dropdown
                inputId="customer-type"
                value={form.type}
                options={typeOptions}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, type: event.value as CustomerType }))
                }
              />
            </div>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 md:col-span-2">
              Địa chỉ
              <InputText
                value={form.address}
                onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
              />
            </label>
            {form.type === 'Corporate' && (
              <>
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  Tên công ty
                  <InputText
                    value={form.companyName}
                    required
                    onChange={(event) => setForm((prev) => ({ ...prev, companyName: event.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  Mã số thuế
                  <InputText
                    value={form.taxCode}
                    onChange={(event) => setForm((prev) => ({ ...prev, taxCode: event.target.value }))}
                  />
                </label>
              </>
            )}
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 md:col-span-2">
              Ghi chú
              <InputTextarea
                value={form.notes}
                rows={3}
                autoResize
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" label="Hủy" severity="secondary" outlined onClick={() => setDialogOpen(false)} />
            <Button type="submit" label="Lưu" icon="pi pi-save" loading={isSaving} />
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function getErrorMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
      ?.message ?? fallback
  );
}
