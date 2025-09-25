import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import './CanceledOrdersReport.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = 'http://localhost:5000';

const fetchCanceledOrdersReport = async (startDate, endDate) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Токен авторизации отсутствует');
    }
    const response = await axios.get(`${API_URL}/api/orders/report/canceled`, {
      params: {
        startDate: startDate ? startDate.toISOString() : '',
        endDate: endDate ? endDate.toISOString() : '',
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке отчета по отмененным заказам:', error);
    throw new Error(error.response?.data?.message || 'Ошибка сервера');
  }
};

const CanceledOrdersReport = () => {
  const [data, setData] = useState({
    orders: [],
    statistics: { canceledByDate: [], totalCanceledOrders: 0, totalCanceledAmount: 0 },
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); 

  const fetchReport = async () => {
    setIsLoading(true);
    setCurrentPage(1); 
    try {
      const result = await fetchCanceledOrdersReport(
        startDate ? new Date(startDate) : null,
        endDate ? new Date(endDate) : null
      );
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен авторизации отсутствует');
      }
      const query = startDate && endDate
        ? `?startDate=${startDate}&endDate=${endDate}&format=${format}`
        : `?format=${format}`;

      const response = await fetch(`${API_URL}/api/orders/report/canceled/export${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка при экспорте данных: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `canceled_orders_report.${format}`;
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
    setError(null);
    setCurrentPage(1); 
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;
    if (startDate && value < startDate) {
      setError('Конечная дата не может быть раньше начальной');
    } else {
      setEndDate(value);
      setError(null);
      setCurrentPage(1); 
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = data?.orders?.slice(indexOfFirstItem, indexOfLastItem) || [];
  const totalPages = Math.ceil((data?.orders?.length || 0) / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const chartData = {
    labels: data?.statistics?.canceledByDate?.map((item) =>
      new Date(item.date).toLocaleDateString('ru-RU')
    ) || [],
    datasets: [
      {
        label: 'Количество отмененных заказов',
        data: data?.statistics?.canceledByDate?.map((item) => item.count) || [],
        backgroundColor: '#5e54b2',
        borderColor: '#5e54b2',
        borderWidth: 1,
      },
      {
        label: 'Сумма отмененных заказов (BYN)',
        data: data?.statistics?.canceledByDate?.map((item) => item.amount) || [],
        backgroundColor: '#948cdf',
        borderColor: '#948cdf',
        borderWidth: 1,
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
        text: 'Статистика отмененных заказов',
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
          label: (context) => `${context.dataset.label}: ${context.parsed.y}`,
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
          text: 'Значение',
          font: { size: 14, family: 'Arial, sans-serif', weight: 'bold' },
          color: '#fff',
        },
        grid: { color: 'rgb(95, 95, 95)' },
        ticks: {
          color: '#fff',
          font: { size: 12, family: 'Arial, sans-serif' },
          beginAtZero: true,
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

  if (isLoading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="report-container">
      <div className="title">
        <h2>Отчет по отмененным заказам</h2>
        <div className="export-buttons">
          <button onClick={() => handleExport('csv')}>Экспорт в CSV</button>
          <button onClick={() => handleExport('xlsx')}>Экспорт в Excel</button>
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

      {data?.statistics?.canceledByDate?.length > 0 ? (
        <div className="chart-container">
          <Bar data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div className="no-data">Нет данных для отображения графика за выбранный период</div>
      )}

      <div className="summary-stats">
        <h4>Общая статистика</h4>
        <p>Всего отмененных заказов: {data?.statistics?.totalCanceledOrders || 0}</p>
        <p>Общая сумма отмен: {data?.statistics?.totalCanceledAmount || 0} BYN</p>
      </div>

      <table className="orders-table">
        <thead>
          <tr>
            <th>№ заказа</th>
            <th>Дата</th>
            <th>Сумма (BYN)</th>
            <th>Товары</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.length > 0 ? (
            currentOrders.map((order) => (
              <tr key={order.orderId}>
                <td>{order.orderId}</td>
                <td>{new Date(order.orderDate).toLocaleDateString('ru-RU')}</td>
                <td>{order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</td>
                <td>
                  {order.orderItems?.map((item, index) => (
                    <div key={index}>
                      {item.productName} ({item.quantity} шт. × {item.unitPrice} BYN)
                    </div>
                  ))}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">Нет отмененных заказов за выбранный период.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination controls */}
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

    </div>
  );
};

export default CanceledOrdersReport;