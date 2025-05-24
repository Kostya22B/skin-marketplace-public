// src/contexts/CurrencyContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'RUB';
  });

  const handleCurrencyChange = () => {
    const currencies = ['RUB', 'UAH', 'EUR'];
    const currentIndex = currencies.indexOf(currency);
    const nextCurrency = currencies[(currentIndex + 1) % currencies.length];
    setCurrency(nextCurrency);
    localStorage.setItem('currency', nextCurrency);
  };

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, handleCurrencyChange }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);

export const getCurrency = () => {
  return localStorage.getItem('currency') || 'RUB';
};
