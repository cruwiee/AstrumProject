import React, { useContext } from 'react';
import UserContext from '../context/UserContext'; // Импортируем контекст пользователя

function ProductDetails() {
  const { user } = useContext(UserContext); // Получаем текущего пользователя
  const { addToCart } = useContext(CartContext); // Получаем функцию добавления в корзину

  const handleAddToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.error('Пользователь не авторизован');
      return;
    }

    try {
      await addToCart(productId, quantity); // Используем функцию из контекста
      toast.success('Товар добавлен в корзину!');
    } catch (error) {
      console.error('Ошибка при добавлении товара в корзину:', error);
      toast.error('Произошла ошибка при добавлении товара в корзину');
    }
  };

  // Остальной код компонента...
}