import React from 'react';
import './Hero.css'; 

export function Hero() {
    return (
        <section className="hero">
            <img src={process.env.PUBLIC_URL + '/Banner.png'} alt="Astrum Banner" />
        </section>
    );
}

export default Hero;