import './Slider.css';
import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import { formatPrice } from '../data/formatPrice';

function Slider() {
    const cardsRef = useRef(null);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/products")
            .then((res) => res.json())
            .then((data) => {
                setCards(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Ошибка загрузки товаров:", err);
                setLoading(false);
            });
    }, []);


    const toggleFavorite = async (productId) => {
        const token = localStorage.getItem("token");
        const isFavorite = favorites.includes(productId);

        const url = `http://localhost:5000/api/favorites/${productId}`;
        const method = isFavorite ? "DELETE" : "POST";

        try {
            await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setFavorites(prev =>
                isFavorite ? prev.filter(id => id !== productId) : [...prev, productId]
            );
        } catch (err) {
            console.error("Ошибка изменения избранного", err);
        }
    };
    // Плавный скролл
    const smoothScroll = (element, direction, amount, duration) => {
        let start = element.scrollLeft;
        let change = direction === 'left' ? -amount : amount;
        let currentTime = 0;
        const increment = 8;

        const animateScroll = () => {
            currentTime += increment;
            const val = easeInOutQuad(currentTime, start, change, duration);
            element.scrollLeft = val;
            if (currentTime < duration) requestAnimationFrame(animateScroll);
        };

        const easeInOutQuad = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1) return (c / 2) * t * t + b;
            t--;
            return (-c / 2) * (t * (t - 2) - 1) + b;
        };

        animateScroll();
    };

    const scrollLeft = () => {
        smoothScroll(cardsRef.current, 'left', 620, 100);
    };

    const scrollRight = () => {
        smoothScroll(cardsRef.current, 'right', 620, 100);
    };

    // Случайный выбор товаров
    const getRandomCards = (array, count) => {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    const randomCards = getRandomCards(cards, 8);

    if (loading) return <p>Загрузка товаров...</p>;
    if (!cards.length) return <p>Товары не найдены</p>;

    return (
        <section className="product-slider">
            <h2>ДРУГИЕ ТОВАРЫ</h2>
            <div className="product-slider-container">
                <button className="product-slider-button" onClick={scrollLeft}>
                    &#x276E;
                </button>

                <div className="product-slider-cards" ref={cardsRef}>
                    {randomCards.map((card) => (
                        <div key={card.productId || Math.random()} className="product-slider-card">
                            <Link to={`/product/${card.productId}`} className="product-card-link">
                                <div className="product-slider-card-image">
                                <button
                                    className={`favorite-btn ${favorites.includes(card.productId) ? 'favorited' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleFavorite(card.productId);
                                    }}
                                    aria-label={favorites.includes(card.productId) ? 'Удалить из избранного' : 'Добавить в избранное'}
                                ></button>
                               
                                    <img
                                        src={card.imageUrl ? `http://localhost:5000/${card.imageUrl.startsWith('uploads/') ? card.imageUrl : 'uploads/' + card.imageUrl}` : "/placeholder.jpg"}
                                        alt={card.name}
                                    />

                                    <div className="product-slider-card-overlay">
                                        <h3>{card.name}</h3>
                                        <small>{card.artistName}</small>
                                    </div>
                                </div>
                                <strong>{card.price} BYN</strong>
                                <p className="card-description">{card.description}</p>
                                <button className="product-slider-cart-button"></button>
                            </Link>
                        </div>
                    ))}
                </div>

                <button className="product-slider-button" onClick={scrollRight}>
                    &#x276F;
                </button>
            </div>
        </section>
    );
}

export default Slider;
