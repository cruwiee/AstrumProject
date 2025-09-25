import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserProfile.css';
import CartContext from '../context/CartContext';
import { NotificationContext } from '../components/NotificationProvider';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import CartItems from '../components/CartItems';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState('');
  const [errorNotifications, setErrorNotifications] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { notifications, setNotifications } = useContext(NotificationContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const scrollRefs = useRef({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found, redirecting to login');
      navigate('/login');
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
        return;
      }
    } catch (e) {
      console.error('Invalid token format', e);
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      navigate('/login');
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl('http://localhost:5000/notificationHub', {
        accessTokenFactory: () => token,
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveNotification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    connection
      .start()
      .then(() => console.log('SignalR Connected'))
      .catch((err) => console.error('SignalR Connection Error:', err.message));

    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/orders/report/notifications',
          {
            headers: ({
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            }),
          });
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            navigate('/login');
            return;
          }
          if (response.status === 403) {
            console.warn('Access to notifications forbidden for this user');
            setNotifications([]);
            setUnreadCount(0);
            setErrorNotifications('У вас пока нет уведомлений.');
            return;
          }
          throw new Error(`Ошибка загрузки уведомлений: ${response.status}`);
        }
        const data = await response.json();
        setNotifications(data);
        const unread = data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
        setErrorNotifications('');
      } catch (error) {
        console.error('Ошибка получения уведомлений:', error);
        setErrorNotifications('Не удалось загрузить уведомления.');
      }
    };

    fetchNotifications();

    return () => {
      connection.stop().then(() => console.log('SignalR Disconnected'));
    };
  }, [setNotifications, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user/profile', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            navigate('/login');
            return;
          }
          throw new Error(`Ошибка загрузки профиля: ${response.status}`);
        }

        const data = await response.json();
        console.log('User data:', data); 
        setUser(data || { firstName: 'Неизвестно', email: 'Не указан', phone: 'Не указан', role: 'customer' });
        localStorage.setItem('userId', data.userId || '');
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        setError('Не удалось загрузить профиль.');
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'favorites') {
      const token = localStorage.getItem('token');
      if (!token) return;

      const fetchFavorites = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/favorites', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`Ошибка загрузки избранного: ${response.status}`);
          }

          const data = await response.json();
          setFavorites(data);
        } catch (err) {
          console.error('Ошибка при загрузке избранного:', err);
          setFavorites([]);
          setError('Не удалось загрузить избранное.');
        }
      };

      fetchFavorites();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'orders') {
      const token = localStorage.getItem('token');
      if (!token) return;

      const fetchOrders = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/orders', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`Ошибка загрузки заказов: ${response.status}`);
          }

          const ordersData = await response.json();
          setOrders(ordersData);
          setCurrentPage(1);
        } catch (error) {
          console.error('Ошибка загрузки заказов:', error);
          setError('Не удалось загрузить заказы.');
        }
      };

      fetchOrders();
    }
  }, [activeTab]);

  const toggleFavorite = async (productId) => {
    const token = localStorage.getItem('token');
    const isFavorite = favorites.some((fav) => fav.productId === productId);

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
        throw new Error(`Ошибка изменения избранного: ${response.status}`);
      }

      const updatedResponse = await fetch('http://localhost:5000/api/favorites', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const updatedFavorites = await updatedResponse.json();
      setFavorites(updatedFavorites);
    } catch (err) {
      console.error('Ошибка изменения избранного:', err);
      setError('Не удалось обновить избранное.');
    }
  };

  const cancelOrder = async (orderId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Пожалуйста, войдите в систему для отмены заказа.');
      navigate('/login');
      return;
    }

    const cancellationReason = prompt('Введите причину отмены заказа:');
    if (!cancellationReason) {
      alert('Причина отмены обязательна.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          CancellationReason: cancellationReason,
        }),
      });

      if (response.ok) {
        alert('Заказ успешно отменён.');
        setOrders((prevOrders) => prevOrders.filter((o) => o.orderId !== orderId));
        setCurrentPage(1);
      } else {
        const errorData = await response.json();
        alert(`Не удалось отменить заказ: ${errorData.message || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Ошибка при отмене заказа:', error);
      alert('Ошибка при отмене заказа.');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/orders/report/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка при отметке уведомления');
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error('Ошибка при отметке уведомления:', error);
      setErrorNotifications('Не удалось отметить уведомление как прочитанное.');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/orders/report/notifications/read-all`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка при очистке уведомлений');
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Ошибка при очистке уведомлений:', error);
      setErrorNotifications('Не удалось очистить уведомления.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
    setNotifications([]);
    setFavorites([]);
    setOrders([]);
    setUnreadCount(0);
    setError('');
    setErrorNotifications('');
    navigate('/login');
  };

  const scrollLeft = (orderId) => {
    const container = scrollRefs.current[orderId];
    if (container) {
      container.scrollBy({ left: -150, behavior: 'smooth' });
    }
  };

  const scrollRight = (orderId) => {
    const container = scrollRefs.current[orderId];
    if (container) {
      container.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!user) return <p className="loading">Загрузка профиля...</p>;

  return (
    <div className="profile-container">
      <section className="hero">
        <img src={process.env.PUBLIC_URL + '/bannerProfile.png'} alt="Astrum Banner" />
      </section>

      <div className="profile-header">
        <img
          src={user.avatarUrl || process.env.PUBLIC_URL + '/images/default-avatar.png'}
          alt="User Avatar"
          className="avatar"
        />
        <div className="profile-info">
          <h2>{user.firstName || 'Неизвестный пользователь'}</h2>
          <p>{user.email || 'Email не указан'}</p>
          {user.role === 'admin' && <span className="admin-badge">Админ</span>}
        </div>
        <button className="logout" onClick={handleLogout}>
          Выйти
        </button>
      </div>

      <div className="tabs">
        <Link
          to="#"
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          Профиль
        </Link>
        <Link
          to="#"
          className={activeTab === 'favorites' ? 'active' : ''}
          onClick={() => setActiveTab('favorites')}
        >
          Избранное
        </Link>
        <Link
          to="#"
          className={activeTab === 'cart' ? 'active' : ''}
          onClick={() => setActiveTab('cart')}
        >
          Корзина
        </Link>
        <Link
          to="#"
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          Заказы
        </Link>
        <Link
          to="#"
          className={
            activeTab === 'notifications'
              ? 'active'
              : unreadCount > 0
                ? 'unread'
                : ''
          }
          onClick={() => setActiveTab('notifications')}
        >
          Уведомления
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </Link>
        {user.role === 'admin' && (
          <Link to="/admin" className="tab-link">
            Админ
          </Link>
        )}
      </div>

      <div className="tab-content">
        {activeTab === 'profile' && (
          <div className="user-profile">
            <h3>Моя информация</h3>
            <p><strong>Имя:</strong> {user.firstName || 'Не указано'}</p>
            <p><strong>Email:</strong> {user.email || 'Не указан'}</p>
            <p><strong>Телефон:</strong> {user.phone || 'Не указан'}</p>
            <p>
              <strong>Дата регистрации:</strong>{' '}
              {user.registrationDate
                ? new Date(user.registrationDate).toLocaleDateString('ru-RU')
                : 'Не указана'}
            </p>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="favorites-tab">
            <h3>Избранное</h3>
            <div className="cards">
              {favorites.length > 0 ? (
                favorites.map((card) => (
                  <div key={card.productId} className="card">
                    <Link to={`/product/${card.productId}`} className="card-link">
                      <div className="card-image">
                        <button
                          className="favorite-btn favorited"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(card.productId);
                          }}
                          aria-label="Удалить из избранного"
                        ></button>
                        <img
                          src={`http://localhost:5000/${card.imageUrl?.startsWith('Uploads/')
                            ? card.imageUrl
                            : `Uploads/${card.imageUrl}`
                            }`}
                          alt={card.name || 'Товар'}
                          onError={(e) => {
                            e.target.src = 'http://localhost:5000/Uploads/placeholder.jpg';
                          }}
                        />
                        <div className="card-overlay">
                          <h3>{card.name}</h3>
                          <small>{card.artistName?.toUpperCase()}</small>
                        </div>
                      </div>
                      <strong>{card.price} BYN</strong>
                      <p className="card-description">{card.description}</p>
                      <button
                        className="cart-button"
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(card);
                        }}
                        aria-label="Добавить в корзину"
                      ></button>
                    </Link>
                  </div>
                ))
              ) : (
                <p className="no-favorites">Избранных товаров пока нет.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="cart-tab">
            <CartItems />
            <Link to="/cart" className="checkout-button">
              Оформить заказ
            </Link>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-container">
            <h3>Мои заказы</h3>
            {orders.length > 0 ? (
              <>
                <div className="order-list">
                  {currentOrders.map((order) => {
                    const statusLabels = {
                      new: 'Новый',
                      processing: 'В обработке',
                      shipped: 'Отправлен',
                      delivered: 'Доставлен',
                      canceled: 'Отменён',
                    };

                    const now = new Date();
                    const cancelableUntil = order.cancelableUntil
                      ? new Date(order.cancelableUntil)
                      : null;
                    const canCancel =
                      cancelableUntil &&
                      now < cancelableUntil &&
                      ['new', 'processing'].includes(order.status?.toLowerCase());

                    return (
                      <div key={order.orderId} className="order-card">
                        <div className="order-header">
                          <div className="order-info">
                            <span className="order-number">Заказ №{order.orderId}</span>
                            <span className="order-date">
                              {new Date(order.orderDate).toLocaleDateString('ru-RU')}
                            </span>
                            <span className="order-status">
                              Статус: {statusLabels[order.status?.toLowerCase()] || order.status}
                            </span>
                            <span className="order-total">
                              Сумма: {order.totalAmount} BYN
                            </span>
                            {cancelableUntil && (
                              <span className="order-cancelable-until">
                                Отмена до: {cancelableUntil.toLocaleString('ru-RU')}
                              </span>
                            )}
                          </div>
                          {canCancel ? (
                            <button
                              className="delete-order-btn"
                              onClick={() => cancelOrder(order.orderId)}
                            >
                              Отменить заказ
                            </button>
                          ) : (
                            <span className="cancel-unavailable">Отмена недоступна</span>
                          )}
                        </div>
                        <div className="order-items-wrapper">
                          {order.orderItems?.length > 0 ? (
                            <>
                              <button
                                className="scroll-arrow left"
                                onClick={() => scrollLeft(order.orderId)}
                                aria-label="Прокрутить влево"
                              >
                                &lt;
                              </button>
                              <div
                                className="order-items-scroll"
                                ref={(el) => (scrollRefs.current[order.orderId] = el)}
                              >
                                {order.orderItems.map((item) => {
                                  const isUnavailable = item.available === false;
                                  const imageUrl = item.imageUrl
                                    ? `http://localhost:5000/${item.imageUrl}`
                                    : 'http://localhost:5000/Uploads/placeholder.jpg';

                                  return (
                                    <div key={item.orderItemId} className={`order-item ${isUnavailable ? 'unavailable' : ''}`}>
                                      <img
                                        src={imageUrl}
                                        alt={item.productName || 'Товар'}
                                        className="order-item-image"
                                        onError={(e) => {
                                          console.warn(
                                            `Failed to load image for order item ${item.orderItemId}: ${imageUrl}`
                                          );
                                          e.target.src = 'http://localhost:5000/Uploads/placeholder.jpg';
                                        }}
                                      />
                                      <div className="order-item-details">
                                        <span className="order-item-name">
                                          {item.productName || 'Без названия'}
                                        </span>
                                        <span className="order-item-quantity">
                                          {item.quantity} × {item.unitPrice} BYN
                                        </span>
                                        {isUnavailable && (
                                          <span className="order-item-unavailable">Товар более не доступен</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}

                              </div>
                              <button
                                className="scroll-arrow right"
                                onClick={() => scrollRight(order.orderId)}
                                aria-label="Прокрутить вправо"
                              >
                                &gt;
                              </button>
                            </>
                          ) : (
                            <p className="no-items">Нет товаров в заказе</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {totalPages > 1 && (
                  <div className="pagination-wrapper">
                    <ul className="pagination">
                      <li
                        className={`pagination__item ${currentPage === 1 ? 'disabled' : ''}`}
                        onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                      >
                        <span className="pagination__link">{'<'}</span>
                      </li>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                        <li
                          key={num}
                          className="pagination__item"
                          onClick={() => paginate(num)}
                        >
                          <span className={`pagination__link ${currentPage === num ? 'is_active' : ''}`}>
                            {num}
                          </span>
                        </li>
                      ))}

                      <li
                        className={`pagination__item ${currentPage === totalPages ? 'disabled' : ''}`}
                        onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                      >
                        <span className="pagination__link">{'>'}</span>
                      </li>
                    </ul>
                  </div>
                )}

              </>
            ) : (
              <p className="no-orders">У вас пока нет заказов.</p>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="notifications-container">
            <div className="notifications-header">
              <h3>Уведомления</h3>
              {notifications.length > 0 && (
                <button className="clear-all-btn" onClick={markAllAsRead}>
                  Очистить всё
                </button>
              )}
            </div>
            {errorNotifications ? (
              <p className="error-text">{errorNotifications}</p>
            ) : notifications.length > 0 ? (
              <div className="notification-list">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-card ${notification.isRead ? 'read' : 'unread'}`}
                  >
                    <div className="notification-content">
                      <p className="notification-message">{notification.message}</p>
                      <p className="notification-timestamp">
                        {new Date(notification.timestamp).toLocaleString('ru-RU')}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        className="clear-notification-btn"
                        onClick={() => markAsRead(notification.id)}
                        aria-label="Отметить как прочитанное"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-notifications">У вас пока нет уведомлений.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;