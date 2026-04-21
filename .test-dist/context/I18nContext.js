"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18nProvider = I18nProvider;
exports.useI18n = useI18n;
const jsx_runtime_1 = require("react/jsx-runtime");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const react_1 = require("react");
const i18n_1 = require("../i18n");
const LOCALE_STORAGE_KEY = "app_locale_v1";
const I18nContext = (0, react_1.createContext)(null);
function I18nProvider({ children }) {
    const [locale, setLocaleState] = (0, react_1.useState)(i18n_1.DEFAULT_LOCALE);
    (0, react_1.useEffect)(() => {
        async_storage_1.default.getItem(LOCALE_STORAGE_KEY)
            .then((stored) => {
            if (stored === "vi" || stored === "en") {
                setLocaleState(stored);
            }
        })
            .catch(() => undefined);
    }, []);
    const setLocale = async (nextLocale) => {
        setLocaleState(nextLocale);
        await async_storage_1.default.setItem(LOCALE_STORAGE_KEY, nextLocale);
    };
    const value = (0, react_1.useMemo)(() => ({
        locale,
        setLocale,
        availableLocales: Object.keys(i18n_1.dictionaries),
        t: (key, params) => (0, i18n_1.translate)(locale, key, params),
    }), [locale]);
    return (0, jsx_runtime_1.jsx)(I18nContext.Provider, { value: value, children: children });
}
function useI18n() {
    const context = (0, react_1.useContext)(I18nContext);
    if (!context) {
        throw new Error("useI18n must be used inside I18nProvider");
    }
    return context;
}
