import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './GameCard.css';

const GameCard = ({ image, title, link }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="game-card">
      <Link to={link}>
        <div className="game-card-inner">
          <img 
            src={image} 
            alt={title} 
            className={`game-image ${loaded ? 'visible' : 'hidden'}`}
            onLoad={() => setLoaded(true)}
          />
          <div className="game-title">
            <h2>{title}</h2>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default GameCard;
