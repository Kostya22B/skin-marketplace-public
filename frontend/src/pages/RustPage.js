// src/pages/RustPage.js
import React, {useEffect} from 'react';
import Header from '../components/Header';
import ServiceCard from '../components/ServiceCard';
import UnderHeader from '../components/UnderHeader';
import Footer from '../components/Footer';

function RustPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="service-page">
      <UnderHeader 
      title="Rust Services">

      </UnderHeader>
      <div className="services">
        <ServiceCard
        image="/img/rust/rust_skins.jpg"
        title="Приобретение скинов"
        description="У нас вы можете купить или продать любые скины по выгодной цене.
            Услуга осуществляются для любого региона мира. Способ оплаты: договорной"
            link="/rust/skin-shop"
      />
      <ServiceCard
        image="/img/rust/rust_raid.jpg"
        title="Помощь с рейдами"
        description="Хотите зарейдить клан или надоедливых соседей, но они превосходят вас числом? Не проблема.
            С услугой 'Помощь с рейдами'."
            link="/rust/raid-helper"
      />
      <ServiceCard
        image="/img/rust/rust_farm.jpg"
        title="Фармбот на час"
        description="Конечно не 'Жена на час', но полные руды и компонентов 
            сундуки гарантированы. Также может ходить и фармить с вами, что будет даже веселее"
            link="/rust/farmbot"
      />
      <ServiceCard
        image="/img/rust/rust_night_guard.jpg"
        title="Ночной охранник/Электрик"
        description="Lorem Ipsum"
            link="/rust/night-guard"
      />
      <ServiceCard
        image="/img/rust/rust_twitch_drops.jpg"
        title="Twitch drops"
        description="Lorem Ipsum"
            link="/rust/twitch-drops"
      />
      </div>
    </div>
  );
}

export default RustPage;