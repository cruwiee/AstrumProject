// src/components/Footer.js
import React from 'react';
import './Footer.css'; // Создайте этот файл для стилей

export function Footer ()  {
    return (
        <footer className="footer">
            <div className="footer-content">
                <h1>АSTRUM</h1>
                <div className="footer-socials">
                    <a href="https://t.me/astrumsquad" target="_blank" rel="noopener noreferrer">
                        <img src="/telegram.png" alt="Telegram" className="social-icon" />
                    </a>
                    <a href="https://www.tiktok.com/@astrumsquad" target="_blank" rel="noopener noreferrer">
                        <img src="/tik-tok.png" alt="Tik-tok" className="social-icon" />
                    </a>
                </div>

                <div className="footer-links">
                    <a href="#about-banner" className="footer-link">О НАС</a>
                    <a href="#" className="footer-link">КАТАЛОГ</a>
                    <a href="#" className="footer-link">ПОМОЩЬ</a>
                    <a href="#" className="footer-link">ПОЛИТИКА</a>
                    <a href="#" className="footer-link">ФОРУМ</a>
                </div>
                <hr></hr>
                <p className="additional-text">Обработка персональных данных</p>
                <p className="additional-text">Политика конфиденциальности</p>
                <p className="additional-text">Обратная связь</p>
            </div>
        </footer>
    )
}

export default Footer;