// import { createContext, useState, useEffect } from "react";
// import { toast } from "react-toastify";

// const AppContext = createContext();

// export const AppProvider = ({ children }) => {
//   // Состояние для корзины
//   const [cartItems, setCartItems] = useState([]);

//   // Состояние для пользователя
//   const [user, setUser] = useState(null);

//   // Проверяем, есть ли пользователь в localStorage при загрузке
//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   // Функция авторизации
//   const login = (userData) => {
//     setUser(userData);
//     localStorage.setItem("user", JSON.stringify(userData));
//   };
  

  

//   // Функция выхода
//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem("user");
//   };

//   // Добавление товара в корзину
//   const addToCart = (product) => {
//     setCartItems((prevItems) => {
//       const existingItem = prevItems.find((item) => item.id === product.id);
//       if (existingItem) {
//         return prevItems.map((item) =>
//           item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
//         );
//       } else {
//         return [...prevItems, { ...product, quantity: 1 }];
//       }
//     });

//     toast.success(`${product.title} добавлено в корзину!`);
//   };

//   // Изменение количества товаров
//   const updateQuantity = (productId, quantity) => {
//     setCartItems((prevItems) =>
//       prevItems.map((item) =>
//         item.id === productId ? { ...item, quantity } : item
//       )
//     );
//   };

//   // Удаление товара из корзины
//   const removeFromCart = (productId) => {
//     setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
//   };

//   return (
//     <AppContext.Provider value={{ user, login, logout, cartItems, addToCart, updateQuantity, removeFromCart }}>
//       {children}
//     </AppContext.Provider>
//   );
// };
import React, { createContext, useState } from 'react';
import { toast } from 'react-toastify';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                
                return [...prevItems, { ...product, quantity: 1 }];
            }
        });

       
        toast.success(`${product.title} добавлено в корзину!`);
    };

    const updateQuantity = (productId, quantity) => {
        setCartItems((prevItems) =>
            prevItems.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const removeFromCart = (productId) => {
        setCartItems((prevItems) => prevItems.filter(item => item.id !== productId));
    };

    return (
        <AppContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart }}>
            {children}
        </AppContext.Provider>
    );
};





export default AppContext;
