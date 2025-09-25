
// import React, { useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import CartContext from "../context/CartContext"; // Контекст авторизации
// import "./RegisterForm.css";

// const RegisterPage = () => {
//   const navigate = useNavigate();
//   const { login } = useContext(CartContext); // Получаем функцию login из контекста

//   const [userData, setUserData] = useState({
//     FirstName: "",
//     Email: "",
//     Password: "",
//     Phone: "",
//   });

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Обработчик изменений в инпутах
//   const handleChange = (e) => {
//     setUserData({ ...userData, [e.target.name]: e.target.value });
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
  
//     try {
//       const response = await fetch("http://localhost:5000/api/auth/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(userData),
//       });
  
//       const data = await response.json();
  
//       if (!response.ok) {
//         throw new Error(data.message || "Ошибка регистрации");
//       }
  
//       // ✅ Сохраняем токен и данные пользователя
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user));
  
//       // ✅ Логиним пользователя через контекст
//       login(data.user, data.token);
  
//       // ✅ Перенаправляем в профиль
//       navigate("/profile");
  
//     } catch (error) {
//       setError(error.message || "Ошибка сервера");
//     } finally {
//       setLoading(false);
//     }
//   };
  

//   return (
//     <div className="register-container">
//       <form className="auth-form" onSubmit={handleRegister}>
//         <h2>Регистрация</h2>
//         <input 
//           className="register-input"
//           type="text"
//           name="firstName"
//           placeholder="Имя"
//           value={userData.firstName}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={userData.email}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="password"
//           name="password"
//           placeholder="Пароль"
//           value={userData.password}
//           onChange={handleChange}
//           required
//         />
//         <input
//          className="register-input"
//           type="text"
//           name="phone"
//           placeholder="Телефон (необязательно)"
//           value={userData.phone}
//           onChange={handleChange}
//         />
//         <button type="submit" disabled={loading}>
//           {loading ? "Загрузка..." : "Зарегистрироваться"}
//         </button>
//         {error && <p className="error">{error}</p>}
//       </form>
//     </div>
//   );
// };

// export default RegisterPage;

import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom"; // Добавляем Link для перехода на страницу входа
import CartContext from "../context/CartContext";
import "./RegisterForm.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(CartContext);

  const [userData, setUserData] = useState({
    firstName: "", // Исправлено с FirstName на firstName (для соответствия API)
    email: "",
    password: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ошибка регистрации");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      login(data.user, data.token);
      navigate("/profile");
    } catch (error) {
      setError(error.message || "Ошибка сервера");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <form className="auth-form" onSubmit={handleRegister}>
          <h2>РЕГИСТРАЦИЯ</h2>
          <input
            className="register-input"
            type="text"
            name="firstName"
            placeholder="Имя пользователя"
            value={userData.firstName}
            onChange={handleChange}
            required
          />
          <input
            className="register-input"
            type="email"
            name="email"
            placeholder="Почта"
            value={userData.email}
            onChange={handleChange}
            required
          />
          <input
            className="register-input"
            type="password"
            name="password"
            placeholder="Пароль"
            value={userData.password}
            onChange={handleChange}
            required
          />
          <div className="checkbox-container">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">
              Вы соглашаетесь на использование персональных данных
            </label>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Загрузка..." : "ЗАРЕГИСТРИРОВАТЬСЯ"}
          </button>
          {error && <p className="error">{error}</p>}
          <p className="login-link">
            У вас есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </form>
      </div>
      <div className="welcome-section">
        <h1>ДОБРО ПОЖАЛОВАТЬ!</h1>
      </div>
    </div>
  );
};

export default RegisterPage;