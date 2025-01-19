// src/pages/services/pubg_mobile/MetroEscort.js
import React, { useEffect } from 'react';
import Header from '../../../components/Header';
import UnderHeader from '../../../components/UnderHeader';
import Footer from '../../../components/Footer';
import ServiceInfoCard from '../../../components/ServiceInfoCard';

function SkinShop() {
  useEffect(() => {
    window.scrollTo(0, 0); // Прокрутка страницы до начала
  }, []);

  return (
    <div className="service-page">
      <Header />
      <UnderHeader title="Skin shop"></UnderHeader>
      <h2 class="under-title">Тут продаются сразу готовые скины сетов. Их описание будет позднее. 
        Они дешевле чем официальные скины от игры, однако имеют схожую степень маскировки</h2>
      <div className="services">
      {Array.from({ length: 4 }, (_, i) => (
        <ServiceInfoCard key={i} productId={i + 250} />
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <ServiceInfoCard key={i} productId={i + 260} />
      ))}
      </div>
      <Footer />
    </div>
  );
}

export default SkinShop;
