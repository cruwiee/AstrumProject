import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Footer.css';

export function Footer({ onAboutClick }) {
  const navigate = useNavigate();

  const handleAboutClick = () => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => onAboutClick(), 100);
    } else {
      onAboutClick();
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <h1>АSTRUM</h1>
        <div className="footer-socials">
          <a href="https://t.me/astrumsquad" target="_blank" rel="noopener noreferrer">
            <img src="/telegram.png" alt="Telegram" className="social-icon" />
          </a>
          <a href="https://www.tiktok.com/@astrumsquad" target="_blank" rel="noopener noreferrer">
            <img src="/tik-tok.png" alt="TikTok" className="social-icon" />
          </a>
        </div>

        <div className="footer-links">
          <button onClick={handleAboutClick} className="footer-link" aria-label="О нас">
            О НАС
          </button>
          <Link to="/" className="footer-link" aria-label="Каталог">
            КАТАЛОГ
          </Link>
          <Link to="/help" className="footer-link" aria-label="Помощь">
            ПОМОЩЬ
          </Link>
          <Link to="/policy" className="footer-link" aria-label="Политика">
            ПОЛИТИКА
          </Link>
        </div>
        <hr />
        <Link
          to="/personal-data"
          className="footer-link"
          aria-label="Обработка персональных данных"
        >
          Обработка персональных данных
        </Link>
        <Link
          to="/privacy-policy"
          className="footer-link"
          aria-label="Политика конфиденциальности"
        >
          Политика конфиденциальности
        </Link>
        <Link to="/contact" className="footer-link" aria-label="Обратная связь">
          Обратная связь
        </Link>
      </div>
    </footer>
  );
}

export default Footer;