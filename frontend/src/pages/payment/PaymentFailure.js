// src/pages/PaymentFailure.js
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../utils/translateUtils';
import './PaymentPages.css';

const PaymentFailure = () => {
  const { language } = useLanguage();

  return (
    <>
      <div className="payment-failure">
        <div className="content">
          <img src="/img/icons/failure.png" alt="failure" className="status-icon" />
          <h1>{t('payment_failed_title', language)}</h1>
          <p>{t('payment_failed_text', language)}</p>
          <a href="/" className="button">{t('payment_back_home', language)}</a>
        </div>
      </div>
    </>
  );
};

export default PaymentFailure;
