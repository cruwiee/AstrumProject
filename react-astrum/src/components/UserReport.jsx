import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './UserReport.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const UserReport = () => {
  const [userStats, setUserStats] = useState([]);
  const [filteredUserStats, setFilteredUserStats] = useState([]);
  const [graphStats, setGraphStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Токен авторизации отсутствует');
        }
        const query = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : '';
        const response = await fetch(`http://localhost:5000/api/users/report/user-stats${query}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 403) {
          throw new Error('Доступ запрещен. Требуются права администратора');
        }
        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Данные статистики некорректны');
        }
        setUserStats(data);
        setFilteredUserStats(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchGraphStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Токен авторизации отсутствует');
        }
        const query = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : '';
        const response = await fetch(`http://localhost:5000/api/users/report/statistics${query}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 403) {
          throw new Error('Доступ запрещен. Требуются права администратора');
        }
        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Данные статистики некорректны');
        }
        setGraphStats(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const loadData = async () => {
      setLoading(true);
      setError(null);
      setCurrentPage(1);
      try {
        await Promise.all([fetchUserStats(), fetchGraphStats()]);
      } catch (err) {
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

    const filtered = userStats.filter((stat) =>
      (stat.firstName || '').toLowerCase().includes(query) ||
      stat.itemCount.toString().includes(query)
    );
    setFilteredUserStats(filtered);
  };

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен авторизации отсутствует');
      }

      const query = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}&format=${format}` : `?format=${format}`;
      const response = await fetch(`http://localhost:5000/api/users/report/export${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при экспорте данных');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_stats_report.${format}`;
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
    setFilteredUserStats(userStats);
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
  const currentItems = filteredUserStats.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUserStats.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const chartData = {
    labels: graphStats.map(stat => new Date(stat.date).toLocaleDateString('ru-RU')),
    datasets: [
      {
        label: 'Количество проданных товаров',
        data: graphStats.map(stat => stat.itemCount),
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
        pointHoverRadius: 8
      },
      {
        label: 'Количество новых пользователей',
        data: graphStats.map(stat => stat.userCount),
        fill: false,
        borderColor: '#b300b3',
        backgroundColor: '#b300b3',
        pointBackgroundColor: '#b300b3',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#b300b3',
        tension: 0.4,
        borderWidth: 4,
        pointRadius: 5,
        pointHoverRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeOutCubic',
      onComplete: () => {
        console.log('Animation complete');
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: 'Arial, sans-serif'
          },
          color: '#fff',
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Статистика товаров и пользователей',
        font: {
          size: 20,
          family: 'Arial, sans-serif',
          weight: 'bold'
        },
        color: '#fff',
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: '#5e54b2',
        titleFont: {
          size: 14,
          family: 'Arial, sans-serif'
        },
        bodyFont: {
          size: 12,
          family: 'Arial, sans-serif'
        },
        padding: 10,
        cornerRadius: 4,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y}`
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Дата',
          font: {
            size: 14,
            family: 'Arial, sans-serif',
            weight: 'bold'
          },
          color: '#fff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#fff',
          font: {
            size: 12,
            family: 'Arial, sans-serif'
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Количество',
          font: {
            size: 14,
            family: 'Arial, sans-serif',
            weight: 'bold'
          },
          color: '#fff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#fff',
          font: {
            size: 12,
            family: 'Arial, sans-serif'
          },
          beginAtZero: true,
          stepSize: 1
        }
      }
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
      axis: 'x'
    },
    hover: {
      animationDuration: 300
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="report-container">
      <div className="title">
        <h2>Статистика товаров и пользователей</h2>
        <div className="header-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Поиск по имени или количеству товаров..."
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

      {graphStats.length > 0 ? (
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div className="no-data">Нет данных для графика за выбранный период</div>
      )}

      {filteredUserStats.length > 0 ? (
        <>
          <table className="user-stats-table">
            <thead>
              <tr>
                <th>Имя пользователя</th>
                <th>Количество купленных товаров</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(stat => (
                <tr key={stat.userId}>
                  <td>{stat.firstName}</td>
                  <td>{stat.itemCount} шт.</td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="user-report-pagination-wrapper">
              <ul className="user-report-pagination">
                <li
                  className={`user-report-pagination__item ${currentPage === 1 ? 'user-report-disabled' : ''}`}
                  onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                >
                  <span className="user-report-pagination__link">{'<'}</span>
                </li>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <li
                    key={num}
                    className="user-report-pagination__item"
                    onClick={() => paginate(num)}
                  >
                    <span className={`user-report-pagination__link ${currentPage === num ? 'user-report-active' : ''}`}>
                      {num}
                    </span>
                  </li>
                ))}

                <li
                  className={`user-report-pagination__item ${currentPage === totalPages ? 'user-report-disabled' : ''}`}
                  onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                >
                  <span className="user-report-pagination__link">{'>'}</span>
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

export default UserReport;