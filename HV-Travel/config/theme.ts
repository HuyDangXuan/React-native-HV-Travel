const theme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  colors: {
    primary: "#007AFF",
    secondary: "#34C759",
    white: "#FFFFFF",
    surface: "#F2F2F7",
    text: "#111111",
    gray: "#8E8E93",
    border: "#E5E5EA",
    danger: "#FF3B30",
  },

  radius: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
  },

  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    title: 28,
  },

  animation: {
    success: require('../assets/animations/success.json'),
    error: require('../assets/animations/error.json'),
    warning: require('../assets/animations/warning.json'),
    info: require('../assets/animations/question.json'),
  },

  animationColor: {
    success: '#2ecc71',
    error: '#e74c3c',
    warning: '#f39c12',
    info: '#3085d6',
  }
};

export default theme;
