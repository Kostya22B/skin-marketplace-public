import React, { useState} from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { VscSettings } from "react-icons/vsc";
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translateUtils';


const Header = ({ user, isAuthenticated }) => {
  const { currency, handleCurrencyChange } = useCurrency();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();


  const handleLogout = () => {
    fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
      .then(() => {
        navigate("/");
        window.location.reload();
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  };

  const handleLogin = () => {
    window.location.href = '/auth/login';
  };

  return (
    <header className="header">
      <div className="logo">
        <a href="/" className="logo-link">
          <img src="/logo.webp" alt="MyLogo" className="logo-image" />
          <span className="logo-text">Bufferka Shop</span>
        </a>
      </div>
      <div className="auth-buttons">
        <button onClick={toggleLanguage} className="currency-toggle">
          {t('language', language)}
        </button>

        <button onClick={handleCurrencyChange} className="currency-toggle">
          {currency}
        </button>
        {isAuthenticated ? (
          user?.role === 'admin' ? (
            <><Link to="/adminpanel/shop-preferences">
              <VscSettings style={{ color: 'white', width: '4vh', height: '4vh' }} />
            </Link>
              <Link to="/adminpanel/work-panel">
                <img
                  src={user?.picture}
                  alt="Admin Profile"
                  className="profile-photo" />
              </Link></>
          ) : (
            <>
              <Link to="/user-cart">
                <img
                  src="/img/cart_icon_white.png"
                  height="30px"
                  alt="cart"
                  className="cart-photo"
                />
              </Link>
              <Link to="/profile" state={{ user }}>
                <img
                  src={user?.picture}
                  alt="User Profile"
                  className="profile-photo"
                />
              </Link>
            </>
          )
        ) : (
          <button className="login_button" onClick={handleLogin}>
            {t('login', language)} 
            <img src="/img/buttons/google_auth_button.png"
            height="20px"
            />
          </button>
        )}
        {isAuthenticated && (
          <button className="login_button" onClick={handleLogout}>
            {t('logout', language)}
          </button>
        )}
      </div>

    </header>
  );
};

export default Header;