import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UnderHeader.css';

const UnderHeader = ({ title }) => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate(-1);
  };

  return (
    <div className="under-header">
      <button className="back-button" onClick={handleNavigation}>Back</button>
      <h1 className="under-title">{title}</h1>
    </div>
  );
};

export default UnderHeader;
