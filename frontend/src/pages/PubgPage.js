// src/pages/RustPage.js
import React, {useEffect} from 'react';
import Header from '../components/Header';
import ServiceCard from '../components/ServiceCard';
import UnderHeader from '../components/UnderHeader';
import Footer from '../components/Footer';

function PubgPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="service-page">
      <UnderHeader 
      title="Pubg Services">

      </UnderHeader>
      <div className="services">
      <ServiceCard
  image="/img/pubg_mobile/pubg_mobile_escort.jpg"
  title="Эскорт Метро"
  description="Lorem Ipsum"
  link="/pubg/escort-metro"
/>
<ServiceCard
  image="/img/pubg_mobile/pubg_mobile_metro_shop.jpg"
  title="Метро Шоп"
  description="Lorem ipsum"
  link="/pubg/metro-shop"
/>
<ServiceCard
  image="/img/pubg_mobile/pubg_mobile_uc_shop.jpg"
  title="Uc Shop"
  description="Lorem Ipsum"
  link="/pubg/uc-shop"
/>

      
      </div>
    </div>
    
  );
}

export default PubgPage;