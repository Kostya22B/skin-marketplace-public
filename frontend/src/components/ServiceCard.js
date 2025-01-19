// src/components/ServiceCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import './ServiceCard.css';

const ServiceCard = ({ image, title, description, link }) => {
  return (
    <div className="service-card">
      
        <img src={image} alt={title} className="service-image" />
        <div className="service-title">{title}</div>
        <div className="service-description">{description}</div>
      <div className="price-button-wrap">
      <Link to={link} className="link-button">
        <button className="info-button">
          {/* <img alt="" src="/img/info_icon.png" className='info-icon'></img> */}
          <div className='service-info'> More info</div>
        </button>
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;
