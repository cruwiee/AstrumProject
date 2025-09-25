// import React, { useState, useEffect } from 'react';
// import './OrderReport.css';

// const OrderReport = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await fetch('http://localhost:5000/api/orders/report', {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });

//         if (response.status === 403) {
//           throw new Error('Доступ запрещен. Требуются права администратора');
//         }

//         const data = await response.json();
//         setOrders(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);

//   const handleStatusChange = async (orderId, newStatus) => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         throw new Error('Токен авторизации отсутствует');
//       }

//       const response = await fetch(`http://localhost:5000/api/orders/update-status/${orderId}`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ status: newStatus })
//       });

//       if (!response.ok) {
//         throw new Error('Ошибка при обновлении статуса');
//       }

//       setOrders((prevOrders) =>
//         prevOrders.map((order) =>
//           order.orderId === orderId ? { ...order, status: newStatus } : order
//         )
//       );
//     } catch (err) {
//       console.error('Ошибка при обновлении статуса:', err);
//       setError(err.message);
//     }
//   };

//   const handleExport = async (format) => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         throw new Error('Токен авторизации отсутствует');
//       }

//       const response = await fetch(`http://localhost:5000/api/orders/report/export?format=${format}`, {
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
//       a.download = `orders_report.${format}`;
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
//   if (!Array.isArray(orders)) return <div>Ошибка: Данные от сервера некорректны</div>;

//   return (
//     <div className="report-container">
//       <div className="title">
//         <h2>Отчет о заказах</h2>
//         <div className="export-buttons">
//           <button onClick={() => handleExport('csv')}>Выгрузить в CSV</button>
//           <button onClick={() => handleExport('xlsx')}>Выгрузить в Excel</button>
//         </div>
//       </div>
//       <table className="orders-table">
//         <thead>
//           <tr>
//             <th>№ Заказа</th>
//             <th>Клиент</th>
//             <th>Дата заказа</th>
//             <th>Сумма</th>
//             <th>Статус</th>
//           </tr>
//         </thead>
//         <tbody>
//           {orders.map(order => (
//             <tr key={order.orderId}>
//               <td>{order.orderId}</td>
//               <td>{order.userName}</td>
//               <td>{new Date(order.orderDate).toLocaleDateString()}</td>
//               <td>{order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'} BYN</td>
//               <td>
//                 <select
//                   value={order.status}
//                   onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
//                   className="status-select"
//                 >
//                   <option value="new">Новый</option>
//                   <option value="processing">В обработке</option>
//                   <option value="completed">Завершен</option>
//                 </select>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default OrderReport;


import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './OrderReport.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const OrderReport = () => {
  const [orders, setOrders] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Токен авторизации отсутствует');
        }
        const query = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : '';
        const response = await fetch(`http://localhost:5000/api/orders/report${query}`, {
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
          throw new Error('Данные от сервера некорректны');
        }
        setOrders(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Токен авторизации отсутствует');
        }
        const query = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : '';
        const response = await fetch(`http://localhost:5000/api/orders/report/statistics${query}`, {
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
        setStatistics(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchOrders(), fetchStatistics()]);
      setLoading(false);
    };

    loadData();
  }, [startDate, endDate]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен авторизации отсутствует');
      }

      const response = await fetch(`http://localhost:5000/api/orders/update-status/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении статуса');
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error('Ошибка при обновлении статуса:', err);
      setError(err.message);
    }
  };

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен авторизации отсутствует');
      }

      const query = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}&format=${format}` : `?format=${format}`;
      const response = await fetch(`http://localhost:5000/api/orders/report/export${query}`, {
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
      a.download = `orders_report.${format}`;
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

  // Валидация дат
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
    labels: statistics.map(stat => new Date(stat.date).toLocaleDateString('ru-RU')),
    datasets: [
      {
        label: 'Количество заказов',
        data: statistics.map(stat => stat.orderCount),
        fill: false,
        borderColor: '#5e54b2', // Фиолетовый
        backgroundColor: '#5e54b2',
        pointBackgroundColor: '#5e54b2',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#5e54b2',
        tension: 0.4, // Плавные изгибы линии
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
      duration: 1500, // Длительность анимации (1.5 секунды)
      easing: 'easeOutCubic', // Плавная анимация
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
          color: '#fff', // Белый текст
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Динамика заказов за выбранный период',
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
          label: (context) => `Заказов: ${context.parsed.y}`
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
          color: 'rgb(95, 95, 95)' // Полупрозрачная белая сетка
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
          text: 'Количество заказов',
          font: {
            size: 14,
            family: 'Arial, sans-serif',
            weight: 'bold'
          },
          color: '#fff'
        },
        grid: {
          color: 'rgb(95, 95, 95)'
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
      animationDuration: 300 // Плавная анимация при наведении
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;
  if (!Array.isArray(orders)) return <div className="error">Ошибка: Данные от сервера некорректны</div>;

  return (
    <div className="report-container">
      <div className="title">
        <h2>Отчет о заказах</h2>
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
          {orders.map(order => (
            <tr key={order.orderId}>
              <td>{order.orderId}</td>
              <td>{order.userName}</td>
              <td>{new Date(order.orderDate).toLocaleDateString('ru-RU')}</td>
              <td>{order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'} BYN</td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                  className="status-select"
                >
                  <option value="new">Новый</option>
                  <option value="processing">В обработке</option>
                  <option value="completed">Завершен</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderReport;