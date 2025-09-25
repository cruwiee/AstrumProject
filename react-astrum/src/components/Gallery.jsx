import React, { useContext, useEffect, useState } from 'react';
import './Gallery.css';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';

export function Gallery({ selectedCategory, searchQuery }) {
  const { addToCart, user, token } = useContext(CartContext);
  const navigate = useNavigate();
  const [filteredData, setFilteredData] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setFavorites([]);
      return;
    }

    const fetchFavorites = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/favorites', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Ошибка загрузки избранного');
        const data = await response.json();
        setFavorites(data.map((p) => p.productId));
      } catch (err) {
        console.error('Ошибка избранного:', err);
        toast.error('Не удалось загрузить избранное');
      }
    };

    fetchFavorites();
  }, [token]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/products', {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!response.ok) {
          let errorMessage = `Ошибка загрузки продуктов: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.details || errorData.error || errorMessage;
          } catch {
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        const data = await response.json();
        setFilteredData(data);
        setError(null);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [token]);

  const [reviewsMap, setReviewsMap] = useState({});

  useEffect(() => {
    const fetchReviewsForProducts = async () => {
      try {
        const newReviewsMap = {};
        await Promise.all(
          filteredData.map(async (product) => {
            const response = await fetch(`http://localhost:5000/api/review/${product.productId}`);
            if (response.ok) {
              const reviews = await response.json();
              newReviewsMap[product.productId] = reviews;
            } else {
              newReviewsMap[product.productId] = [];
            }
          })
        );
        setReviewsMap(newReviewsMap);
      } catch (err) {
        console.error('Ошибка загрузки отзывов:', err);
      }
    };

    fetchReviewsForProducts();
  }, [filteredData]);

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  const renderSingleStar = (rating, productId, reviewsLength) => {
    const percentage = (rating / 5) * 100;
    return (
      <div className="single-star-container">
        <svg className="star-icon single" viewBox="0 0 100 100" width="20" height="20" aria-hidden="true">
          <defs>
            <clipPath id={`star-clip-${productId}`}>
              <rect x="0" y="0" width={`${percentage}%`} height="100%" />
            </clipPath>
          </defs>
          <polygon
            className="star-shape empty"
            points="50,5 58,42 95,50 58,58 50,95 42,58 5,50 42,42"
          />
          <polygon
            className="star-shape filled"
            points="50,5 58,42 95,50 58,58 50,95 42,58 5,50 42,42"
            clipPath={`url(#star-clip-${productId})`}
          />
        </svg>
        <span className="rating-value">
          {rating > 0 ? `${rating} (${reviewsLength})` : 'Нет отзывов'}
        </span>
      </div>
    );
  };

  const filteredProducts = filteredData.filter(
    (item) =>
      (selectedCategory ? item.categoryId === selectedCategory : true) &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.artistName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleFavorite = async (productId) => {
    if (!token) {
      toast.error('Пожалуйста, войдите в систему для управления избранным');
      navigate('/login');
      return;
    }

    const isFavorite = favorites.includes(productId);
    const url = `http://localhost:5000/api/favorites/${productId}`;
    const method = isFavorite ? 'DELETE' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Ошибка изменения избранного');
      setFavorites((prev) =>
        isFavorite ? prev.filter((id) => id !== productId) : [...prev, productId]
      );
      toast.success(isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное');
    } catch (err) {
      console.error('Ошибка изменения избранного:', err);
      toast.error('Ошибка при обновлении избранного');
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      toast.error('Вы должны войти в систему для добавления товара в корзину.');
      navigate('/login');
      return;
    }

    try {
      await addToCart(user.userId, product.productId, 1);
      toast.success('Товар добавлен в корзину!');
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
      toast.error('Ошибка при добавлении товара в корзину.');
    }
  };

  if (loading) {
    return <div className="loading">Загрузка товаров...</div>;
  }

  if (error) {
    return <div className="error">Ошибка: {error}</div>;
  }

  return (
    <section className="gallery">
      <div className="cards">
        {filteredProducts.length === 0 ? (
          <p>Товары не найдены</p>
        ) : (
          filteredProducts.map((card) => {
            const reviews = reviewsMap[card.productId] || [];
            const avgRating = calculateAverageRating(reviews);

            return (
              <div key={card.productId} className="card">
                <Link to={`/product/${card.productId}`} className="card-link">
                  <div className="card-image">
                    <button
                      className={`favorite-btn ${favorites.includes(card.productId) ? 'favorited' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(card.productId);
                      }}
                      aria-label={
                        favorites.includes(card.productId)
                          ? 'Удалить из избранного'
                          : 'Добавить в избранное'
                      }
                    >
                      {favorites.includes(card.productId) ? '' : ''}
                    </button>
                    <img
                      src={`http://localhost:5000/${card.imageUrl}`}
                      alt={card.name}
                      onError={(e) => {
                        e.target.src = 'http://localhost:5000/Uploads/placeholder.jpg';
                      }}
                    />
                    <div className="card-overlay">
                      <h3>{card.name}</h3>
                      <small>{card.artistName.toUpperCase()}</small>
                    </div>
                  </div>
                  <strong>{card.price} BYN</strong>

                  <p className="card-description">{card.description}</p>
                  <div className="product-rating">{renderSingleStar(avgRating, card.productId, reviews.length)}</div>




                </Link>


                <button className="cart-button" onClick={() => handleAddToCart(card)}>

                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default Gallery;
