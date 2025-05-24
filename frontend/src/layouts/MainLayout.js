// src/layouts/MainLayout.js
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Toaster } from 'sonner';

const MainLayout = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch('/api/user', {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.email) {
          setIsAuthenticated(true);
          setUser(data);
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  return (
    <>
      <Header user={user} isAuthenticated={isAuthenticated} />
      <Toaster richColors position="top-center" style={{ zIndex: 1000 }} />
      {children}
      <Footer />
    </>
  );
};

export default MainLayout;
