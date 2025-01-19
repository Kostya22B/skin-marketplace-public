// src/components/Footer.js
import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>Контакты:</p>
        <p>Email: <a href="mailto:buferkateam@gmail.com">example@gmail.com</a></p>
        <p>Telegram: <a href="" target="_blank" rel="noopener noreferrer">@example</a></p>
      </div>
      <div className="footer-content">
        <a href="https://freekassa.com" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn.freekassa.com/banners/big-dark-1.png" title="Прием платежей"></img>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
