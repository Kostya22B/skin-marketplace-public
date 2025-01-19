// src/components/GameCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import './GameCard.css';

const GameCard = ({ image, title, link }) => {
  return (
    <div className="game-card">
      <Link to={link}>
        <div className="game-card-inner">
          <img src={image} alt={title} className="game-image" />
          <div className="game-title">{title}</div>
        </div>
      </Link>
    </div>
  );
};

export default GameCard;