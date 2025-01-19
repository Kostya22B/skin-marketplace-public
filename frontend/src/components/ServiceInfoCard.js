// src/components/ServiceInfoCard.js
import React, { useState, useEffect } from 'react';
import './ServiceCard.css';
import './ServiceInfoCard.css';
import { addToCart } from '../utils/cartUtils';
import { useCurrency } from '../contexts/CurrencyContext';

const ServiceInfoCard = ({ productId, currentCurrency }) => {
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currency } = useCurrency();


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
      console.error('Ошибка при загрузке данных о товаре:', error);
      setLoading(false);
    }
  };

  fetchProductData();
}, [productId]);
const price = productData ? productData[`price_${currency.toLowerCase()}`] : 'Цена недоступна';

const handleAddToCart = async () => {
  if (!productData) return;
  try {
    const data = await addToCart(productId, 1);
    if (data && data.message === 'Item added to cart') {
      alert(`Товар "${productData.name}" успешно добавлен в корзину!`);
    } else {
      throw new Error('Произошла ошибка при добавлении товара.');
    }
  } catch (error) {
    console.error('Ошибка при добавлении товара:', error);
    alert('Произошла ошибка при добавлении товара.');
  }
};



  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!productData) {
    return <div>Товар не найден.</div>;
  }
  
  return (
    <div className="service-info-card">
      <div className="service-info-content">
        <h2 className="service-info-title">{productData.name}</h2>
        <p className="service-info-description">{productData.description}</p>
        {productData.picture && (
        <a href={productData.picture} target="_blank" rel="noopener noreferrer">
          <img
            src={productData.picture_compressed}
            alt={`${productData.name}`}
            className="service-info-image"
          />
        </a>
      )}
        <div className="service-info-footer">
        <span className="service-info-price">{price}{currency}</span>
          <button className="info-button" style={{ maxWidth: '200px' }} onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceInfoCard;
