"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeModeProvider = ThemeModeProvider;
exports.useThemeMode = useThemeMode;
exports.useAppTheme = useAppTheme;
const jsx_runtime_1 = require("react/jsx-runtime");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const react_1 = require("react");
const react_native_1 = require("react-native");
const theme_1 = require("../config/theme");
const THEME_MODE_KEY = "app_theme_mode_v1";
const ThemeModeContext = (0, react_1.createContext)(null);
function ThemeModeProvider({ children }) {
    const [mode, setMode] = (0, react_1.useState)("system");
    const [systemScheme, setSystemScheme] = (0, react_1.useState)(react_native_1.Appearance.getColorScheme());
    (0, react_1.useEffect)(() => {
        async_storage_1.default.getItem(THEME_MODE_KEY)
            .then((storedMode) => {
            if (storedMode === "light" || storedMode === "dark" || storedMode === "system") {
                setMode(storedMode);
            }
        })
            .catch(() => undefined);
    }, []);
    (0, react_1.useEffect)(() => {
        const subscription = react_native_1.Appearance.addChangeListener(({ colorScheme }) => {
            setSystemScheme(colorScheme);
        });
        return () => subscription.remove();
    }, []);
    const themeName = (0, react_1.useMemo)(() => (0, theme_1.resolveThemeName)(mode, systemScheme), [mode, systemScheme]);
    const theme = (0, react_1.useMemo)(() => (0, theme_1.createTheme)(themeName), [themeName]);
    const setThemeMode = async (nextMode) => {
        setMode(nextMode);
        await async_storage_1.default.setItem(THEME_MODE_KEY, nextMode);
    };
    const value = (0, react_1.useMemo)(() => ({
        mode,
        themeName,
        theme,
        setThemeMode,
    }), [mode, themeName, theme]);
    return ((0, jsx_runtime_1.jsx)(ThemeModeContext.Provider, { value: value, children: children }));
}
function useThemeMode() {
    const context = (0, react_1.useContext)(ThemeModeContext);
    if (!context) {
        throw new Error("useThemeMode must be used inside ThemeModeProvider");
    }
    return context;
}
function useAppTheme() {
    return useThemeMode().theme;
}
