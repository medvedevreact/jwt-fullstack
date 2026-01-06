import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  registerUser,
  clearError,
} from "../../store/slices/authSlice";
import type { RootState, AppDispatch } from "../../store/store";
import "./Auth.css";

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      if (isLogin) {
        await dispatch(loginUser(formData)).unwrap();
      } else {
        await dispatch(registerUser(formData)).unwrap();
      }

      navigate("/");
    } catch (error) {
      console.error("Auth failed:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitch = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      password: "",
    });
    dispatch(clearError());
  };

  const goToHome = () => {
    navigate("/");
  };

  return (
    <div className="auth-page">
      <button className="home-link" onClick={goToHome}>
        ← На главную
      </button>

      <div className="auth-card">
        <div className="auth-tabs">
          <button
            className={`tab ${isLogin ? "active" : ""}`}
            onClick={handleSwitch}
          >
            Вход
          </button>
          <button
            className={`tab ${!isLogin ? "active" : ""}`}
            onClick={handleSwitch}
          >
            Регистрация
          </button>
        </div>

        <h1>{isLogin ? "Вход в аккаунт" : "Создание аккаунта"}</h1>

        {error && <div className="message error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              required
            />
          </div>

          <div className="input-group">
            <label>Пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
            />
            {!isLogin && (
              <small className="password-hint">Минимум 6 символов</small>
            )}
          </div>

          <button type="submit" className="submit-btn">
            {isLoading ? "..." : isLogin ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? "Нет аккаунта? " : "Уже есть аккаунт? "}
          <button className="switch-btn" onClick={handleSwitch}>
            {isLogin ? "Зарегистрироваться" : "Войти"}
          </button>
        </div>
      </div>
    </div>
  );
};
