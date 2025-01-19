import React, { createContext, useState, useContext } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('RUB');

  const handleCurrencyChange = () => {
    const currencies = ['EUR', 'RUB', 'UAH'];
    const currentIndex = currencies.indexOf(currency);
    const nextCurrency = currencies[(currentIndex + 1) % currencies.length];
    setCurrency(nextCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, handleCurrencyChange }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
