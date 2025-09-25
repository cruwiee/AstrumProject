import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UserProfile.css";
import { useContext } from "react";
import CartContext from '../context/CartContext';
import CartItems from '../components/CartItems';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/user/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Ошибка загрузки профиля: ${response.status}`);
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("❌ Ошибка запроса:", error);
        setError("Ошибка загрузки профиля");
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === "favorites") {
      const fetchFavorites = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
          const response = await fetch("http://localhost:5000/api/favorites", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`Ошибка загрузки избранного: ${response.status}`);
          }

          const data = await response.json();
          setFavorites(data);
        } catch (err) {
          console.error("❌ Ошибка при загрузке избранного:", err);
          setFavorites([]);
        }
      };

      fetchFavorites();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "orders") {
      const fetchOrders = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
          const response = await fetch("http://localhost:5000/api/orders", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`Ошибка загрузки заказов: ${response.status}`);
          }

          let ordersData = await response.json();
          const productPromises = ordersData.flatMap(order =>
            order.orderItems.map(async (item) => {
              const productRes = await fetch(`http://localhost:5000/api/products/${item.productId}`);
              if (!productRes.ok) throw new Error("Ошибка загрузки товара");
              const productData = await productRes.json();
              return { ...item, productName: productData.name, imageUrl: productData.imageUrl };
            })
          );

          const enrichedItems = await Promise.all(productPromises);
          const enrichedOrders = ordersData.map(order => ({
            ...order,
            orderItems: enrichedItems.filter(item => order.orderItems.some(oi => oi.productId === item.productId)),
          }));

          setOrders(enrichedOrders);
        } catch (error) {
          console.error("❌ Ошибка загрузки заказов:", error);
          setError("Ошибка загрузки заказов");
        }
      };

      fetchOrders();
    }
  }, [activeTab]);

  const toggleFavorite = async (productId) => {
    const token = localStorage.getItem("token");
    const isFavorite = favorites.some(fav => fav.productId === productId);

    const url = `http://localhost:5000/api/favorites/${productId}`;
    const method = isFavorite ? "DELETE" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка изменения избранного: ${response.status}`);
      }

      const updatedResponse = await fetch("http://localhost:5000/api/favorites", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const updatedFavorites = await updatedResponse.json();
      setFavorites(updatedFavorites);
    } catch (err) {
      console.error("❌ Ошибка изменения избранного:", err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка удаления заказа: ${response.status}`);
      }

      setOrders(prevOrders => prevOrders.filter(order => order.orderId !== orderId));
    } catch (error) {
      console.error("❌ Ошибка при удалении заказа:", error);
      setError(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (error) return <p className="error">{error}</p>;
  if (!user) return <p>Загрузка...</p>;

  return (
    <div className="profile-container">
      <section className="hero">
        <img src={process.env.PUBLIC_URL + "/bannerProfile.png"} alt="Astrum Banner" />
      </section>

      <div className="profile-header">
        <img alt="User Avatar" className="avatar" />
        <div>
          <h2>{user.firstName || "Неизвестный пользователь"}</h2>
          <p>{user.email || "Email не указан"}</p>
          {user.role === "admin" && <span className="admin-badge">Админ</span>}
        </div>
        <button className="logout" onClick={handleLogout}>
          Выйти
        </button>
      </div>


      <div className="tabs">
        <Link
          to="#"
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Профиль
        </Link>
        <Link
          to="#"
          className={activeTab === "favorites" ? "active" : ""}
          onClick={() => setActiveTab("favorites")}
        >
          Избранное
        </Link>
        <Link
          to="#"
          className={activeTab === "cart" ? "active" : ""}
          onClick={() => setActiveTab("cart")}
        >
          Корзина
        </Link>
        <Link
          to="#"
          className={activeTab === "orders" ? "active" : ""}
          onClick={() => setActiveTab("orders")}
        >
          Заказы
        </Link>
        <Link
          to="#"
          className={activeTab === "settings" ? "active" : ""}
          onClick={() => setActiveTab("settings")}
        >
          Настройки
        </Link>
        {user.role === "admin" && (
          <Link to="/admin" className="tab-link">
            Админ
          </Link>
        )}
      </div>

      <div className="tab-content">
        {activeTab === "profile" && (
          <div className="user-profile">
            <h3>Моя информация</h3>
            <p><strong>Имя:</strong> {user.firstName || "Неизвестно"}</p>
            <p><strong>Email:</strong> {user.email || "Не указан"}</p>
            <p><strong>Телефон:</strong> {user.phone || "Не указан"}</p>
            <p><strong>Роль:</strong> {user.role || "customer"}</p>
            <p><strong>Дата регистрации:</strong> {new Date(user.registrationDate).toLocaleDateString()}</p>
          </div>
        )}

        {activeTab === "favorites" && (
          <div>
            <h3>Избранное</h3>
            <div className="cards">
              {favorites.length > 0 ? (
                favorites.map(card => (
                  <div key={card.productId} className="card">
                    <Link to={`/product/${card.productId}`} className="card-link">
                      <div className="card-image">
                        <button
                          className="favorite-btn favorited" // Всегда favorited во вкладке
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(card.productId);
                          }}
                          aria-label="Удалить из избранного"
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
                ))
              ) : (
                <p>Избранных товаров пока нет.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "cart" && (
          <div className="cart-tab">
            <CartItems />
            <Link to="/cart" className="checkout-button">
              Оформить заказ
            </Link>
          </div>
        )}
        {activeTab === "orders" && (
          <div className="orders-container">
            <h3>Мои заказы</h3>
            {orders.length > 0 ? (
              <div className="order-list">
                {orders.map(order => {
                  // Маппинг статусов на русский
                  const statusLabels = {
                    new: 'Новый',
                    processing: 'В обработке',
                    shipped: 'Отправлен',
                    delivered: 'Доставлен',
                    canceled: 'Отменён'
                  };

                  return (
                    <div key={order.orderId} className="order-card">
                      <div className="order-header">
                        <div className="order-info">
                          <span className="order-number">Заказ №{order.orderId}</span>
                          <span className="order-date">{new Date(order.orderDate).toLocaleDateString()}</span>
                          <span className="order-status">Статус: {statusLabels[order.status.toLowerCase()] || order.status}</span>
                          <span className="order-total">Сумма: {order.totalAmount} BYN</span>
                        </div>
                        <button
                          className="delete-order-btn"
                          onClick={() => handleDeleteOrder(order.orderId)}
                        >
                          Отменить заказ
                        </button>
                      </div>
                      <div className="order-items">
                        {order.orderItems?.length > 0 ? (
                          order.orderItems.map(item => (
                            <div key={item.orderItemId} className="order-item">
                              <img
                                src={`http://localhost:5000/${item.imageUrl?.startsWith('Uploads/') ? item.imageUrl : 'Uploads/' + item.imageUrl}`}
                                alt={item.productName}
                                className="order-item-image"
                              />
                              <div className="order-item-details">
                                <span className="order-item-name">{item.productName}</span>
                                <span className="order-item-quantity">{item.quantity} шт. × {item.unitPrice} BYN</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="no-items">Нет товаров в заказе</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-orders">У вас пока нет заказов.</p>
            )}
          </div>
        )}
        {activeTab === "settings" && (
          <div>
            <h3>Настройки</h3>
            <p>Здесь можно добавить настройки профиля (например, изменение пароля или данных).</p>
          </div>
        )}
      </div>
      {/* 
      <div className="buttons">
        <Link to="/">На главную</Link>
        <button className="logout" onClick={handleLogout}>
          Выйти
        </button>
      </div> */}
    </div>
  );
};

export default UserProfile;