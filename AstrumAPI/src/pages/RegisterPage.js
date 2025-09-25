import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import CartContext from "../context/CartContext";
import "./RegisterForm.css";
// import bcrypt from 'bcryptjs';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(CartContext);

  const [userData, setUserData] = useState({
    firstName: "",
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

    try {

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FirstName: userData.firstName,
          Email: userData.email,
          Password: userData.password,
          PasswordHash: userData.password  // Изменяем "password" на "passwordHash"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Ошибка регистрации");
      } else {
        login(data.user, data.token);
        navigate("/login");
      }
    } catch (error) {
      setError("Ошибка сервера");
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <form className="auth-form" onSubmit={handleRegister}>
      <h2>Регистрация</h2>
      <input
        type="text"
        name="firstName"
        placeholder="Имя"
        value={userData.firstName}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={userData.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Пароль"
        value={userData.password}
        onChange={handleChange}
        required
      />
      <input
        type="tel"
        name="phone"
        placeholder="Телефон"
        value={userData.phone}
        onChange={handleChange}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Загрузка..." : "Зарегистрироваться"}
      </button>
      {error && <p className="error">{error}</p>}

      <p className="have-account">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </form>
  );
};

export default RegisterPage;
