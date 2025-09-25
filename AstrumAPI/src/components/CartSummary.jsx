// import React, { useState, useContext } from 'react';
// import CartContext from '../context/CartContext';
// import './CartSummary.css';

// export function CartSummary() {
//     const { cartItems, user, addToCart, updateQuantity, removeFromCart } = useContext(CartContext);
//     const [orderConfirmed, setOrderConfirmed] = useState(false);  // Состояние для подтверждения заказа
//     const [loading, setLoading] = useState(false);  // Состояние для индикатора загрузки
//     const [error, setError] = useState(null);  // Состояние для ошибки
//     const {  clearCart } = useContext(CartContext);

//     if (!Array.isArray(cartItems)) {
//         return <div>Ошибка при загрузке корзины</div>;
//     }

//     if (cartItems.length === 0) {
//         return <div>Ваша корзина пуста</div>;
//     }

//     const totalPrice = cartItems.reduce((total, item) => {
//         const price = typeof item.price === 'string' 
//             ? parseFloat(item.price.replace(/[^\d.]/g, '')) 
//             : item.price;

//         return isNaN(price) ? total : total + price * item.quantity;
//     }, 0).toFixed(2);


//     const handleOrder = async () => {
//         if (!user || !user.userId) {
//           alert("Пожалуйста, войдите в систему!");
//           return;
//         }

//         if (cartItems.length === 0) {
//           alert("Ваша корзина пуста.");
//           return;
//         }

//         const orderData = {
//           userId: user.userId,
//           items: cartItems,
//         };

//         try {
//           const response = await fetch("http://localhost:5000/api/orders/checkout", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               "Authorization": `Bearer ${localStorage.getItem("token")}`,
//             },
//             body: JSON.stringify(orderData),
//           });

//           if (!response.ok) {
//             const errorText = await response.text();
//             setError(`Ошибка: ${errorText}`);
//             return;
//           }

//           const result = await response.json();
//           setOrderConfirmed(true);
//           alert(`Заказ оформлен! Номер заказа: ${result.orderId}`);

//           // Очищаем корзину после успешного заказа
//           clearCart();
//         } catch (error) {
//           console.error("Ошибка при оформлении заказа:", error);
//           setError("Произошла ошибка. Попробуйте позже.");
//         }
//       };



//     return (
//         <div className="cart-summary">
//             <h2>Сумма заказа</h2>
//             <div>
//                 <span>Товаров на сумму: </span>
//                 <span>{totalPrice} BYN</span>
//             </div>
//             <div>
//                 <span>Доставка:</span>
//                 <span>0 BYN</span>
//             </div>
//             <div>
//                 <strong>Итого:</strong>
//                 <strong>{totalPrice} BYN</strong>
//             </div>

//             {/* Если заказ оформлен, отображаем подтверждение */}
//             {orderConfirmed ? (
//                 <div className="order-confirmation">
//                     <h3>Ваш заказ успешно оформлен!</h3>
//                     <p>Подробности заказа можно найти в вашем профиле.</p>
//                 </div>
//             ) : (
//                 <div>
//                     {/* Показываем индикатор загрузки, если заказ оформляется */}
//                     {loading ? (
//                         <div>Загрузка...</div>
//                     ) : (
//                         <button onClick={handleOrder}>Оформить заказ</button>
//                     )}

//                     {/* Если произошла ошибка, показываем сообщение об ошибке */}
//                     {error && <div className="error-message">{error}</div>}
//                 </div>
//             )}
//         </div>
//     );
// }

// export default CartSummary;
import React, { useState, useContext } from 'react';
import CartContext from '../context/CartContext';
import './CartSummary.css';

export function CartSummary({ formData, onEdit }) {
  const { cartItems, user, clearCart } = useContext(CartContext);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!Array.isArray(cartItems)) {
    return <div>Ошибка при загрузке корзины</div>;
  }

  if (cartItems.length === 0) {
    return <div>Ваша корзина пуста</div>;
  }

  const totalPrice = cartItems
    .reduce((total, item) => {
      const price =
        typeof item.price === 'string'
          ? parseFloat(item.price.replace(/[^\d.]/g, ''))
          : item.price;
      return isNaN(price) ? total : total + price * item.quantity;
    }, 0)
    .toFixed(2);

  const handleOrder = async () => {
    if (!user || !user.userId) {
      alert('Пожалуйста, войдите в систему!');
      return;
    }

    if (cartItems.length === 0) {
      alert('Ваша корзина пуста.');
      return;
    }

    if (!formData || !formData.name || !formData.phone || !formData.address || !formData.email) {
      alert('Пожалуйста, заполните все поля формы.');
      return;
    }

    setLoading(true);
    setError(null);

    const checkoutData = {
      userId: user.userId,
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      deliveryMethod: formData.delivery,
      address: formData.address,
      recipientName: formData.name,
      recipientPhone: formData.phone,
      recipientEmail: formData.email,
      paymentMethod: formData.payment,
    };

    try {
      const response = await fetch('http://localhost:5000/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const result = await response.json();
      setOrderConfirmed(true);
      alert(`Заказ оформлен! Номер заказа: ${result.orderId}`);
      clearCart();
    } catch (error) {
      console.error('Ошибка при оформлении заказа:', error);
      setError(`Произошла ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-summary">
      <h2>Сумма заказа</h2>
      {formData && (
        <div className="delivery-payment-info">
          <h3>Информация о доставке и оплате</h3>
          <ul className="info-list">
            <li className="info-item">
              <span className="info-label">Адрес доставки:</span>
              <div className="info-value-wrapper">
                <span className="info-value">{formData.address}</span>
                {/* <button
                  className="edit-button"
                  onClick={onEdit}
                  aria-label="Редактировать"
                >
                  <span className="material-icons">edit</span>
                </button> */}
              </div>
            </li>
            <li className="info-item">
              <span className="info-label">Способ доставки:</span>
              <span className="info-value">
                {formData.delivery === 'pickup'
                  ? 'Самовывоз'
                  : formData.delivery === 'cdek-pickup'
                    ? 'Пункт выдачи СДЭК'
                    : 'Курьер СДЭК'}
              </span>
            </li>
            <li className="info-item">
              <span className="info-label">Способ оплаты:</span>
              <span className="info-value">
                {formData.payment === 'cash'
                  ? 'Наличными'
                  : formData.payment === 'card'
                    ? 'Картой'
                    : 'Онлайн'}
              </span>
            </li>
            <li className="info-item">
              <span className="info-label">Получатель:</span>
              <span className="info-value">{formData.name}</span>
            </li>
            <li className="info-item">
              <span className="info-label">Телефон:</span>
              <span className="info-value">{formData.phone}</span>
            </li>
            <li className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{formData.email}</span>
            </li>
          </ul>
        </div>
      )}
      <div className="price-row">
        <span>Товаров на сумму:</span>
        <span>{totalPrice} BYN</span>
      </div>
      <div className="price-row">
        <span>Доставка:</span>
        <span>0 BYN</span>
      </div>
      <div className="price-row total">
        <strong>Итого:</strong>
        <strong>{totalPrice} BYN</strong>
      </div>

      {orderConfirmed ? (
        <div className="order-confirmation">
          <h3>Ваш заказ успешно оформлен!</h3>
          <p>Подробности заказа можно найти в вашем профиле.</p>
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : (
            <button onClick={handleOrder}>Оформить заказ</button>
          )}
          {error && <div className="error-message">{error}</div>}
        </div>
      )}
    </div>
  );
}

export default CartSummary;
