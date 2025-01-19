// src/pages/PaymentSuccess.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const PaymentSuccess = () => {
  // const location = useLocation();
  // const params = new URLSearchParams(location.search);
  // const orderId = params.get('orderId');
  return (
    <div className="payment-success">
      <Header />
      <div className="content">
        <h1>Оплата прошла успешно!</h1>
        <p>Спасибо за вашу покупку. В ближайшее время мы свяжемся с вами для дальнейших инструкций.</p>
        {/* {orderId && <p>Номер заказа: {orderId}</p>} */}
        <a href="/" className="button">Вернуться на главную страницу</a>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
