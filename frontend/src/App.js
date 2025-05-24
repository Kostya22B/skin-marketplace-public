// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentFailure from './pages/payment/PaymentFailure';
import ShopPage from './pages/ShopPage';
import CategoryPage from './pages/CategoryPage';
import ProfilePage from './pages/profile/ProfilePage';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { LanguageProvider } from './contexts/LanguageContext';
import AdminPanelPage from './pages/admin_pages/AdminPanelPage';
import AdminShopManagementPage from './pages/admin_pages/AdminShopManagementPage';

function App() {
  return (
    <CurrencyProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
            <Route path="/user-cart" element={<MainLayout><CartPage /></MainLayout>} />
            <Route path="/:shopLink" element={<MainLayout><ShopPage /></MainLayout>} />
            <Route path="/:shopLink/:categoryLink" element={<MainLayout><CategoryPage /></MainLayout>} />
            <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
            <Route path="/payment/success" element={<MainLayout><PaymentSuccess /></MainLayout>} />
            <Route path="/payment/failure" element={<MainLayout><PaymentFailure /></MainLayout>} />
            {/* admin */}
            <Route path="/adminpanel/work-panel" element={<MainLayout><AdminPanelPage /></MainLayout>} />
            <Route path="/adminpanel/shop-preferences" element={<MainLayout><AdminShopManagementPage /></MainLayout>} />
          </Routes>
        </Router>
      </LanguageProvider>
    </CurrencyProvider>
  );
}

export default App;
