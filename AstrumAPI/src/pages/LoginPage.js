import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import CartContext from "../context/CartContext";
import "./LoginForm.css";
// import bcrypt from 'bcryptjs'; // ❌ Убираем, так как не используется
// import useAuthRedirect from "../hooks/useAuthRedirect";

const LoginPage = () => {
  // useAuthRedirect(); // ❌ Отключим временно, если оно ломает страницу
  const navigate = useNavigate();
  const cartContext = useContext(CartContext) || {};
const { login } = cartContext;


  // Проверяем, что контекст доступен
  if (!cartContext) {
    console.error("Ошибка: CartContext не доступен!");
  }

  // const { login } = cartContext || {}; // Проверяем, есть ли `login`, чтобы не было ошибки
  

  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FirstName: "Имя", // 👈 Возможно, сервер требует FirstName при логине
          Email: userData.email,
          Password: userData.password,
          PasswordHash: userData.password, 
        }),
      });

      const data = await response.json();
      console.log("Ответ от сервера:", data); // ✅ Для отладки

      if (!response.ok) {
        throw new Error(data.message || "Ошибка входа");
      }

      localStorage.setItem("token", data.token);
      navigate("/profile");
    } catch (error) {
      console.error("Ошибка при входе:", error);
      setError(error.message || "Ошибка сервера");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="welcome-section">
        <h1>ДОБРО ПОЖАЛОВАТЬ!</h1>
      </div>
      <div className="login-container">
        <form className="auth-form" onSubmit={handleLogin}>
          <h2>ВХОД</h2>
          <input
            className="login-input"
            type="email"
            name="email"
            placeholder="Почта"
            value={userData.email}
            onChange={handleChange}
            required
          />
          <input
            className="login-input"
            type="password"
            name="password"
            placeholder="Пароль"
            value={userData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Загрузка..." : "ВОЙТИ"}
          </button>
          {error && <p className="error">{error}</p>}
          <p className="register-link">
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </form>
      </div>
    </div>
  );
};
export default LoginPage;


// import React, { useState, useContext } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import CartContext from "../context/CartContext";
// import "./AuthForm.css";
// import bcrypt from 'bcryptjs';
// import useAuthRedirect from "../hooks/useAuthRedirect";

// const LoginPage = () => {
//   useAuthRedirect();
//   const navigate = useNavigate();
//   const { login } = useContext(CartContext);

//   const [userData, setUserData] = useState({
//     email: "",
//     password: "",
//   });

  

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setUserData({ ...userData, [e.target.name]: e.target.value });
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
      
//       const response = await fetch("http://localhost:5000/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           // FirstName: userData.email,
//           Email: userData.email,
//           Password: userData.password,  // ✅ Отправляем Обычный пароль
         
//           // PasswordHash: userData.password  // Изменяем "password" на "passwordHash"
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setError(data.message || "Ошибка входа");
//       } else {
//         localStorage.setItem("token", data.token); // ✅ Сохраняем токен
//         navigate("/profile"); // ✅ Переход на профиль
//       }
//     } catch (error) {
//       setError("Ошибка сервера");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form className="auth-form" onSubmit={handleLogin}>
//       <h2>Вход</h2>
//       <input
//         type="email"
//         name="email"
//         placeholder="Email"
//         value={userData.email}
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="password"
//         name="password"
//         placeholder="Пароль"
//         value={userData.password}
//         onChange={handleChange}
//         required
//       />
//       <button type="submit" disabled={loading}>
//         {loading ? "Загрузка..." : "Войти"}
//       </button>
//       {error && <p className="error">{error}</p>}

//       <p className="no-account">
//         Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
//       </p>
//     </form>
//   );
// };

// export default LoginPage;
