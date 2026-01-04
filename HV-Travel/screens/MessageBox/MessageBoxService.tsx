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

  success(title: string, content?: string, confirmText?: string, onConfirm?: () => void) {
    showFn?.({
      type: 'success',
      title,
      content,
      confirmText,
      onConfirm,
    });
  },

  error(title: string, content?: string, confirmText?: string, onConfirm?: () => void) {
    showFn?.({
      type: 'error',
      title,
      content,
      confirmText,
      onConfirm,
    });
  },

  warning(title: string, content?: string, confirmText?: string, onConfirm?: () => void) {
    showFn?.({
      type: 'warning',
      title,
      content,
      confirmText,
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
      type: "question",
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
