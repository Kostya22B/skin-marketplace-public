// src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import GameCard from '../components/GameCard';
import './HomePage.css';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translateUtils';


const HomePage = () => {

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchActiveShops = async () => {
      try {
        const response = await fetch('/user/shops/getActive');
        if (!response.ok) {
          throw new Error('Error getting active shops');
        }
        const data = await response.json();
        setShops(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveShops();
  }, []);

  return (
    <div className="home-page">
      <div className='content'>
        <h1>Bufferka Shop</h1>
        <h2>{t('welcome', language)}</h2>
        <p>{t('subtext', language)}</p>
      </div>

      <div className="game-cards-container">
        {loading ? (
          <div>{t('loading', language)}</div>
        ) : (
          shops.map(shop => (
            <GameCard
              key={shop.id}
              image={shop.picture || '/img/default_shop.jpg'}
              title={shop[`name_${language}`] || shop.name}
              link={`/${shop.nameLink}`}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;