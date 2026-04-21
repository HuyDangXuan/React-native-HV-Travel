"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.darkTheme = exports.lightTheme = void 0;
exports.createTheme = createTheme;
exports.resolveThemeName = resolveThemeName;
const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    screen: 24,
    screenCompact: 16,
    sectionGap: 20,
    heroTop: 8,
};
const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 28,
    pill: 999,
};
const fontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    title: 28,
    hero: 28,
    page: 20,
};
const typography = {
    heroTitle: {
        fontSize: 28,
        lineHeight: 34,
        fontWeight: "800",
        letterSpacing: -0.5,
    },
    pageTitle: {
        fontSize: 20,
        lineHeight: 26,
        fontWeight: "800",
        letterSpacing: -0.3,
    },
    sectionTitle: {
        fontSize: 16,
        lineHeight: 22,
        fontWeight: "800",
    },
    body: {
        fontSize: 14,
        lineHeight: 22,
        fontWeight: "500",
    },
    label: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: "700",
    },
};
const layout = {
    topLevelPadding: 24,
    detailPadding: 16,
    authPadding: 24,
    bottomBarPadding: 16,
};
const border = {
    width: 1,
};
const shadow = {
    sm: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    md: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    lg: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
    },
};
const assets = {
    icon: {
        favicon: require("../assets/favicon.png"),
        back: require("../assets/back.png"),
        eye: require("../assets/eye.png"),
        hidden: require("../assets/hidden.png"),
    },
    image: {
        headerLogin: require("../assets/header-login.png"),
        logo: require("../assets/favicon.png"),
        testAvatar: require("../assets/rose.jpg"),
    },
    animation: {
        success: require("../assets/animations/success.json"),
        error: require("../assets/animations/error.json"),
        warning: require("../assets/animations/warning.json"),
        question: require("../assets/animations/question.json"),
        info: require("../assets/animations/warning.json"),
        loading: require("../assets/animations/loading.json"),
        animationlogo: require("../assets/animations/AnimationLogo.json"),
    },
    animationColor: {
        success: "#00bda4",
        error: "#00bda4",
        warning: "#00bda4",
        info: "#0ea5e9",
        question: "#00bda4",
    },
};
function createColorSet(name) {
    if (name === "dark") {
        return {
            primary: "rgb(34, 211, 238)",
            primaryLight: "rgba(34, 211, 238, 0.18)",
            secondary: "#38bdf8",
            white: "#0b1220",
            background: "#071018",
            surface: "#12202f",
            text: "#e2e8f0",
            gray: "#94a3b8",
            border: "#223244",
            error: "#f87171",
            placeholder: "#64748b",
            icon: "#cbd5e1",
            overlay: "rgba(2, 6, 23, 0.68)",
            success: "#34d399",
            warning: "#fbbf24",
            info: "#38bdf8",
        };
    }
    return {
        primary: "rgb(20, 184, 212)",
        primaryLight: "#ccfbf1",
        secondary: "#0ea5e9",
        white: "#FFFFFF",
        background: "#f5f8f8",
        surface: "#f1f5f9",
        text: "#0f172a",
        gray: "#64748b",
        border: "#e2e8f0",
        error: "#ef4444",
        placeholder: "#94a3b8",
        icon: "#64748b",
        overlay: "rgba(15, 23, 42, 0.42)",
        success: "#10b981",
        warning: "#f59e0b",
        info: "#0ea5e9",
    };
}
function createSemanticSet(name) {
    if (name === "dark") {
        return {
            screenBackground: "#071018",
            screenSurface: "#0f1b2a",
            screenMutedSurface: "#12202f",
            screenElevated: "#152537",
            divider: "#223244",
            textPrimary: "#e2e8f0",
            textSecondary: "#94a3b8",
            heroHeader: {
                paddingHorizontal: 24,
                paddingTop: 8,
                paddingBottom: 14,
            },
            compactHeader: {
                paddingHorizontal: 16,
                paddingVertical: 10,
            },
            contentSpacing: {
                topLevel: 24,
                detail: 16,
                sectionGap: 20,
            },
            emptyState: {
                iconSize: 110,
                paddingHorizontal: 32,
                paddingVertical: 64,
            },
        };
    }
    return {
        screenBackground: "#f5f8f8",
        screenSurface: "#FFFFFF",
        screenMutedSurface: "#f1f5f9",
        screenElevated: "#FFFFFF",
        divider: "#e2e8f0",
        textPrimary: "#0f172a",
        textSecondary: "#64748b",
        heroHeader: {
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: 14,
        },
        compactHeader: {
            paddingHorizontal: 16,
            paddingVertical: 10,
        },
        contentSpacing: {
            topLevel: 24,
            detail: 16,
            sectionGap: 20,
        },
        emptyState: {
            iconSize: 110,
            paddingHorizontal: 32,
            paddingVertical: 64,
        },
    };
}
function createTheme(name) {
    return {
        name,
        spacing,
        colors: createColorSet(name),
        radius,
        fontSize,
        typography,
        layout,
        border,
        shadow,
        semantic: createSemanticSet(name),
        ...assets,
    };
}
exports.lightTheme = createTheme("light");
exports.darkTheme = createTheme("dark");
const theme = exports.lightTheme;
function resolveThemeName(mode, systemScheme) {
    if (mode === "system") {
        return systemScheme === "dark" ? "dark" : "light";
    }
    return mode;
}
exports.default = theme;
