// src/utils/translate.js
import ru from '../locales/ru.json';
import en from '../locales/en.json';

const translations = { ru, en };

export const t = (key, lang) => {
  return translations[lang]?.[key] || key;
};