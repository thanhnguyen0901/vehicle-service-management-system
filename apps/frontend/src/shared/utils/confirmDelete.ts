import { confirmDialog } from 'primereact/confirmdialog';

interface ConfirmDeleteOptions {
  itemName: string;
  message?: string;
  accept: () => void;
}

export function confirmDelete({ itemName, message, accept }: ConfirmDeleteOptions) {
  confirmDialog({
    header: 'Xác nhận xóa',
    message: message ?? `Bạn có chắc muốn xóa ${itemName}?`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Xóa',
    rejectLabel: 'Hủy',
    acceptClassName: 'p-button-danger',
    rejectClassName: 'p-button-secondary p-button-outlined',
    defaultFocus: 'reject',
    accept,
  });
}
