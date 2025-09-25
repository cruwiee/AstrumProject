import React, { useContext, useEffect, useState } from 'react';
import CartContext from '../context/CartContext';
import './CartItems.css';

function CartItems() {
  const { cartItems, updateQuantity, removeFromCart } = useContext(CartContext);
  const [loadedItems, setLoadedItems] = useState([]);

  useEffect(() => {
    if (Array.isArray(cartItems)) {
      setLoadedItems(cartItems);
    } else {
      console.error('cartItems is not an array:', cartItems);
      setLoadedItems([]);
    }
  }, [cartItems]);

  if (!Array.isArray(loadedItems)) {
    return <h2 className="empty-cart">Ошибка загрузки корзины</h2>;
  }

  if (loadedItems.length === 0) {
    return <h2 className="empty-cart">Корзина пуста</h2>;
  }

  return (
    <div className="cart-items-container">
      <h2 style={{ textAlign: 'center' }}>Корзина</h2>
      <div className="cart-item-header">
        <span>Изображение</span>
        <span>Название</span>
        <span>Количество</span>
        <span>Цена</span>
        <span>Удалить</span>
      </div>
      <div className="cart-items">
        {loadedItems.map((item) => {
          const imageUrl = item.imageUrl
            ? `http://localhost:5000/${item.imageUrl}`
            : 'http://localhost:5000/Uploads/placeholder.jpg';

          return (
            <div key={item.cartId} className="cart-item">
              <div className="cart-item-image">
                <img
                  src={imageUrl}
                  alt={item.name || 'Товар'}
                  className="product-image"
                  onError={(e) => {
                    console.warn(`Failed to load image for cart item ${item.cartId}: ${imageUrl}`);
                    e.target.src = 'http://localhost:5000/Uploads/placeholder.jpg';
                  }}
                />
              </div>
              <div className="cart-item-details">
                <span className="product-name">{item.name || 'Без названия'}</span>
              </div>
              <div className="cart-item-quantity">
                <button
                  className="quantity-button"
                  onClick={() => updateQuantity(item.cartId, Math.max(item.quantity - 1, 1))}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  className="quantity-button"
                  onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <div className="cart-item-price">
                {(item.price * item.quantity).toFixed(2)} BYN
              </div>
              <div className="cart-item-remove">
                <button
                  className="delete-btn"
                  onClick={() => removeFromCart(item.cartId)}
                  aria-label="Удалить из корзины"
                >
                  <img
                    src={process.env.PUBLIC_URL + '/trash.svg'}
                    alt="Иконка удаления"
                    className="delete-icon"
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CartItems;