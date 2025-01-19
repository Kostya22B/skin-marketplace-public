import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';

const Header = () => {
  const { currency, handleCurrencyChange } = useCurrency();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    fetch('/api/user', {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.email) {
          setIsAuthenticated(true);
          setUser(data);
        }
        else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, []);


  const handleLogout = () => {
    fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
      .then(() => {
        setIsAuthenticated(false);
        setUser(null);
        navigate("/")
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
          <img src="/logo.png" alt="MyLogo" className="logo-image" />
          <span className="logo-text">Bufferka Shop</span>
        </a>
      </div>
      <div className="auth-buttons">
      <button onClick={handleCurrencyChange} className="currency-toggle">
        {currency}
      </button>
        {isAuthenticated ? (
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
            <button className="login_button" onClick={handleLogout}>
            Log out
          </button>
          </>
        ) : (
          <button className="login_button" onClick={handleLogin}>
            Log in
          </button>
        )}
      </div>

    </header>
  );
};

export default Header;