import React, { useContext } from 'react';
import UserContext from '../context/UserContext';

function ProductDetails() {
  const { user } = useContext(UserContext);
  const { addToCart } = useContext(CartContext);

  const handleAddToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.error('Пользователь не авторизован');
      return;
    }

    try {
      await addToCart(productId, quantity);
      toast.success('Товар добавлен в корзину!');
    } catch (error) {
      console.error('Ошибка при добавлении товара в корзину:', error);
      toast.error('Произошла ошибка при добавлении товара в корзину');
    }
  };

}