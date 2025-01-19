import React, { useEffect, useState } from 'react';
import './ProfilePage.css';
import UnderHeader from '../../components/UnderHeader';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [telegramCode, setTelegramCode] = useState('');
  const [isEditingTelegramName, setIsEditingTelegramName] = useState(false);
  const [newTelegramName, setNewTelegramName] = useState('');
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    fetch('/api/user', { credentials: 'include' })
      .then(res => res.json())
      .then(userData => {
        if (userData && userData.id) {
          setUser(userData);
          setNewTelegramName(userData.telegramName || '');
          return fetch(`/orders/user/${userData.id}`, { credentials: 'include' });
        } else {
          setUser(null);
          throw new Error('User not authenticated');
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.orders) {
          setPurchases(data.orders);
        }
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        setUser(null);
      });
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Номер заказа скопирован в буфер обмена.');
      })
      .catch(err => {
        console.error('Ошибка при копировании:', err);
        alert('Не удалось скопировать номер заказа.');
      });
  };

  const handleVerifyCode = async () => {
    const response = await fetch('/api/telegram/verify-code', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: telegramCode,
        userId: user.id,
      }),
    });

    const data = await response.json();
    if (data.success) {
      alert('Telegram успешно привязан!');
      setUser({ ...user, telegramId: data.telegramId });

      await fetch('/api/telegram/notify-user', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId: data.telegramId,
        }),
      });
    } else {
      alert('Неверный код или время истекло.');
    }
  };

  const handleUpdateTelegramName = async () => {
    const response = await fetch('/api/telegram/update-telegram-name', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        telegramName: newTelegramName,
      }),
    });

    const data = await response.json();
    if (data.success) {
      alert('Telegram никнейм успешно обновлен!');
      setUser({ ...user, telegramName: newTelegramName });
      setIsEditingTelegramName(false);
    } else {
      alert('Ошибка при обновлении никнейма.');
    }
  };

  return (
    <div className="profile-page">
      <UnderHeader title="User Profile"></UnderHeader>
      <div className="profile-navigation">
        <button
          className={activeSection === 'profile' ? 'active' : ''}
          onClick={() => setActiveSection('profile')}
        >
          Профиль
        </button>
        <button
          className={activeSection === 'purchases' ? 'active' : ''}
          onClick={() => setActiveSection('purchases')}
        >
          Покупки
        </button>
      </div>
      <div className="user-purchase-content">
        {user ? (
          activeSection === 'profile' ? (
            <div className="profile-info">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Your bufferka coins:</strong> {user.coinsBalance}</p>
              <div className="telegram-section">
                <p><strong>TG nickname:</strong></p>
                {isEditingTelegramName ? (
                  <div className="telegram-input">
                    <input
                      type="text"
                      value={newTelegramName}
                      onChange={(e) => setNewTelegramName(e.target.value)}
                    />
                    <button onClick={handleUpdateTelegramName}>Сохранить</button>
                  </div>
                ) : (
                  <div className="telegram-input">
                    <span>{user.telegramName || 'Не указан'}</span>
                    <button onClick={() => setIsEditingTelegramName(true)}>Изменить</button>
                  </div>
                )}
              </div>
              {user.telegramId ? (
                <p><strong>Telegram ID:</strong> {user.telegramId}</p>
              ) : (
                <div className="telegram-section">
                  <a href="/" target="_blank" rel="noopener noreferrer">
                    Перейти в Telegram
                  </a>
                  <div className="telegram-input">
                    <input
                      type="text"
                      placeholder="Введите код из Telegram"
                      value={telegramCode}
                      onChange={(e) => setTelegramCode(e.target.value)}
                    />
                    <button onClick={handleVerifyCode}>Подтвердить</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="user-purchases">
              <h2>Мои покупки</h2>
              {purchases.length > 0 ? (
                <div className="purchases-container">
                  {purchases.map(purchase => (
                    <div key={purchase.id} className="purchase-card">
                      <div className="purchase-header">
                        <p><strong>Order ID:</strong> {purchase.id}</p>
                        <button className="copy-id-button" onClick={() => copyToClipboard(purchase.id)}></button>
                      </div>
                      <div className="purchase-content">
                        <p><strong>Товары:</strong></p>
                        <ul>
                          {purchase.items.map((item, index) => (
                            <li key={index}>
                              <strong>{item.name}</strong>
                              (x{item.quantity}) - {item.status}
                            </li>
                          ))}
                        </ul>
                        {purchase.coupon && (
                          <p>
                            <strong>Применен купон:</strong> {purchase.coupon.code} (-{purchase.coupon.discountValue}%)
                          </p>
                        )}
                        <p><strong>Всего:</strong> {purchase.total} {purchase.currency}</p>
                        <p><strong>Состояние покупки:</strong> {purchase.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No purchases yet.</p>
              )}
            </div>
          )
        ) : (
          <p>Please log in to view your profile.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;