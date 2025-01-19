// src/pages/services/pubg_mobile/MetroEscort.js
import React, { useEffect } from 'react';
import Header from '../../../components/Header';
import UnderHeader from '../../../components/UnderHeader';
import Footer from '../../../components/Footer';
import ServiceInfoCard from '../../../components/ServiceInfoCard';

function Farmbot() {
  useEffect(() => {
    window.scrollTo(0, 0); // Прокрутка страницы до начала
  }, []);

  return (
    <div className="service-page">
      <Header />
      <UnderHeader title="Фармбот"></UnderHeader>
      <div className="services">
      <ServiceInfoCard productId={202} />
      <ServiceInfoCard productId={203} />
      </div>
      <Footer />
    </div>
  );
}

export default Farmbot;
