"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_LOCALE = exports.dictionaries = void 0;
exports.translate = translate;
exports.getLocaleLabel = getLocaleLabel;
const en_1 = __importDefault(require("./locales/en"));
const vi_1 = __importDefault(require("./locales/vi"));
exports.dictionaries = {
    vi: vi_1.default,
    en: en_1.default,
};
exports.DEFAULT_LOCALE = "vi";
function readPath(source, path) {
    return path.split(".").reduce((current, segment) => {
        if (current && typeof current === "object" && segment in current) {
            return current[segment];
        }
        return undefined;
    }, source);
}
function interpolate(template, params) {
    if (!params) {
        return template;
    }
    return template.replace(/\{\{(.*?)\}\}/g, (_, rawKey) => {
        const key = rawKey.trim();
        const value = params[key];
        return value === undefined || value === null ? "" : String(value);
    });
}
function translate(locale, key, params) {
    const exact = readPath(exports.dictionaries[locale], key);
    const fallback = readPath(exports.dictionaries[exports.DEFAULT_LOCALE], key);
    const value = typeof exact === "string" ? exact : typeof fallback === "string" ? fallback : key;
    return interpolate(value, params);
}
function getLocaleLabel(locale) {
    return translate(locale, locale === "vi" ? "language.vietnamese" : "language.english");
}
