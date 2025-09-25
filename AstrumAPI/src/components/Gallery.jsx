import React, { useContext, useEffect, useState } from 'react';
import './Gallery.css';
import { Link } from 'react-router-dom';
import CartContext from '../context/CartContext';

export function Gallery({ selectedCategory, searchQuery }) {
    const { addToCart } = useContext(CartContext);
    const [filteredData, setFilteredData] = useState([]);
    const [favorites, setFavorites] = useState([]);


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch("http://localhost:5000/api/favorites", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => setFavorites(data.map(p => p.productId)))
                .catch(err => console.error("Ошибка избранного:", err));
        }
    }, []);

    useEffect(() => {
        fetch('http://localhost:5000/api/products')
            .then(response => {
                if (!response.ok) throw new Error("Ошибка загрузки продуктов!");
                return response.json();
            })
            .then(data => {
                console.log("Полученные данные:", data);
                setFilteredData(data);
            })
            .catch(error => console.error("Ошибка загрузки данных:", error));
    }, []);

    const filteredProducts = filteredData.filter(item =>
        (selectedCategory ? item.categoryId === selectedCategory : true) && // Filter by category
        (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.artistName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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

    return (
        <section className="gallery">
            <div className="cards">
                {filteredProducts.map(card => (
                    <div key={card.productId} className="card">
                        <Link to={`/product/${card.productId}`} className="card-link">
                            <div className="card-image">
                                <button
                                    className={`favorite-btn ${favorites.includes(card.productId) ? 'favorited' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleFavorite(card.productId);
                                    }}
                                    aria-label={favorites.includes(card.productId) ? 'Удалить из избранного' : 'Добавить в избранное'}
                                ></button>
                                <img
                                    src={`http://localhost:5000/${card.imageUrl.startsWith('uploads/') ? card.imageUrl : 'uploads/' + card.imageUrl}`}
                                    alt={card.name}
                                />
                                <div className="card-overlay">
                                    <h3>{card.name}</h3>
                                    <small>{card.artistName.toUpperCase()}</small>
                                </div>
                            </div>

                            <strong>{card.price} BYN</strong>
                            <p className="card-description">{card.description}</p>
                            <button className="cart-button" onClick={() => addToCart(card)}>

                            </button>
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Gallery;