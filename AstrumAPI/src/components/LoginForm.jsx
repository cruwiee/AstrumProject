// import React, { useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import CartContext from "../context/CartContext";
// import "./LoginForm.css";

// const LoginForm = () => {
//   const navigate = useNavigate();
//   const { login } = useContext(CartContext);
//   const [userData, setUserData] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setUserData({ ...userData, [e.target.name]: e.target.value });
//   };

//   const handleLogin = async (e) => {
 

//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     console.log("Отправляемые данные:", userData); // Проверяем входные данные


//     try {
//       const response = await fetch("http://localhost:5000/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(userData),
//       });

//       const data = await response.json();
//       console.log("Ответ от сервера:", response.status);


//       console.log("Отправляемые данные:", userData);
//       console.log("Ответ от сервера:", response);
//       console.log("JSON-ответ:", data);

//       if (!response.ok) {
//         throw new Error(data.message || "Ошибка входа");
//       }

//       login(data.user, data.token);
//       navigate("/profile");

//     } catch (error) {
//       setError(error.message || "Ошибка сервера");
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
//     </form>
//   );
// };

// export default LoginForm;

import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import CartContext from "../context/CartContext";
import "./LoginForm.css";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useContext(CartContext);
  const [userData, setUserData] = useState({ email: "", password: "" });
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
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ошибка входа");
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

export default LoginForm;