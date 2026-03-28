import React, { useRef, useEffect } from "react";
import { View, Modal, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import theme from "../../config/theme";

interface LoadingOverlayProps {
  visible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible }) => {
  const animRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      animRef.current?.reset();
      animRef.current?.play();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.container}>
        <LottieView
          ref={animRef}
          source={theme.animation.loading}
          autoPlay
          loop
          style={styles.anim}
        />
        </View>
      </View>
    </Modal>
  );
};

export default LoadingOverlay;

const styles = StyleSheet.create({
  overlay: {
    flex: 1, // cover full screen
    justifyContent: "center",
    alignItems: "center",
  },
  container:{
    width: 140,
    height: 140,
    backgroundColor: theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.spacing.md,
    borderColor: "gray",
    borderWidth: 0.15,
  },
  anim: {
    width: 240,
    height: 240,
  },
});
