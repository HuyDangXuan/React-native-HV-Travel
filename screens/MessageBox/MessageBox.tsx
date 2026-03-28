import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import LottieView from 'lottie-react-native';
import theme from '../../config/theme';

export type MessageBoxType = 'success' | 'error' | 'question' | 'warning' | 'info' | 'animationlogo';

interface MessageBoxProps {
  visible: boolean;
  type?: MessageBoxType;

  animation?: any;

  title: string;
  content?: string;

  confirmText?: string; // Yes
  cancelText?: string;  // No
  showCancel?: boolean;

  onConfirm: () => void;
  onCancel?: () => void;
}

const animationMap: Record<MessageBoxType, any> = {
  success: theme.animation.success,
  error: theme.animation.error,
  question: theme.animation.question,
  warning: theme.animation.warning,
  info: theme.animation.info,
  animationlogo: theme.animation.animationlogo,
};


const MessageBox: React.FC<MessageBoxProps> = ({
  visible,
  type = 'info',
  animation,
  title,
  content,
  confirmText = 'Yes',
  cancelText = 'No',
  showCancel = false,
  onConfirm,
  onCancel,
}) => {
  const animRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
        animRef.current?.reset();
        animRef.current?.play();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>

          {/* Animation */}
          <LottieView
            ref={animRef}
            source={animation ?? animationMap[type]}
            loop={false}
            style={styles.anim}
            speed={1.5}
          />

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Content */}
          {content ? <Text style={styles.content}>{content}</Text> : null}

          {/* Actions */}
          <View style={styles.actions}>
            {showCancel && (
              <TouchableOpacity
                onPress={onCancel}
                style={[styles.btn, styles.btnCancel]}
                activeOpacity={0.8}
              >
                <Text style={[styles.txt, styles.txtCancel]}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onConfirm}
              style={[styles.btn, { backgroundColor: theme.colors.primary }]}
              activeOpacity={0.85}
            >
              <Text style={[styles.txt, styles.txtConfirm]}>{confirmText}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default MessageBox;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.border + 'AA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '80%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  anim: {
    width: 120,
    height: 120,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
    color: theme.colors.text,
  },
  content: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  btn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.sm,
  },
  btnCancel: {
    backgroundColor: theme.colors.error,
  },
  txt: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    textAlign: 'center',
  },
  txtCancel: {
    color: theme.colors.white, // chữ nút No trắng
  },
  txtConfirm: {
    color: theme.colors.white, // chữ nút Yes trắng
  },
});
