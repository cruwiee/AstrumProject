import React from "react";
import { Link } from "react-router-dom"; // Import Link
import "./AboutBanner.css";

export function AboutBanner({ ref }) {
    return (
        <section className="about-banner" ref={ref}>
            <div className="banner-content">
                <h1>О нас</h1>
                <p>
                    ASTRUM SQUAD — объединение художников, стремящихся к звёздам.
                    <br />Наша задача — создать комфортный коллектив, объединённый общими мечтами и стремлениями.
                    <br />Здесь вы найдёте широкий ассортимент мерча, созданного с любовью и вдохновением звёзд: открытки, принты,
                    блокноты, наклейки и многое другое.
                </p>
                <Link to="/portfolio" className="banner-button">
                    Узнать больше
                </Link>
            </div>
        </section>
    );
}

export default AboutBanner;