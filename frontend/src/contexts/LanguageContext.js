// src/contexts/LanguageContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'ru';
  });

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'ru' ? 'en' : 'ru';
      localStorage.setItem('language', newLang);
      return newLang;
    });
  };

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export const getLanguage = () => localStorage.getItem('language') || 'ru';
