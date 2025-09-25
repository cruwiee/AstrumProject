import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import './ProductDetalis.css';
import { toast } from 'react-toastify'; // Уведомления
import { addToCart as apiAddToCart } from '../services/api'; // Переименуем API-функцию

function ProductDetails() {
  const { productId } = useParams(); // ID товара из URL
  const [product, setProduct] = useState(null);
  const { user } = useContext(CartContext); // Получаем весь объект user
const userId = user ? user.userId : null; // Берем userId из user, если он существует
   const [favorites, setFavorites] = useState([]);







  const [loading, setLoading] = useState(true);
  const { addToCart, cartItems, setCartItems } = useContext(CartContext); // Функции из контекста
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Ошибка загрузки товара:', err);
        setLoading(false);
      });
  }, [productId]);

  if (loading) return <p>Загрузка товара...</p>;
  if (!product) return <p>Товар не найден</p>;


  
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

  const handleAddToCart = async (productId, quantity = 1) => {
    if (!userId) {
      toast.error("Вы должны войти в систему для добавления товара в корзину.");
      return;
    }
  
    try {
      console.log("Отправляем в API:", { userId, productId, quantity });
  
      const cartItemsFromApi = await apiAddToCart(userId, productId, quantity);
      
      if (Array.isArray(cartItemsFromApi)) {
        console.log("Обновляем корзину:", cartItemsFromApi);
        setCartItems(cartItemsFromApi); // ✅ Обновляем глобальное состояние
        toast.success("Товар успешно добавлен!");
      } else {
        console.error("Ошибка: API вернул неожиданные данные", cartItemsFromApi);
      }
    } catch (error) {
      console.error("Ошибка добавления товара:", error);
      toast.error("Ошибка при добавлении товара.");
    }
  };


  const handleBuyNow = (product) => {
    handleAddToCart(product.productId); // Используем правильный ключ
    navigate('/cart'); // Перенаправляем в корзину
  };

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
  ></button>

  <img
  
    src={`http://localhost:5000/${product.imageUrl.startsWith('uploads/') ? product.imageUrl : 'uploads/' + product.imageUrl}`}
    alt={product.name}
  />
</div>



        <div className="product-info">
          <div className="product-header">
            <h2 className="product-title">{product.name} ({product.description})</h2>
            <span className="product-price">{product.price} BYN</span>
          </div>
          <p className="product-artist">Художник: {product.artistName}</p>
          <div className="product-buttons">
          <button className="add-to-cart" onClick={() => handleAddToCart(product.productId, 1)  // Убедитесь, что передаете правильное значение quantity
}>
  ДОБАВИТЬ В КОРЗИНУ
</button>


            {/* Кнопка для немедленного перехода в корзину */}
            <button className="buy-now" onClick={() => handleBuyNow(product)}>
              КУПИТЬ СЕЙЧАС
            </button>
          </div>
          <hr/>
          <div className="product-details-text">
            <p><strong>Материал:</strong> глянцевый мелованный картон</p>
            <p><strong>Размер:</strong> A6 (210х148мм)</p>
            <p><strong>Доставка:</strong></p>
            <div className="product-details-text">
              <div>
                <input 
                  type="radio" 
                  id="pickup-point" 
                  name="delivery" 
                  value="pickup" 
                />
                <label htmlFor="pickup-point">
                  Самовывоз из пункта выдачи заказов в Минск
                </label>
              </div>
              <div>
                <input 
                  type="radio" 
                  id="pickup-address" 
                  name="delivery" 
                  value="pickup-address" 
                />
                <label htmlFor="pickup-address">
                  Адрес пункта выдачи: Минск, ул. Марата, д.18 (магазин КрафтиКо)
                </label>
              </div>
            </div>
            <br />
            <p className="working-hours">
              Пн-пт 10:00-20:00 МСК 
              <br />
              Сб-вс 12:00-18:00 МСК
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetails;


// import React, { useEffect, useState, useContext } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import CartContext from '../context/CartContext';
// import './ProductDetalis.css';

// import { toast } from 'react-toastify'; // Для отображения уведомлений
// import { apiAddToCart } from '../services/api'; // Импортируем функцию для API



// function ProductDetails() {
//   const { productId } = useParams();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const { addToCart, setCartItems } = useContext(CartContext); // Получаем функции из контекста
  
//   // const [user, setUser] = useState(null);
    

//   // const { id } = useParams(); // Получаем ID товара из URL
//  // Преобразуем в число
// console.log("ID из useParams():", productId);


//   const navigate = useNavigate();
//   // const { addToCart } = useContext(CartContext); // Контекст для добавления в корзину

//   console.log("ID из useParams():", productId);
  

  
//   useEffect(() => {
//     fetch(`http://localhost:5000/api/products/${productId}`)
//       .then((res) => res.json())
//       .then((data) => {
//         setProduct(data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error('Ошибка загрузки товара:', err);
//         setLoading(false);
//       });
//   }, [productId]);

//   if (loading) return <p>Загрузка товара...</p>;
//   if (!product) return <p>Товар не найден</p>;


  
  
//   const handleAddToCart = async (productId, quantity = 1) => {
//     console.log("ID товара перед добавлением в корзину:", productId);
    
//     // Обновляем корзину на клиенте для мгновенного отклика
//     addToCart(productId, quantity);  // Обновляем контекст (или локальное состояние корзины)
//     toast.success("Товар добавлен в корзину!");  // Показать сообщение
  
//     try {
//       // Выполняем асинхронный запрос на сервер
//       const cartItems = await apiAddToCart(productId, quantity);
      
//       if (cartItems) {
//         // Обновляем состояние корзины, если запрос успешен
//         setCartItems(cartItems);  // Убедитесь, что setCartItems определен
//         toast.success("Товар добавлен в корзину!");
//       }
//     } catch (error) {
//       // Если серверная операция не удалась, откатываем изменения на клиенте
//       console.error("Ошибка добавления товара в корзину:", error);
//       toast.error("Ошибка при добавлении товара в корзину. Попробуйте позже.");
//     }
//   };
  
//   const handleBuyNow = (product) => {
//     addToCart(product.productId, 1); // добавляем товар в корзину
//     navigate('/cart'); // перенаправляем на страницу корзины
//   };

//   return (
//     <section className="product-details">
//       <div className="product-container">
//         <div className="product-image">
//         <img
//   id="product-image"
//   src={`http://localhost:5000/${product.imageUrl.startsWith('uploads/') ? product.imageUrl : 'uploads/' + product.imageUrl}`} 
//   alt={product.name}
// />

//         </div>
//         <div className="product-info">
//           <div className="product-header">
//             <h2 className="product-title">{product.name} ({product.description})</h2>
//             <span className="product-price">{product.price} BYN</span>
//           </div>
//           <p className="product-artist">Художник: {product.artistName}</p>
//           <div className="product-buttons">
//           <button className="add-to-cart" onClick={() => handleAddToCart(product.productId, 1)  // Убедитесь, что передаете правильное значение quantity
// }>
//   ДОБАВИТЬ В КОРЗИНУ
// </button>


//             {/* Кнопка для немедленного перехода в корзину */}
//             <button className="buy-now" onClick={() => handleBuyNow(product)}>
//               КУПИТЬ СЕЙЧАС
//             </button>
//           </div>
//           <hr/>
//           <div className="product-details-text">
//             <p><strong>Материал:</strong> глянцевый мелованный картон</p>
//             <p><strong>Размер:</strong> A6 (210х148мм)</p>
//             <p><strong>Доставка:</strong></p>
//             <div className="product-details-text">
//               <div>
//                 <input 
//                   type="radio" 
//                   id="pickup-point" 
//                   name="delivery" 
//                   value="pickup" 
//                 />
//                 <label htmlFor="pickup-point">
//                   Самовывоз из пункта выдачи заказов в Санкт-Петербурге
//                 </label>
//               </div>
//               <div>
//                 <input 
//                   type="radio" 
//                   id="pickup-address" 
//                   name="delivery" 
//                   value="pickup-address" 
//                 />
//                 <label htmlFor="pickup-address">
//                   Адрес пункта выдачи: Санкт-Петербург, ул. Марата, д.18 (магазин КрафтиКо)
//                 </label>
//               </div>
//             </div>
//             <br />
//             <p className="working-hours">
//               Пн-пт 10:00-20:00 МСК 
//               <br />
//               Сб-вс 12:00-18:00 МСК
//             </p>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// export default ProductDetails;
