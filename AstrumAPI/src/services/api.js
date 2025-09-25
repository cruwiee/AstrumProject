import axios from "axios";

export const API_URL = "http://localhost:5000/api"; // Базовый URL API

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


// Обновить количество товара в корзине
export const updateCartItem = async (cartId, quantity) => {
  try {
    await api.put(`/cart/${cartId}`, { quantity });
  } catch (error) {
    throw new Error(error.response?.data?.message || "Ошибка при обновлении корзины");
  }
};

// Удалить товар из корзины
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
    return response.data; // Возвращаем данные корзины
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return []; // Если корзина не найдена, возвращаем пустой массив
    }
    throw new Error("Ошибка при получении корзины");
  }
};
// import axios from "axios";
// export const API_URL = "http://localhost:5000/api"; // Адрес API


// const api = axios.create({
//   baseURL: API_URL,
//   headers: { "Content-Type": "application/json" },
// });



// // Получить все заказы
// export const getOrders = async () => {
//   try {
//     const response = await api.get("/orders");
//     return response.data;
//   } catch (error) {
//     console.error("Ошибка при получении заказов:", error);
//     throw error;
//   }
// };

// // Создать новый заказ
// export const createOrder = async (orderData) => {
//   try {
//     const response = await api.post("/orders", orderData);
//     return response.data;
//   } catch (error) {
//     console.error("Ошибка при создании заказа:", error);
//     throw error;
//   }
// };

// // Обновить статус заказа
// export const updateOrderStatus = async (orderId, status) => {
//   try {
//     await api.put(`/orders/${orderId}/status`, { status }, {
//       headers: { "Content-Type": "application/json" },
//     });
    
//   } catch (error) {
//     console.error("Ошибка при обновлении статуса заказа:", error);
//     throw error;
//   }
// };

// // Авторизация
// export const loginUser = async (credentials) => {
//   try {
//     const response = await api.post("/auth/login", credentials);
//     return response.data;
//   } catch (error) {
//     console.error("Ошибка при авторизации:", error);
//     return { success: false, message: "Ошибка сети" };
//   }
// };

// // Регистрация
// export const registerUser = async (userData) => {
//   try {
//     const response = await api.post("/auth/register", userData);

//     return response.data;
//   } catch (error) {
//     console.error("Ошибка при регистрации:", error);
//     throw error;
//   }
// };


// export const addToCart = async (userId, productId, quantity, token) => {
//   if (!userId) {
//     console.error("Ошибка: пользователь не авторизован!");
//     return;
//   }
//   if (!productId || quantity <= 0) {
//     console.error("Ошибка: некорректные данные для добавления в корзину:", { productId, quantity });
//     return;
//   }

//   try {
//     const response = await axios.post(
//       `${API_URL}/cart`,
//       { userId, productId, quantity }, // Исправлено с UserId на userId
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     console.log("Товар успешно добавлен в корзину:", response.data);
//     return response.data.cartItems; // Возвращаем обновленные данные корзины
//   } catch (error) {
//     console.error("Ошибка при добавлении товара в корзину:", error.response?.data || error.message);
//     throw error;
//   }
// };



// export const apiAddToCart = async (data) => {
  
//   try {
    
//     const response = await axios.post('http://localhost:5000/api/cart', data); 
//     // Убедитесь, что URL правильный
//     return response.data;
//   } catch (error) {
//     console.error('Ошибка при добавлении товара в корзину:', error);
//     throw error;
//   }
// };



// // Обновить количество товара в корзине
// export const updateCartItem = async (cartId, quantity) => {
//   try {
//     await api.put(`/cart/${cartId}`, { quantity });
//   } catch (error) {
//     console.error("Ошибка при обновлении корзины:", error);
//     throw error;
//   }
// };

// // Удалить товар из корзины
// export const removeFromCart = async (cartId) => {
//   try {
//     await api.delete(`/cart/${cartId}`);
//   } catch (error) {
//     console.error("Ошибка при удалении из корзины:", error);
//     throw error;
//   }
// };

// // Получить товары в корзине
// export const getCartItems = async (userId) => {
//   try {
//     console.log("Запрос на корзину для пользователя:", userId);
//     const response = await axios.get(`${API_URL}/cart/${userId}`);
//     console.log("Ответ от API:", response.data); // ✅ Логируем ответ после получения
//     return response.data;
//   } catch (error) {
//     console.error("Ошибка при получении корзины:", error.response?.data || error.message);
//     throw error;
//   }
// };
