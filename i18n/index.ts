import en from "./locales/en";
import vi from "./locales/vi";

export const dictionaries = {
  vi,
  en,
} as const;

export type Locale = keyof typeof dictionaries;
export const DEFAULT_LOCALE: Locale = "vi";

function readPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, source);
}

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) {
    return template;
  }

  return template.replace(/\{\{(.*?)\}\}/g, (_, rawKey: string) => {
    const key = rawKey.trim();
    const value = params[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
) {
  const exact = readPath(dictionaries[locale], key);
  const fallback = readPath(dictionaries[DEFAULT_LOCALE], key);
  const value = typeof exact === "string" ? exact : typeof fallback === "string" ? fallback : key;
  return interpolate(value, params);
}

export function getLocaleLabel(locale: Locale) {
  return translate(locale, locale === "vi" ? "language.vietnamese" : "language.english");
}
