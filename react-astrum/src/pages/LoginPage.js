import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import CartContext from "../context/CartContext";
import "./LoginForm.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const cartContext = useContext(CartContext) || {};
  const { login } = cartContext;

  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => {
    const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return re.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(userData.email)) {
      setError("Введите корректный email");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FirstName: "Имя",
          Email: userData.email,
          Password: userData.password,
          PasswordHash: userData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ошибка входа");
      }

      localStorage.setItem("token", data.token);
      navigate("/profile");
    } catch (error) {
      setError(error.message || "Ошибка сервера");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="welcomeback-section">
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
          <div className="password-input-container">
            <input
              className="login-input"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Пароль"
              value={userData.password}
              onChange={handleChange}
              required
            />
            <span className="password-toggle-icon" onClick={toggleShowPassword}>
              {showPassword ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#5e54b2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#5e54b2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </span>
          </div>
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





  




      
         





