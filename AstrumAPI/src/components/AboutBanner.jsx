import React from 'react';
import './AboutBanner.css';

export function AboutBanner({ ref }) {
    return (
        <section className="about-banner" ref={ref}>
            <div className="banner-content">
                <h1>О нас</h1>
                <p>
                    ASTRUM SQUAD объединение художников, стремящихся к звёздам.
                    <br />Наша задача - создать комфортный коллектив, объединенный общими мечтами и стремлениями.
                    <br />Здесь вы найдете широкий ассортимент мерча, созданного с любовью и вдохновением звезд: открытки, принты,
                    блокноты, наклейки и многое другое.
                </p>
                <button className="banner-button">Узнать больше</button>
            </div>
        </section>
    );
}

export default AboutBanner;
