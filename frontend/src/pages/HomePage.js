// src/pages/HomePage.js
import React from 'react';
import GameCard from '../components/GameCard';
import Header from '../components/Header';
import './HomePage.css';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className='content'>
      <h1>Bufferka Shop</h1>
      <h2>Добро пожаловать на Bufferka — ваш портал в мир виртуальных возможностей! 
        Здесь вы найдёте всё, что нужно для успешной игры: внутриигровые услуги, 
        покупка игровой валюты, редкие скины и многое другое. С нами ваш игровой опыт станет ярче и увлекательнее. 
        Bufferka — ваш надёжный партнёр в мире виртуальных развлечений!</h2>
      </div>
      
      <div className="game-cards-container">
      <GameCard image="/img/rust_card.jpg" title="Rust" link="/rust" />
      <GameCard image="/img/pubg_card.jpg" title="Pubg Mobile" link="/pubg" />
      {/* <GameCard image="/img/cs_card.jpg" title="CS 2" link="/cs2" /> */}
      </div>
    </div>
  );
};

export default HomePage;