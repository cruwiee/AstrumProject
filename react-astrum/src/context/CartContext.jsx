import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { API_URL, getCartItems, addToCart, updateCartItem, removeFromCart } from '../services/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Для отслеживания загрузки профиля/корзины
  const validItems = Array.isArray(cartItems) ? cartItems : [];

  

  // Загрузка корзины из localStorage или сервера
  const initializeCart = useCallback(async () => {
    if (!user || !user.userId) {
      // Если пользователь не авторизован, используем localStorage
      try {
        const savedCart = JSON.parse(localStorage.getItem('cartItems'));
        if (Array.isArray(savedCart) && savedCart.length > 0) {
          setCartItems(savedCart);
          console.log('Корзина загружена из localStorage:', savedCart);
        }
      } catch (error) {
        console.error('Ошибка при разборе корзины из localStorage:', error);
        localStorage.removeItem('cartItems'); 
      }
      return;
    }

    // Если пользователь авторизован, загружаем корзину с сервера
    try {
      setIsLoading(true);
      console.log('Загружаем корзину с сервера для userId:', user.userId);
      const cartItemsFromServer = await getCartItems(user.userId);
      setCartItems(cartItemsFromServer);
      localStorage.setItem('cartItems', JSON.stringify(cartItemsFromServer));
     
    } catch (error) {
      console.error('Ошибка при загрузке корзины:', error);
      toast.error('Не удалось загрузить корзину');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  

  // Сохранение корзины в localStorage
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      console.log('Корзина сохранена в localStorage:', cartItems);
    } else {
      localStorage.removeItem('cartItems');
      console.log('Корзина очищена в localStorage');
    }
  }, [cartItems]);

  // Восстановление user и token из хранилища
  useEffect(() => {
    const restoreSession = () => {
      try {
        const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
        const storedToken = sessionStorage.getItem('token') || localStorage.getItem('token');

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          console.log('Сессия восстановлена:', JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Ошибка при восстановлении сессии:', error);
        logout();
      }
    };

    restoreSession();
  }, []);

  // Получение профиля пользователя
  const fetchUserProfile = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('token', token);
        console.log('Профиль пользователя загружен:', data);
      } else {
        console.warn('Ошибка профиля:', data);
        logout();
        toast.error('Сессия истекла. Пожалуйста, войдите снова');
      }
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error);
      logout();
      toast.error('Ошибка авторизации');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Загрузка профиля при наличии токена
  useEffect(() => {
    if (token && !user) {
      fetchUserProfile();
    }
  }, [token, fetchUserProfile]);

  // Синхронизация корзины при изменении пользователя
  useEffect(() => {
    if (user && user.userId) {
      initializeCart();
    }
  }, [user, initializeCart]);

  useEffect(() => {
  if (user) return; 
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
}, [cartItems, user]);


  // Добавление товара в корзину
  const handleAddToCart = async (userId, productId, quantity) => {
    if (!userId) {
      toast.error('Войдите в аккаунт, чтобы добавить товар в корзину');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, productId, quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Ошибка сервера: ${response.status}`);
      }

      const updatedCart = await response.json();
      setCartItems(updatedCart);
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));
      toast.success('Товар добавлен в корзину');
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      toast.error(error.message || 'Не удалось добавить товар');
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление количества товара
  const handleUpdateQuantity = async (cartId, quantity) => {
    if (!user || !user.userId) {
      toast.error('Войдите в аккаунт, чтобы обновить корзину');
      return;
    }

    try {
      setIsLoading(true);
      await updateCartItem(cartId, quantity);
      const updatedCart = await getCartItems(user.userId);
      setCartItems(updatedCart);
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));
      toast.success('Количество обновлено');
    } catch (error) {
      console.error('Ошибка при обновлении количества:', error);
      toast.error('Не удалось обновить количество');
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление товара из корзины
  const handleRemoveFromCart = async (cartId) => {
    if (!user || !user.userId) {
      toast.error('Войдите в аккаунт, чтобы удалить товар');
      return;
    }

    try {
      setIsLoading(true);
      await removeFromCart(cartId);
      const updatedCart = await getCartItems(user.userId);
      setCartItems(updatedCart);
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));
      toast.success('Товар удалён из корзины');
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      toast.error('Не удалось удалить товар');
    } finally {
      setIsLoading(false);
    }
  };

  // Очистка корзины
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
    toast.info('Корзина очищена');
  };

  // Вход в систему
  const login = (userData, token) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('token', token);
    toast.success('Регистрация успешна!');
    console.log('Пользователь вошел:', userData);
  };

  // Выход из системы
  const logout = () => {
    setUser(null);
    setToken('');
    setCartItems([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cartItems');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    toast.info('Вы вышли из системы');
  };

  // Проверка авторизации
  const isAuthenticated = () => !!user && !!token;

  const contextValue = useMemo(
    () => ({
      cartItems,
      setCartItems,
      user,
      token,
      isAuthenticated,
      login,
      logout,
      fetchUserProfile,
      addToCart: handleAddToCart,
      updateQuantity: handleUpdateQuantity,
      removeFromCart: handleRemoveFromCart,
      clearCart,
      isLoading,
    }),
    [cartItems, user, token, isLoading]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

export default CartContext;

