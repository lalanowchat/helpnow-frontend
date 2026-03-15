import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enJSON from "./locales/en/translation.json";
import esJSON from "./locales/es/translation.json";
import koJSON from "./locales/ko/translation.json";
import zhJSON from "./locales/zh/translation.json";
import jaJSON from "./locales/ja/translation.json";
import ruJSON from "./locales/ru/translation.json";
import arJSON from "./locales/ar/translation.json";
import frJSON from "./locales/fr/translation.json";
import hiJSON from "./locales/hi/translation.json";
import itJSON from "./locales/it/translation.json";
import deJSON from "./locales/de/translation.json";
import nlJSON from "./locales/nl/translation.json";
import viJSON from "./locales/vi/translation.json";
import tlJSON from "./locales/tl/translation.json";
import hyJSON from "./locales/hy/translation.json";
import faJSON from "./locales/fa/translation.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enJSON },
    es: { translation: esJSON },
    ko: { translation: koJSON },
    zh: { translation: zhJSON },
    ja: { translation: jaJSON },
    ru: { translation: ruJSON },
    ar: { translation: arJSON },
    fr: { translation: frJSON },
    hi: { translation: hiJSON },
    it: { translation: itJSON },
    de: { translation: deJSON },
    nl: { translation: nlJSON },
    vi: { translation: viJSON },
    tl: { translation: tlJSON },
    hy: { translation: hyJSON },
    fa: { translation: faJSON },
  },
  lng: "en", // Default language
  fallbackLng: "en", // Fallback language
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;
