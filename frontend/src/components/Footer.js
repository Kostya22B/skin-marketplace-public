// src/components/Footer.js
import React from 'react';
import './Footer.css';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translateUtils';

const Footer = () => {
  
  const { language } = useLanguage();
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>{t('contacts', language)}:</p>
        <p>{t('contact_email', language)}: <a href="mailto:example@gmail.com">example@gmail.com</a></p>
        <p>{t('contact_telegram', language)}: <a href="https://t.me/tg_nickname" target="_blank" rel="noopener noreferrer">@tg_nickname</a></p>
      </div>
      <div className="footer-content">
        <a href="https://freekassa.com" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn.freekassa.com/banners/big-dark-1.png"
          title="Payment gateway"
          style={{width: "15%"}}></img>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
