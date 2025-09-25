import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import CartContext from "../context/CartContext";
import "./RegisterForm.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(CartContext);

  const [userData, setUserData] = useState({
    firstName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 12);
    let result = "+";

    if (digits.startsWith("375")) {
      result += "375";
      if (digits.length > 3) result += " " + digits.slice(3, 5);
      if (digits.length > 5) result += " " + digits.slice(5, 8);
      if (digits.length > 8) result += " " + digits.slice(8, 10);
      if (digits.length > 10) result += " " + digits.slice(10, 12);
    } else {
      result += digits;
    }

    return result;
  };

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        return value.trim() ? "" : "Имя обязательно";
      case "email":
        if (!value.trim()) return "Email обязателен";
        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value))
          return "Некорректный формат email";
        return "";
      case "password":
        return value.trim() ? "" : "Пароль обязателен";
      case "phone":
        if (!value.trim()) return "Телефон обязателен";
        if (!/^\+375 \d{2} \d{3} \d{2} \d{2}$/.test(value))
          return "Формат: +375 XX XXX XX XX";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "phone" ? formatPhoneNumber(value) : value;

    setUserData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, newValue),
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const newErrors = {};
    Object.entries(userData).forEach(([key, value]) => {
      const err = validateField(key, value);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FirstName: userData.firstName,
          Email: userData.email,
          Password: userData.password,
          PasswordHash: userData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Ошибка регистрации");
      } else {
        login(data.user, data.token);
        navigate("/login");
      }
    } catch (err) {
      setError("Ошибка сервера");
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
            className={`register-input ${errors.firstName ? "input-error" : ""}`}
            type="text"
            name="firstName"
            placeholder="Имя"
            value={userData.firstName}
            onChange={handleChange}
            required
          />
          {errors.firstName && <p className="error">{errors.firstName}</p>}

          <input
            className={`register-input ${errors.email ? "input-error" : ""}`}
            type="email"
            name="email"
            placeholder="Email"
            value={userData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <div className="password-input-container">
            <input
              className={`register-input ${errors.password ? "input-error" : ""}`}
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
          {errors.password && <p className="error">{errors.password}</p>}

          <input
            className={`register-input ${errors.phone ? "input-error" : ""}`}
            type="tel"
            name="phone"
            placeholder="Телефон"
            value={userData.phone}
            onChange={handleChange}
            required
          />
          {errors.phone && <p className="error">{errors.phone}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Загрузка..." : "ЗАРЕГИСТРИРОВАТЬСЯ"}
          </button>

          {error && <p className="error">{error}</p>}

          <p className="have-account">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </form>
      </div>
      <div className="welcome-section">
        <h1>ПРИСОЕДИНЯЙТЕСЬ!</h1>
      </div>
    </div>
  );
};

export default RegisterPage;
