// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import RustPage from './pages/RustPage';
import PubgPage from './pages/PubgPage';
import CartPage from './pages/CartPage';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentFailure from './pages/payment/PaymentFailure';
import MetroEscort from './pages/services/pubg_mobile/MetroEscort';
import MetroShop from './pages/services/pubg_mobile/MetroShop';
import UcShop from './pages/services/pubg_mobile/UcShop';
import SkinShop from './pages/services/rust/SkinShop';
import RaidHelper from './pages/services/rust/RaidHelper';
import Farmbot from './pages/services/rust/Farmbot';
import NightGuard from './pages/services/rust/NightGuard';
import TwitchDrops from './pages/services/rust/TwitchDrops';
import ProfilePage from './pages/profile/ProfilePage';
import { CurrencyProvider } from './contexts/CurrencyContext';


function App() {
  
  return (
    <CurrencyProvider>
    <Router>
      {/* <Header currentCurrency={currency} onCurrencyChange={handleCurrencyChange} /> */}
      <Routes>
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/rust" element={<MainLayout><RustPage /></MainLayout>} />
          <Route path="/rust/skin-shop" Component={SkinShop} />
          <Route path="/rust/raid-helper" Component={RaidHelper} />
          <Route path="/rust/farmbot" Component={Farmbot} />
          <Route path="/rust/night-guard" Component={NightGuard} />
          <Route path="/rust/twitch-drops" Component={TwitchDrops} />
        <Route path="/pubg" element={<MainLayout><PubgPage /></MainLayout>} />
        <Route path="/user-cart" element={<MainLayout><CartPage /></MainLayout>} />
          <Route path="/pubg/escort-metro" Component={MetroEscort} />
          <Route path="/pubg/metro-shop" Component={MetroShop} />
          <Route path="/pubg/uc-shop" Component={UcShop} />

          <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />

          <Route path="/payment/success" element={<PaymentSuccess/>} />
          <Route path="/payment/failure" element={<PaymentFailure/>} />
      </Routes>
    </Router>
    </CurrencyProvider>

  );
}

export default App;