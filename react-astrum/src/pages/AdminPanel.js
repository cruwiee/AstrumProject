import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import AddProductForm from '../components/AddProductForm.jsx';
import EditProductForm from '../components/EditProductForm.jsx';
import DeleteProductForm from '../components/DeleteProductForm.jsx';
import UserReport from '../components/UserReport.jsx';
import OrderReport from '../components/OrderReport.jsx';
import ConversionReport from '../components/ConversionReport.jsx';
import CanceledOrdersReport from '../components/CanceledOrdersReport.jsx';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [products, setProducts] = useState([]);
  const [userReportData, setUserReportData] = useState([]);
  const [orderReportData, setOrderReportData] = useState([]);
  const [conversionReportData, setConversionReportData] = useState([]);
  const [canceledOrdersReportData, setCanceledOrdersReportData] = useState({});

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Требуется авторизация');
      const response = await fetch('http://localhost:5000/api/products', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Ошибка загрузки товаров');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const fetchUserReport = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Требуется авторизация');
      const response = await fetch('http://localhost:5000/api/users/report', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      if (!response.ok) throw new Error('Ошибка загрузки отчета');
      const data = await response.json();
      setUserReportData(data);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const fetchOrderReport = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      const response = await fetch('http://localhost:5000/api/orders/report', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ошибка загрузки отчета о заказах: ${errorData.message || response.statusText}`);
      }
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      const data = await response.json();
      setOrderReportData(data);
    } catch (error) {
      console.error('Fetch Order Report Error:', error);
      alert(error.message);
    }
  };

  const fetchConversionReport = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      const response = await fetch('http://localhost:5000/api/conversion/report', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      if (!response.ok) throw new Error('Ошибка загрузки отчета о конверсии');
      const data = await response.json();
      setConversionReportData(data);
    } catch (error) {
      console.error('Fetch Conversion Report Error:', error);
      alert(error.message);
    }
  };

  const fetchCanceledOrdersReport = async (startDate, endDate) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      const query = startDate && endDate
        ? `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        : '';
      const response = await fetch(`http://localhost:5000/api/orders/canceled/report${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      if (!response.ok) throw new Error('Ошибка загрузки отчета по отмененным заказам');
      const data = await response.json();
      setCanceledOrdersReportData(data);
    } catch (error) {
      console.error('Fetch Canceled Orders Report Error:', error);
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <>
      <Header />
      <div className="admin-panel">
        <h2>Панель администратора</h2>
        <div className="tabs">
          <Link
            to="#"
            onClick={() => setActiveTab('add')}
            className={activeTab === 'add' ? 'active' : ''}
          >
            Добавить товар
          </Link>
          <Link
            to="#"
            onClick={() => setActiveTab('edit')}
            className={activeTab === 'edit' ? 'active' : ''}
          >
            Редактировать товар
          </Link>
          <Link
            to="#"
            onClick={() => setActiveTab('delete')}
            className={activeTab === 'delete' ? 'active' : ''}
          >
            Удалить товар
          </Link>
          <Link
            to="#"
            onClick={() => setActiveTab('userReport')}
            className={activeTab === 'userReport' ? 'active' : ''}
          >
            Отчет о пользователях
          </Link>
          <Link
            to="#"
            onClick={() => setActiveTab('orderReport')}
            className={activeTab === 'orderReport' ? 'active' : ''}
          >
            Отчет о заказах
          </Link>
          <Link
            to="#"
            onClick={() => setActiveTab('conversionReport')}
            className={activeTab === 'conversionReport' ? 'active' : ''}
          >
            Отчет о конверсии
          </Link>
          <Link
            to="#"
            onClick={() => setActiveTab('canceledOrdersReport')}
            className={activeTab === 'canceledOrdersReport' ? 'active' : ''}
          >
            Отчет по отмененным заказам
          </Link>
        </div>
        <div className="tab-content">
          {activeTab === 'add' && <AddProductForm onProductAdded={fetchProducts} />}
          {activeTab === 'edit' && <EditProductForm products={products} onProductUpdated={fetchProducts} />}
          {activeTab === 'delete' && <DeleteProductForm products={products} onProductDeleted={fetchProducts} />}
          {activeTab === 'userReport' && <UserReport data={userReportData} fetchUserReport={fetchUserReport} />}
          {activeTab === 'orderReport' && <OrderReport data={orderReportData} fetchOrderReport={fetchOrderReport} />}
          {activeTab === 'conversionReport' && <ConversionReport data={conversionReportData} fetchConversionReport={fetchConversionReport} />}
          {activeTab === 'canceledOrdersReport' && (
            <CanceledOrdersReport
              data={canceledOrdersReportData}
              fetchCanceledOrdersReport={fetchCanceledOrdersReport}
            />
          )}
        </div>
      </div>
      {}
    </>
  );
};

export default AdminPanel;