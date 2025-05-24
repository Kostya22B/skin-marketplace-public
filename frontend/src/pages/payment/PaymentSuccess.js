// PaymentSuccess.js
import React , {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../utils/translateUtils';
import './PaymentPages.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 7000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <div className="payment-success">
        <div className="content">
          <h1>{t('payment_success_title', language)}</h1>
          <p>{t('payment_success_text', language)} <a href="https://t.me/example">@example</a></p>
          <p>{t('payment_redirecting', language)}</p>
          <a href="/" className="button">{t('payment_back_home', language)}</a>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;