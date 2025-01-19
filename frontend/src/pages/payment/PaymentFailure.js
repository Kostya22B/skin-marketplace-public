// src/pages/PaymentFailure.js
import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const PaymentFailure = () => {
  return (
    <div className="payment-failure">
      <Header />
      <div className="content">
        <h1>Оплата не прошла</h1>
        <p>К сожалению, оплата не была завершена. Попробуйте еще раз или свяжитесь с нашей поддержкой.</p>
        <a href="/" className="button">Вернуться на главную страницу</a>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentFailure;
