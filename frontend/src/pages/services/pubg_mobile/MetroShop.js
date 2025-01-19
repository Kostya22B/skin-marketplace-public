// src/pages/services/pubg_mobile/MetroEscort.js
import React, { useEffect } from 'react';
import Header from '../../../components/Header';
import UnderHeader from '../../../components/UnderHeader';
import Footer from '../../../components/Footer';
import ServiceInfoCard from '../../../components/ServiceInfoCard';

function MetroShop() {
  useEffect(() => {
    window.scrollTo(0, 0); // Прокрутка страницы до начала
  }, []);

  return (
    <div className="service-page">
      <Header />
      <UnderHeader title="Metro Shop"></UnderHeader>
      <div className="services">
        
      {Array.from({ length: 11 }, (_, i) => (
        <ServiceInfoCard key={i} productId={i + 51} />
      ))}
      </div>
      <Footer />
    </div>
  );
}

export default MetroShop;
