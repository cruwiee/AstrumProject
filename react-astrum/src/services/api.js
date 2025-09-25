import axios from "axios";

export const API_URL = "http://localhost:5000/api"; 

// Создаем экземпляр Axios с базовыми настройками
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Получить все заказы
export const getOrders = async () => {
  try {
    const response = await api.get("/orders");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Ошибка при получении заказов");
  }
};

// Создать новый заказ
export const createOrder = async (orderData) => {
  try {
    const response = await api.post("/orders", orderData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Ошибка при создании заказа");
  }
};

// Обновить статус заказа
export const updateOrderStatus = async (orderId, status) => {
  try {
    await api.put(`/orders/${orderId}`, { status });
  } catch (error) {
    throw new Error(error.response?.data?.message || "Ошибка при обновлении статуса заказа");
  }
};

// Авторизация
export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Ошибка при авторизации");
  }
};

// Регистрация
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Ошибка при регистрации");
  }
};

export const addToCart = async (userId, productId, quantity) => {
  try {
      const response = await fetch("http://localhost:5000/api/cart", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, productId, quantity }),
      });

      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ошибка: ${response.status} - ${errorText}`);
      }

      return await response.json();
  } catch (error) {
      console.error("Ошибка добавления товара в корзину:", error);
      throw error;
  }
};


export const updateCartItem = async (cartId, quantity) => {
  try {
    await api.put(`/cart/${cartId}`, { quantity });
  } catch (error) {
    throw new Error(error.response?.data?.message || "Ошибка при обновлении корзины");
  }
};

export const removeFromCart = async (cartId) => {
  try {
    await api.delete(`/cart/${cartId}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Ошибка при удалении из корзины");
  }
};

// Получить товары в корзине
export const getCartItems = async (userId) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/cart/${userId}`);
    return response.data; 
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return []; // Если корзина не найдена, возвращаем пустой массив
    }
    throw new Error("Ошибка при получении корзины");
  }
};

export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Токен авторизации отсутствует');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Ошибка: ${response.status}`);
  }
  return await response.json();
};
