import React, { createContext, useContext, useState } from 'react';
import MessageBox, { MessageBoxType } from './MessageBox';

interface ShowOptions {
  type?: MessageBoxType;
  title: string;
  content?: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface MessageBoxContextType {
  show: (options: ShowOptions) => void;
  hide: () => void;
}

const MessageBoxContext = createContext<MessageBoxContextType | null>(null);

export const MessageBoxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ShowOptions | null>(null);

  const show = (opts: ShowOptions) => {
    setOptions(opts);
    setVisible(true);
  };

  const hide = () => {
    setVisible(false);
    setOptions(null);
  };

  return (
    <MessageBoxContext.Provider value={{ show, hide }}>
      {children}

      {options && (
        <MessageBox
          visible={visible}
          type={options.type}
          title={options.title}
          content={options.content}
          confirmText={options.confirmText}
          cancelText={options.cancelText}
          showCancel={options.showCancel}
          onConfirm={() => {
            hide();
            options.onConfirm?.();
          }}
          onCancel={() => {
            hide();
            options.onCancel?.();
          }}
        />
      )}
    </MessageBoxContext.Provider>
  );
};

export const useMessageBox = () => {
  const ctx = useContext(MessageBoxContext);
  if (!ctx) {
    throw new Error('useMessageBox must be used inside MessageBoxProvider');
  }
  return ctx;
};
