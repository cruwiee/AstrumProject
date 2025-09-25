import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';
import './ProductDetalis.css';
import ErrorBoundary from './ErrorBoundary.jsx';

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, token, addToCart } = useContext(CartContext);
  const userId = user ? user.userId : null;
  const [product, setProduct] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = token
          ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          : { 'Content-Type': 'application/json' };

        const productResponse = await fetch(`http://localhost:5000/api/products/${productId}`, { headers });

        if (productResponse.status === 404) {
          setError('Товар не найден');
          setProduct(null);
          return;
        }

        if (!productResponse.ok) {
          let errorMessage = `Ошибка загрузки товара: ${productResponse.status}`;
          try {
            const errorData = await productResponse.json();
            errorMessage = errorData.details || errorData.error || errorMessage;
          } catch {
            errorMessage = productResponse.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const productData = await productResponse.json();
        setProduct(productData);

        if (token) {
          const favoritesResponse = await fetch('http://localhost:5000/api/favorites', { headers });
          if (favoritesResponse.ok) {
            const favoritesData = await favoritesResponse.json();
            setFavorites(favoritesData.map(item => item.productId));
          }
        }

        const reviewsResponse = await fetch(`http://localhost:5000/api/review/${productId}`, { headers });
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setReviews(reviewsData);
        }

      } catch (err) {
        setError(err.message || 'Не удалось загрузить товар');
        console.error('Ошибка:', err);
      } finally {
        setLoading(false);
      }
    };


    fetchData();
  }, [productId, token]);


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
      if (!response.ok) {
        throw new Error(`Ошибка обновления избранного: ${response.status}`);
      }
      setFavorites((prev) =>
        isFavorite ? prev.filter((id) => id !== productId) : [...prev, productId]
      );
      toast.success(isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное');
    } catch (err) {
      console.error('Ошибка обновления избранного:', err);
      toast.error('Не удалось обновить избранное');
    }
  };

  const handleAddToCart = async (productId, quantity = 1) => {
    if (!userId) {
      toast.error('Вы должны войти в систему для добавления товара в корзину.');
      navigate('/login');
      return;
    }

    try {
      await addToCart(userId, productId, quantity);
      toast.success('Товар успешно добавлен в корзину!');
    } catch (error) {
      console.error('Ошибка добавления товара:', error);
      toast.error('Ошибка при добавлении товара.');
    }
  };

  const handleBuyNow = (product) => {
    handleAddToCart(product.productId);
    navigate('/cart');
  };

  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  const renderSingleStar = (rating) => {
    const percentage = (rating / 5) * 100;

    return (
      <div className="single-star-container">
        <svg className="star-icon single" viewBox="0 0 100 100" width="20" height="20">
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
          {rating > 0 ? `${rating} (${reviews.length})` : 'Нет отзывов'}
        </span>
      </div>
    );
  };

  const scrollToReviews = () => {
    const reviewsSection = document.querySelector('.product-reviews');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return <div className="loading">Загрузка товара...</div>;
  }

  if (error === 'Товар не найден') {
    return <div className="not-found">Товар не найден</div>;
  }

  if (error) {
    return <div className="error">Ошибка: {error}</div>;
  }
  
  if (loading) {
    return <div className="loading">Загрузка товара...</div>;
  }

  if (!loading && (!product || error === 'Товар не найден')) {
    return (
      <section className="product-details">
        <div className="not-found-message">
          <h2>Товар не найден</h2>
          <p>Возможно, он был удалён или никогда не существовал.</p>
        </div>
      </section>
    );
  }

  const imageUrl = `http://localhost:5000/${product.imageUrl}`;
  const averageRating = calculateAverageRating();

  return (
    <section className="product-details">
      <div className="product-container">
        <div className="product-image">
          <button
            className={`favorite-btn ${favorites.includes(product.productId) ? 'favorited' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(product.productId);
            }}
            aria-label={favorites.includes(product.productId) ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            {favorites.includes(product.productId) ? '' : ''}
          </button>
          <img
            src={imageUrl}
            alt={product.name || 'Product'}
            className="product-image"
            onError={(e) => {
              e.target.src = 'http://localhost:5000/Uploads/placeholder.jpg';
            }}
          />
        </div>
        <div className="product-info">
          <div className="product-header">
            <h2 className="product-title">{product.name} ({product.description || 'Без описания'})</h2>
            <span className="product-price">{product.price} BYN</span>
          </div>
          <p className="product-artist">Художник: {product.artistName || 'Неизвестно'}</p>
          <div className="category-rating-container">
            <p className="product-category">Категория: {product.categoryName}</p>
            <div
              className="product-rating"
              onClick={scrollToReviews}
              style={{ cursor: 'pointer' }}
            >
              {renderSingleStar(averageRating)}
            </div>
          </div>
          <div className="product-buttons">
            <button
              className="add-to-cart"
              onClick={() => handleAddToCart(product.productId, 1)}
            >
              ДОБАВИТЬ В КОРЗИНУ
            </button>
            <button
              className="buy-now"
              onClick={() => handleBuyNow(product)}
            >
              КУПИТЬ СЕЙЧАС
            </button>
          </div>
          <hr />
          <div className="product-details-text">
            {product.attributes && product.attributes.length > 0 ? (
              product.attributes.map((attr, index) => (
                <p key={index}>
                  <strong>{attr.attributeName}:</strong> {attr.attributeValue}
                </p>
              ))
            ) : (
              <p>Дополнительные характеристики отсутствуют</p>
            )}
            <p><strong>Доставка:</strong></p>
            <div className="delivery-options">
              <div>
                <input type="radio" id="pickup-point" name="delivery" value="pickup" />
                <label htmlFor="pickup-point">
                  Самовывоз из пункта выдачи заказов в Минске
                </label>
              </div>
              <div>
                <input type="radio" id="pickup-address" name="delivery" value="pickup-address" />
                <label htmlFor="pickup-address">
                  Адрес пункта выдачи: Минск, ул. Марата, д.18 (магазин АструмШоп)
                </label>
              </div>
            </div>
            <br />
            <p className="working-hours">
              Пн-пт 10:00-20:00
              <br />
              Сб-вс 12:00-18:00
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default () => (
  <ErrorBoundary>
    <ProductDetails />
  </ErrorBoundary>
);