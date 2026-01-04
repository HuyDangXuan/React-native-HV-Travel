import { MessageBoxType } from './MessageBox';

type ShowOptions = {
  type?: MessageBoxType;
  title: string;
  content?: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
};

let showFn: ((options: ShowOptions) => void) | null = null;

export const MessageBoxService = {
  register(fn: (options: ShowOptions) => void) {
    showFn = fn;
  },

  show(options: ShowOptions) {
    showFn?.(options);
  },

  success(title: string, content?: string, onConfirm?: () => void) {
    showFn?.({
      type: 'success',
      title,
      content,
      onConfirm,
    });
  },

  error(title: string, content?: string) {
    showFn?.({
      type: 'error',
      title,
      content,
    });
  },

  warning(title: string, content?: string, onConfirm?: () => void) {
    showFn?.({
      type: 'warning',
      title,
      content,
      showCancel: true,
      onConfirm,
    });
  },

  confirm: ({
    title,
    content,
    confirmText = "Yes",
    cancelText = "No",
    onConfirm,
    onCancel,
  }: {
    title: string;
    content?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => {
    showFn?.({
      type: "warning",
      title,
      content,
      showCancel: true,
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
    });
  },
};
