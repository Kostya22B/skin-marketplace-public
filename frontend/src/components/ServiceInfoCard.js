// src/components/ServiceInfoCard.js
import React, { useState, useEffect } from 'react';
import './ServiceCard.css';
import './ServiceInfoCard.css';
import { addToCart } from '../utils/cartUtils';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translateUtils';

const ServiceInfoCard = ({ productId }) => {
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currency } = useCurrency();
  const { language } = useLanguage();

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch(`/products/${productId}`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        setProductData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error getting products: ', error);
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  const price = productData ? productData[`price_${currency.toLowerCase()}`] : t('loading', language);

  const handleAddToCart = async () => {
    if (!productData) return;
    try {
      const data = await addToCart(productId, 1);
      if (!data && data.message !== 'Item added to cart') {
        throw new Error('Error adding product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  if (loading) {
    return <div>{t('loading', language)}</div>;
  }

  if (!productData) {
    return <div>{t('not_found', language)}</div>;
  }

  const name = productData[`name_${language}`] || productData.name;
  const description = productData[`description_${language}`] || productData.description;

  return (
    <div className="service-info-card">
      <div className="service-info-content">
        <h2 className="service-info-title">{name}</h2>
        <p className="service-info-description">{description}</p>
        {productData.picture && (
          <a href={productData.picture} target="_blank" rel="noopener noreferrer">
            <img
              src={productData.picture_compressed}
              alt={name}
              className="service-info-image"
            />
          </a>
        )}
        <div className="service-info-footer">
          <span className="service-info-price">{price}{currency}</span>
          <button className="info-button" style={{ maxWidth: '200px' }} onClick={handleAddToCart}>
            {t('add_to_cart', language)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceInfoCard;
