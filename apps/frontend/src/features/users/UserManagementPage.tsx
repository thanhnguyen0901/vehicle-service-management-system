import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Password } from 'primereact/password';
import { Tag } from 'primereact/tag';
import { selectCurrentUser } from '../auth/authSlice';
import { USER_ROLES, userApi, type UserAccount, type UserRole } from './userApi';

interface UserFormState {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
}

const emptyForm: UserFormState = {
  username: '',
  password: '',
  fullName: '',
  email: '',
  phone: '',
  role: 'ServiceAdvisor',
  isActive: true,
};

export function UserManagementPage() {
  const currentUser = useSelector(selectCurrentUser);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [search, setSearch] = useState('');

  const canRead = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';
  const canCreate = currentUser?.role === 'Admin';
  const canDeactivate = currentUser?.role === 'Admin';

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((user) =>
      [user.username, user.fullName, user.email, user.phone, user.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [search, users]);

  const loadUsers = async () => {
    if (!canRead) return;
    setIsLoading(true);
    setError(null);
    try {
      setUsers(await userApi.list());
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không tải được danh sách người dùng'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [canRead]);

  const openCreateDialog = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (user: UserAccount) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      password: '',
      fullName: user.fullName,
      email: user.email ?? '',
      phone: user.phone ?? '',
      role: user.role,
      isActive: user.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (editingUser) {
        await userApi.update(editingUser.id, {
          fullName: form.fullName,
          email: form.email || null,
          phone: form.phone || null,
          role: form.role,
          isActive: form.isActive,
        });
      } else {
        await userApi.create({
          username: form.username,
          password: form.password,
          fullName: form.fullName,
          email: form.email || undefined,
          phone: form.phone || undefined,
          role: form.role,
        });
      }

      setDialogOpen(false);
      await loadUsers();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không lưu được người dùng'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (user: UserAccount) => {
    setIsSaving(true);
    setError(null);
    try {
      await userApi.deactivate(user.id);
      await loadUsers();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không khóa được người dùng'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!canRead) {
    return (
      <div className="page-shell">
        <Message severity="warn" text="Bạn không có quyền truy cập quản lý người dùng." />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Người dùng</h1>
          <p className="text-sm text-gray-500">Quản lý tài khoản nội bộ và vai trò nghiệp vụ.</p>
        </div>
        <div className="page-toolbar">
          <span className="p-input-icon-left page-search">
            <i className="pi pi-search" />
            <InputText
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm người dùng"
            />
          </span>
          <Button
            label="Tạo người dùng"
            icon="pi pi-plus"
            className="page-create-button"
            onClick={openCreateDialog}
            disabled={!canCreate}
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
          value={filteredUsers}
          loading={isLoading}
          dataKey="id"
          paginator
          rows={10}
          emptyMessage="Chưa có người dùng phù hợp"
          tableStyle={{ minWidth: '64rem' }}
        >
          <Column field="username" header="Tên đăng nhập" sortable />
          <Column field="fullName" header="Họ tên" sortable />
          <Column field="email" header="Email" />
          <Column field="phone" header="SĐT" />
          <Column field="role" header="Vai trò" sortable />
          <Column
            header="Trạng thái"
            body={(row: UserAccount) => (
              <Tag value={row.isActive ? 'Hoạt động' : 'Đã khóa'} severity={row.isActive ? 'success' : 'danger'} />
            )}
          />
          <Column
            header="Thao tác"
            body={(row: UserAccount) => (
              <div className="flex gap-2">
                <Button
                  icon="pi pi-pencil"
                  rounded
                  text
                  aria-label={`Sửa ${row.username}`}
                  onClick={() => openEditDialog(row)}
                />
                <Button
                  icon="pi pi-ban"
                  rounded
                  text
                  severity="danger"
                  aria-label={`Khóa ${row.username}`}
                  disabled={!canDeactivate || !row.isActive || row.id === currentUser?.id}
                  onClick={() => void handleDeactivate(row)}
                />
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header={editingUser ? 'Cập nhật người dùng' : 'Tạo người dùng'}
        visible={dialogOpen}
        className="w-[min(92vw,560px)]"
        onHide={() => setDialogOpen(false)}
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Tên đăng nhập
              <InputText
                value={form.username}
                disabled={Boolean(editingUser)}
                required
                minLength={3}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              />
            </label>
            {!editingUser && (
              <label htmlFor="user-password" className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                Mật khẩu
                <Password
                  inputId="user-password"
                  value={form.password}
                  required
                  feedback={false}
                  toggleMask
                  inputClassName="w-full"
                  autoComplete="new-password"
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                />
              </label>
            )}
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Họ tên
              <InputText
                value={form.fullName}
                required
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Vai trò
              <Dropdown
                value={form.role}
                options={[...USER_ROLES]}
                onChange={(event) => setForm((prev) => ({ ...prev, role: event.value as UserRole }))}
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
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              SĐT
              <InputText
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </label>
            {editingUser && (
              <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                Trạng thái
                <Dropdown
                  value={form.isActive}
                  options={[
                    { label: 'Hoạt động', value: true },
                    { label: 'Đã khóa', value: false },
                  ]}
                  onChange={(event) => setForm((prev) => ({ ...prev, isActive: Boolean(event.value) }))}
                />
              </label>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              label="Hủy"
              severity="secondary"
              outlined
              onClick={() => setDialogOpen(false)}
            />
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
