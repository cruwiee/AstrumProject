import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './OrderDetails.css';
import { FaArrowLeft, FaCalendarAlt, FaUser, FaWallet, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCreditCard, FaTimesCircle, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const API_URL = 'http://localhost:5000';

const formatPhoneNumber = (phone) => {
  if (!phone) return 'Не указано';

  let cleaned = phone.replace(/[^\d+]/g, '');

  if (!cleaned.startsWith('+375')) {
    cleaned = '+375' + cleaned.replace(/^\+?/, '');
  }

  if (cleaned.length > 13) {
    cleaned = cleaned.slice(0, 13);
  }

  let formatted = '';
  if (cleaned.length <= 4) {
    formatted = cleaned;
  } else if (cleaned.length <= 6) {
    formatted = cleaned.slice(0, 4) + ' ' + cleaned.slice(4);
  } else if (cleaned.length <= 9) {
    formatted = cleaned.slice(0, 4) + ' ' + cleaned.slice(4, 6) + ' ' + cleaned.slice(6);
  } else if (cleaned.length <= 11) {
    formatted = cleaned.slice(0, 4) + ' ' + cleaned.slice(4, 6) + ' ' + cleaned.slice(6, 9) + ' ' + cleaned.slice(9);
  } else {
    formatted = cleaned.slice(0, 4) + ' ' + cleaned.slice(4, 6) + ' ' + cleaned.slice(6, 9) + ' ' + cleaned.slice(9, 11) + ' ' + cleaned.slice(11);
  }

  return formatted;
};
const getStatusInfo = (status) => {
  const statusMap = {
    new: { class: 'status-detail-new', label: 'Новый', icon: <FaCheckCircle /> },
    processing: { class: 'status-detail-processing', label: 'В обработке', icon: <FaSpinner /> },
    canceled: { class: 'status-detail-canceled', label: 'Отменён', icon: <FaTimesCircle /> },
    shipped: { class: 'status-detail-shipped', label: 'Отправлен', icon: <FaCheckCircle /> },
    delivered: { class: 'status-detail-delivered', label: 'Доставлен', icon: <FaCheckCircle /> },
  };

  const normalizedStatus = status?.toLowerCase();
  return (
    statusMap[normalizedStatus] || {
      class: 'status-detail-default',
      label: 'Неизвестно',
      icon: null,
    }
  );
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const navigate = useNavigate();

  const handleAboutClick = () => {
    navigate('/about');
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Токен авторизации отсутствует');
        }

        const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || errorData.message || `Ошибка при загрузке деталей заказа (статус: ${response.status})`);
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      setError('Пожалуйста, укажите причину отмены');
      return;
    }

    setIsCanceling(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cancellationReason: cancelReason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при отмене заказа');
      }

      setOrder({ ...order, status: 'Отменён' });
      setShowCancelModal(false);
      setCancelReason('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCanceling(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return { class: 'status-detail-new', label: 'Новый', icon: <FaCheckCircle /> };
      case 'processing':
        return { class: 'status-detail-processing', label: 'В обработке', icon: <FaSpinner /> };
      case 'canceled':
        return { class: 'status-detail-canceled', label: 'Отменён', icon: <FaTimesCircle /> };
      default:
        return { class: 'status-detail-default', label: status || 'Неизвестно', icon: null };
    }
  };

  if (isLoading) {
    return (
      <div className="order-detail-page">
        <Header onAboutClick={handleAboutClick} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="order-detail-container">
          <div className="skeleton-detail-loader">
            <div className="skeleton-detail-header"></div>
            <div className="skeleton-detail-grid">
              <div className="skeleton-detail-card"></div>
              <div className="skeleton-detail-card"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-page">
        <Header onAboutClick={handleAboutClick} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="order-detail-container">
          <div className="error-detail-message" role="alert">
            <FaTimesCircle /> {error}
          </div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <Header onAboutClick={handleAboutClick} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="order-detail-container">
          <div className="error-detail-message" role="alert">
            <FaTimesCircle /> Заказ не найден
          </div>
        </main>
      </div>
    );
  }

  const canCancel = order.cancelableUntil && new Date(order.cancelableUntil) > new Date();

  return (
    <div className="order-detail-page">
      <Header onAboutClick={handleAboutClick} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main className="order-detail-container">
        <div className="order-detail-content">
          <div className="order-detail-header">
            <div className="breadcrumb-detail">
              <span onClick={() => navigate('/profile')} className="breadcrumb-detail-link">Профиль</span> /
              <span onClick={() => navigate(-1)} className="breadcrumb-detail-link"> Заказы</span> /
              <span>Заказ #{orderId}</span>
            </div>
            <button onClick={() => navigate(-1)} className="back-detail-button" aria-label="Вернуться назад">
              <FaArrowLeft /> Назад
            </button>
          </div>

          <div className="order-detail-grid">
            <div className="order-detail-card">
              <div className="order-detail-card-header">
                <h2>Заказ #{orderId}</h2>
                <div className={`order-detail-status ${getStatusInfo(order.status).class}`} title={`Статус: ${getStatusInfo(order.status).label}`}>
                  {getStatusInfo(order.status).icon} {getStatusInfo(order.status).label}
                </div>
              </div>
              <div className="order-detail-summary">
                <div className="summary-detail-item">
                  <FaUser /> <strong>Клиент:</strong> {order.user?.firstName || 'Неизвестно'} {order.userId}
                </div>
                <div className="summary-detail-item">
                  <FaEnvelope /> <strong>Email:</strong> {order.user?.email || 'Не указано'}
                </div>
                <div className="summary-detail-item">
                  <FaCalendarAlt /> <strong>Дата:</strong> {new Date(order.orderDate).toLocaleDateString('ru-RU')}
                </div>
                <div className="summary-detail-item">
                  <FaWallet /> <strong>Сумма:</strong> {order.totalAmount.toFixed(2)} BYN
                </div>
                <div className="summary-detail-item">
                  <FaMapMarkerAlt /> <strong>Адрес:</strong> {order.address || 'Не указан'}
                </div>
                <div className="summary-detail-item">
                  <FaPhone /> <strong>Телефон получателя:</strong> {formatPhoneNumber(order.recipientPhone)}
                </div>
                <div className="summary-detail-item">
                  <FaEnvelope /> <strong>Email получателя:</strong> {order.recipientEmail || 'Не указан'}
                </div>
                <div className="summary-detail-item">
                  <FaCreditCard /> <strong>Способ оплаты:</strong> {order.paymentMethod || 'Не указан'}
                </div>
              </div>
              {canCancel && (
                <button
                  className="cancel-detail-button"
                  onClick={() => setShowCancelModal(true)}
                  disabled={isCanceling}
                  aria-label="Отменить заказ"
                >
                  {isCanceling ? <FaSpinner className="spinner-detail" /> : 'Отменить заказ'}
                </button>
              )}
            </div>

            <div className="order-items-detail-card">
              <h3>Товары в заказе</h3>
              {order.orderItems.length === 0 ? (
                <p className="no-items-detail">Товары отсутствуют</p>
              ) : (
                <div className="order-detail-items">
                  {order.orderItems.map((item) => (
                    <div key={item.orderItemId} className="order-detail-item">
                      <img
                        src={item.imageUrl ? `${API_URL}/${item.imageUrl.startsWith('Uploads/') ? item.imageUrl : `Uploads/${item.imageUrl}`}` : `${API_URL}/Uploads/placeholder.jpg`}
                        alt={item.productName || 'Товар'}
                        className="order-detail-item-image"
                        onError={(e) => { e.target.src = `${API_URL}/Uploads/placeholder.jpg`; }}
                      />
                      <div className="order-detail-item-details">
                        <span
                          className="order-detail-item-name"
                          onClick={() => navigate(`/products/${item.productId}`)}
                          title={`Перейти к ${item.productName}`}
                        >
                          {item.productName || 'Неизвестный товар'}
                        </span>
                        <span className="order-detail-item-quantity">
                          {item.quantity} шт. × {item.unitPrice.toFixed(2)} BYN
                        </span>
                        <span className="order-detail-item-total">
                          Итого: {(item.quantity * item.unitPrice).toFixed(2)} BYN
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {showCancelModal && (
          <div className="modal-detail-overlay">
            <div className="cancel-detail-modal">
              <h3>Отмена заказа #{orderId}</h3>
              <p>Пожалуйста, укажите причину отмены:</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Причина отмены..."
                className="cancel-detail-reason-input"
                aria-label="Причина отмены заказа"
              />
              <div className="modal-detail-actions">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="modal-detail-cancel-button"
                  disabled={isCanceling}
                >
                  Отмена
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="modal-detail-confirm-button"
                  disabled={isCanceling || !cancelReason.trim()}
                >
                  {isCanceling ? <FaSpinner className="spinner-detail" /> : 'Подтвердить'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderDetails;