import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './ConversionReport.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ConversionReport = () => {
  const [statistics, setStatistics] = useState([]);
  const [filteredStatistics, setFilteredStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Токен авторизации отсутствует');

        const query = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : '';
        const response = await fetch(`http://localhost:5000/api/conversion/report${query}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 403) throw new Error('Доступ запрещен. Требуются права администратора');
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Данные статистики некорректны');
        setStatistics(data);
        setFilteredStatistics(data);
        setCurrentPage(1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [startDate, endDate]);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setCurrentPage(1);

    const filtered = statistics.filter((stat) =>
      new Date(stat.date).toLocaleDateString('ru-RU').toLowerCase().includes(query) ||
      stat.visits.toString().includes(query) ||
      stat.orders.toString().includes(query) ||
      stat.conversionRate.toFixed(2).toString().includes(query)
    );
    setFilteredStatistics(filtered);
  };

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Токен авторизации отсутствует');

      const query = startDate && endDate
        ? `?startDate=${startDate}&endDate=${endDate}&format=${format}`
        : `?format=${format}`;

      const response = await fetch(`http://localhost:5000/api/conversion/report/export${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Ошибка при экспорте данных');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversion_report.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Ошибка при экспорте:', err);
      setError(err.message);
    }
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setFilteredStatistics(statistics);
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStatistics = filteredStatistics.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStatistics.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const chartData = {
    labels: filteredStatistics.map(stat => new Date(stat.date).toLocaleDateString('ru-RU')),
    datasets: [
      {
        label: 'Конверсия покупок (%)',
        data: filteredStatistics.map(stat => stat.conversionRate),
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
          font: { size: 14, family: 'Montserrat, sans-serif' },
          color: '#fff',
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Конверсия веб-приложения',
        font: {
          size: 20,
          family: 'Montserrat, sans-serif',
          weight: 'bold',
        },
        color: '#fff',
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: '#5e54b2',
        titleFont: { size: 14, family: 'Montserrat, sans-serif' },
        bodyFont: { size: 12, family: 'Montserrat, sans-serif' },
        padding: 10,
        cornerRadius: 4,
        callbacks: {
          label: (context) => `Конверсия: ${context.parsed.y.toFixed(2)}%`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Дата',
          font: { size: 14, family: 'Montserrat, sans-serif', weight: 'bold' },
          color: '#fff',
        },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: {
          color: '#fff',
          font: { size: 12, family: 'Montserrat, sans-serif' },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Конверсия (%)',
          font: { size: 14, family: 'Montserrat, sans-serif', weight: 'bold' },
          color: '#fff',
        },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: {
          color: '#fff',
          font: { size: 12, family: 'Montserrat, sans-serif' },
          beginAtZero: true,
          callback: (value) => `${value}%`,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
      axis: 'x',
    },
    hover: { animationDuration: 300 },
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="report-container">
      <div className="title">
        <h2>Отчет о конверсии</h2>
        <div className="header-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Поиск по дате, посещениям, заказам..."
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

      {filteredStatistics.length > 0 ? (
        <>
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
          <table className="conversion-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Посещения</th>
                <th>Заказы</th>
                <th>Конверсия (%)</th>
              </tr>
            </thead>
            <tbody>
              {currentStatistics.map(stat => (
                <tr key={stat.date}>
                  <td>{new Date(stat.date).toLocaleDateString('ru-RU')}</td>
                  <td>{stat.visits}</td>
                  <td>{stat.orders}</td>
                  <td>{stat.conversionRate.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
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
        <div className="no-data">Нет данных, соответствующих критериям поиска</div>
      )}
    </div>
  );
};

export default ConversionReport;