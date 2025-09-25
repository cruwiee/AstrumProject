import React, { useRef, useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';
import './Slider.css';

function Slider() {
  const cardsRef = useRef(null);
  const { addToCart, user, token } = useContext(CartContext);
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [reviewsMap, setReviewsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const headers = token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };

    const fetchFavorites = async () => {
      if (!token) {
        setFavorites([]);
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/api/favorites', { headers });
        if (!response.ok) throw new Error('Ошибка загрузки избранного');
        const data = await response.json();
        setFavorites(data.map((p) => p.productId));
      } catch (err) {
        console.error('Ошибка загрузки избранного:', err);
        toast.error('Не удалось загрузить избранное');
      }
    };

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/products', { headers });
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
        setCards(data);
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
    fetchProducts();
  }, [token]);

  useEffect(() => {
    const fetchReviewsForProducts = async () => {
      try {
        const newReviewsMap = {};
        await Promise.all(
          cards.map(async (product) => {
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
  }, [cards]);

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
    if (cardsRef.current) {
      smoothScroll(cardsRef.current, 'left', 620, 100);
    }
  };

  const scrollRight = () => {
    if (cardsRef.current) {
      smoothScroll(cardsRef.current, 'right', 620, 100);
    }
  };

  const getRandomCards = (array, count) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  };

  const randomCards = getRandomCards(cards, 8);

  if (loading) {
    return <div className="loading">Загрузка товаров...</div>;
  }

  if (error) {
    return <div className="error">Ошибка: {error}</div>;
  }

  if (randomCards.length === 0) {
    return <div className="no-products">Товары не найдены</div>;
  }

  return (
    <section className="product-slider">
      <h2>ДРУГИЕ ТОВАРЫ</h2>
      <div className="product-slider-container">
        <button className="product-slider-button" onClick={scrollLeft} aria-label="Прокрутить влево">
          ❮
        </button>
        <div className="product-slider-cards" ref={cardsRef}>
          {randomCards.map((card) => {
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
                    ></button>
                    <img
                      src={`http://localhost:5000/${card.imageUrl}`}
                      alt={card.name || 'Товар'}
                      onError={(e) => {
                        e.target.src = 'http://localhost:5000/Uploads/placeholder.jpg';
                      }}
                    />
                    <div className="card-overlay">
                      <h3>{card.name}</h3>
                      <small>{card.artistName?.toUpperCase() || 'НЕИЗВЕСТНО'}</small>
                    </div>
                  </div>
                  <div className="price-rating-row">
                    <strong>{card.price} BYN</strong>
                    <div className="product-rating">
                      {renderSingleStar(avgRating, card.productId, reviews.length)}
                    </div>
                  </div>
                  <p className="card-description">{card.description || 'Без описания'}</p>
                </Link>
                <button
                  className="cart-button"
                  onClick={() => handleAddToCart(card)}
                  aria-label="Добавить в корзину"
                ></button>
              </div>
            );
          })}
        </div>
        <button className="product-slider-button" onClick={scrollRight} aria-label="Прокрутить вправо">
          ❯
        </button>
      </div>
    </section>
  );
}

export default Slider;