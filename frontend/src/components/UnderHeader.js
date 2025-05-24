import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UnderHeader.css';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translateUtils';

const UnderHeader = ({ title }) => {
  const navigate = useNavigate();

  const { language } = useLanguage();

  const handleNavigation = () => {
    navigate(-1);
  };

  return (
    <div className="under-header">
      <button className="back-button" onClick={handleNavigation}>{t('back_button', language)}</button>
      <h1 className="under-title">{title}</h1>
    </div>
  );
};

export default UnderHeader;
