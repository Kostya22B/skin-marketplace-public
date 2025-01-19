// src/pages/services/pubg_mobile/MetroEscort.js
import React, { useEffect } from 'react';
import Header from '../../../components/Header';
import UnderHeader from '../../../components/UnderHeader';
import Footer from '../../../components/Footer';
import ServiceInfoCard from '../../../components/ServiceInfoCard';

function RaidHelper() {
  useEffect(() => {
    window.scrollTo(0, 0); // Прокрутка страницы до начала
  }, []);

  return (
    <div className="service-page">
      <Header />
      <UnderHeader title="Помощь с рейдами"></UnderHeader>
      <div className="services">
      <ServiceInfoCard productId={201} />
      </div>
      <Footer />
    </div>
  );
}

export default RaidHelper;
