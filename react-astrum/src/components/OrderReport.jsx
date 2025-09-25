import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Link } from 'react-router-dom';
import './OrderReport.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_URL = 'http://localhost:5000';

const statusLabels = {
  new: "Новый",
  processing: "В обработке",
  shipped: "Отправлен",
  delivered: "Доставлен",
  canceled: "Отменён",
  completed: "Завершён",
};

const OrderReport = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Токен авторизации отсутствует');
        }

        const queryParams = [];
        if (startDate) queryParams.push(`startDate=${encodeURIComponent(startDate)}`);
        if (endDate) queryParams.push(`endDate=${encodeURIComponent(endDate)}`);
        const query = queryParams.length ? `?${queryParams.join('&')}` : '';

        const response = await fetch(`${API_URL}/api/orders/report${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401) {
          throw new Error('Неавторизован. Пожалуйста, войдите в систему');
        }
        if (response.status === 403) {
          throw new Error('Доступ запрещён. Требуются права администратора');
        }
        if (!response.ok) {
          let errorMessage = `Ошибка сервера: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
            if (errorData.details) {
              errorMessage += ` (Подробности: ${errorData.details})`;
            }
          } catch (jsonError) {
            console.warn('Не удалось разобрать ответ сервера:', jsonError);
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Данные от сервера некорректны: ожидается массив заказов');
        }
        setOrders(data);
        setFilteredOrders(data);
      } catch (err) {
        console.error('Ошибка при загрузке заказов:', err);
        setError(err.message);
      }
    };

    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Токен авторизации отсутствует');
        }

        const queryParams = [];
        if (startDate) queryParams.push(`startDate=${encodeURIComponent(startDate)}`);
        if (endDate) queryParams.push(`endDate=${encodeURIComponent(endDate)}`);
        const query = queryParams.length ? `?${queryParams.join('&')}` : '';

        const response = await fetch(`${API_URL}/api/orders/report/statistics${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401) {
          throw new Error('Неавторизован. Пожалуйста, войдите в систему');
        }
        if (response.status === 403) {
          throw new Error('Доступ запрещён. Требуются права администратора');
        }
        if (!response.ok) {
          let errorMessage = `Ошибка сервера: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
            if (errorData.details) {
              errorMessage += ` (Подробности: ${errorData.details})`;
            }
          } catch (jsonError) {
            console.warn('Не удалось разобрать ответ сервера:', jsonError);
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Данные статистики некорректны: ожидается массив статистики');
        }
        setStatistics(data);
      } catch (err) {
        console.error('Ошибка при загрузке статистики:', err);
        setError(err.message);
      }
    };

    const loadData = async () => {
      setLoading(true);
      setError(null);
      setCurrentPage(1);
      try {
        await Promise.all([fetchOrders(), fetchStatistics()]);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [startDate, endDate]);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setCurrentPage(1);

    const filtered = orders.filter((order) =>
      order.orderId.toString().includes(query) ||
      (order.userName || '').toLowerCase().includes(query)
    );
    setFilteredOrders(filtered);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Токен авторизации отсутствует");
      }

      const validStatuses = Object.keys(statusLabels);
      if (!validStatuses.includes(newStatus)) {
        throw new Error("Недопустимый статус заказа");
      }

      const body = { status: newStatus };
      if (newStatus === 'canceled') {
        const reason = prompt('Введите причину отмены:');
        if (!reason) {
          throw new Error('Причина отмены обязательна');
        }
        body.cancellationReason = reason;
      }

      const response = await fetch(
        `${API_URL}/api/orders/report/update-status/${orderId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        let errorMessage = `Ошибка при обновлении статуса: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          if (errorData.details) {
            errorMessage += ` (Подробности: ${errorData.details})`;
          }
        } catch (jsonError) {
          errorMessage = `Сервер вернул неожиданный ответ (код ${response.status}). Обратитесь к администратору.`;
        }
        throw new Error(errorMessage);
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId ? { ...order, status: newStatus } : order
        )
      );
      setFilteredOrders((prevFiltered) =>
        prevFiltered.map((order) =>
          order.orderId === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Ошибка при обновлении статуса:", err);
      setError(err.message);
    }
  };

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен авторизации отсутствует');
      }

      const queryParams = [`format=${encodeURIComponent(format)}`];
      if (startDate) queryParams.push(`startDate=${encodeURIComponent(startDate)}`);
      if (endDate) queryParams.push(`endDate=${encodeURIComponent(endDate)}`);
      const query = `?${queryParams.join('&')}`;

      const response = await fetch(`${API_URL}/api/orders/report/export${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `Ошибка при экспорте данных  ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          if (errorData.details) {
            errorMessage += ` (Подробности: ${errorData.details})`;
          }
        } catch (jsonError) {
          console.warn('Не удалось разобрать ответ сервера:', jsonError);
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_report.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Ошибка при экспорте:', err);
      setError(err.message);
    }
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setFilteredOrders(orders);
    setError(null);
    setCurrentPage(1);
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;
    if (startDate && value < startDate) {
      setError('Конечная дата не может быть раньше начальной');
      return;
    }
    setEndDate(value);
    setError(null);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const chartData = {
    labels: statistics.map((stat) => new Date(stat.date).toLocaleDateString('ru-RU')),
    datasets: [
      {
        label: 'Количество заказов',
        data: statistics.map((stat) => stat.orderCount),
        fill: false,
        borderColor: '#5e54b2',
        backgroundColor: '#5e54b2',
        pointBackgroundColor: '#5e54b2',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#5e54b2',
        tension: 0.4,
        borderWidth: 4,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeOutCubic',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 14, family: 'Arial, sans-serif' },
          color: '#fff',
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Динамика заказов за выбранный период',
        font: { size: 20, family: 'Arial, sans-serif', weight: 'bold' },
        color: '#fff',
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: '#5e54b2',
        titleFont: { size: 14, family: 'Arial, sans-serif' },
        bodyFont: { size: 12, family: 'Arial, sans-serif' },
        padding: 10,
        cornerRadius: 4,
        callbacks: {
          label: (context) => `Заказов: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Дата',
          font: { size: 14, family: 'Arial, sans-serif', weight: 'bold' },
          color: '#fff',
        },
        grid: { color: 'rgb(95, 95, 95)' },
        ticks: { color: '#fff', font: { size: 12, family: 'Arial, sans-serif' } },
      },
      y: {
        title: {
          display: true,
          text: 'Количество заказов',
          font: { size: 14, family: 'Arial, sans-serif', weight: 'bold' },
          color: '#fff',
        },
        grid: { color: 'rgb(95, 95, 95)' },
        ticks: {
          color: '#fff',
          font: { size: 12, family: 'Arial, sans-serif' },
          beginAtZero: true,
          stepSize: 1,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
      axis: 'x',
    },
    hover: {
      animationDuration: 300,
    },
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;
  if (!Array.isArray(filteredOrders) || filteredOrders.length === 0) {
    return <div className="no-data">Нет заказов, соответствующих критериям поиска</div>;
  }

  return (
    <div className="report-container">
      <div className="title">
        <h2>Отчет о заказах</h2>
        <div className="header-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Поиск по номеру заказа или клиенту..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          <div className="export-buttons">
            <button onClick={() => handleExport('csv')}>Экспорт в CSV</button>
            <button onClick={() => handleExport('xlsx')}>Экспорт в Excel</button>
          </div>
        </div>
      </div>

      <div className="date-filter">
        <label>
          Начальная дата:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="date-input"
          />
        </label>
        <label>
          Конечная дата:
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="date-input"
          />
        </label>
        <button onClick={handleResetFilters} className="reset-button">
          Очистить фильтры
        </button>
      </div>

      {statistics.length > 0 ? (
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div className="no-data">Нет данных для отображения графика за выбранный период</div>
      )}

      <table className="orders-table">
        <thead>
          <tr>
            <th>№ Заказа</th>
            <th>Клиент</th>
            <th>Дата заказа</th>
            <th>Сумма</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map((order) => (
            <tr key={order.orderId}>
              <td>
                <Link to={`/orders/${order.orderId}`} className="order-link">
                  {order.orderId}
                </Link>
              </td>
              <td>{order.userName || 'Неизвестный'}</td>
              <td>{new Date(order.orderDate).toLocaleDateString('ru-RU')}</td>
              <td>{order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'} BYN</td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                  className="status-select"
                >
                  {Object.keys(statusLabels).map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="order-report-pagination-wrapper">
          <ul className="order-report-pagination">
            <li
              className={`order-report-pagination__item ${currentPage === 1 ? 'order-report-disabled' : ''}`}
              onClick={() => currentPage > 1 && paginate(currentPage - 1)}
            >
              <span className="order-report-pagination__link">{'<'}</span>
            </li>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <li
                key={num}
                className="order-report-pagination__item"
                onClick={() => paginate(num)}
              >
                <span className={`order-report-pagination__link ${currentPage === num ? 'order-report-active' : ''}`}>
                  {num}
                </span>
              </li>
            ))}

            <li
              className={`order-report-pagination__item ${currentPage === totalPages ? 'order-report-disabled' : ''}`}
              onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
            >
              <span className="order-report-pagination__link">{'>'}</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default OrderReport;