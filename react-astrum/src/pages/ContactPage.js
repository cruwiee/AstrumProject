import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ContactPage.css';

function ContactPage({ onAboutClick, onSearchToggle, searchQuery, setSearchQuery }) {
  return (
    <div className="contact-page">
      <Header
        onAboutClick={onAboutClick}
        onSearchToggle={onSearchToggle}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <main className="main-content">
       
        <section className="content">
             <h1>Обратная связь</h1>
          <p>
            Мы ценим ваше мнение и готовы ответить на любые вопросы, связанные с покупками, заказами или работой нашего сайта. Свяжитесь с нами, используя указанные ниже контактные данные.
          </p>
          <h2>Контактная информация</h2>
          <p>
            Email: <a href="mailto:support@astrum.by">support@astrum.by</a>
            <br />
            Телефон: <a href="tel:+375291234567">+375 (29) 123-45-67</a>
            <br />
            Адрес: г. Минск, ул. Примерная, д. 123
          </p>
          <p>
            Для вопросов, связанных с заказами, пожалуйста, укажите номер заказа в вашем сообщении, чтобы мы могли оперативно вам помочь.
          </p>
        </section>
      </main>
      {}
    </div>
  );
}

export default ContactPage;