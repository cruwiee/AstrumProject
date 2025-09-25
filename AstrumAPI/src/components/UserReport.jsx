// import React, { useState, useEffect } from 'react';
// import './UserReport.css';

// const UserReport = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await fetch('http://localhost:5000/api/users/report', {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });

//         if (response.status === 403) {
//           throw new Error('Доступ запрещен. Требуются права администратора');
//         }

//         const data = await response.json();
//         console.log('Данные о пользователях:', data);
//         setUsers(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsers();
//   }, []);

//   const handleExport = async (format) => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         throw new Error('Токен авторизации отсутствует');
//       }

//       const response = await fetch(`http://localhost:5000/api/users/report/export?format=${format}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Ошибка при экспорте данных');
//       }

//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `users_report.${format}`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//     } catch (err) {
//       console.error('Ошибка при экспорте:', err);
//       setError(err.message);
//     }
//   };

//   if (loading) return <div>Загрузка...</div>;
//   if (error) return <div>Ошибка: {error}</div>;
//   if (!Array.isArray(users)) return <div>Ошибка: Данные о пользователях некорректны</div>;

//   return (
//     <div className="report-container"> {/* Общий контейнер для всего */}
//         <div className="title">
//             <h2>Отчет о пользователях</h2>
//             <div className="export-buttons">
//                 <button onClick={() => handleExport('csv')}>Выгрузить в CSV</button>
//                 <button onClick={() => handleExport('xlsx')}>Выгрузить в Excel</button>
//             </div>
//         </div>
//         {users.length > 0 ? (
//             <table className="users-table">
//                 <thead>
//                     <tr>
//                         <th>Имя</th>
//                         <th>Email</th>
//                         <th>Дата регистрации</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {users.map(user => (
//                         <tr key={user.firstName}> 
//                             <td>{user.firstName}</td>
//                             <td>{user.email}</td>
//                             <td>{new Date(user.registrationDate).toLocaleDateString()}</td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         ) : (
//             <p>Нет данных о пользователях</p>
//         )}
//     </div>
// );
// };

// export default UserReport;


import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './UserReport.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const UserReport = () => {
  const [userStats, setUserStats] = useState([]); // Для таблицы по пользователям
  const [graphStats, setGraphStats] = useState([]); // Для графика
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
      await Promise.all([fetchUserStats(), fetchGraphStats()]);
      setLoading(false);
    };

    loadData();
  }, [startDate, endDate]);

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
    setError(null);
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;
    if (startDate && value < startDate) {
      setError('Конечная дата не может быть раньше начальной');
    } else {
      setEndDate(value);
      setError(null);
    }
  };

  // Данные для графика
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

      {graphStats.length > 0 ? (
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div className="no-data">Нет данных для графика за выбранный период</div>
      )}

      {userStats.length > 0 ? (
        <table className="user-stats-table">
          <thead>
            <tr>
              <th>Имя пользователя</th>
              <th>Количество купленных товаров</th>
            </tr>
          </thead>
          <tbody>
            {userStats.map(stat => (
              <tr key={stat.userId}>
                <td>{stat.firstName}</td>
                <td>{stat.itemCount} шт.</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-data">Нет данных о покупках за выбранный период</div>
      )}
    </div>
  );
};

export default UserReport;