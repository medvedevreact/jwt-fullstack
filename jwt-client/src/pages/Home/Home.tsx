import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { checkAuth, logoutUser } from "../../store/slices/authSlice";
import type { RootState, AppDispatch } from "../../store/store";
import "./Home.css";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    // Проверяем авторизацию при загрузке страницы
    dispatch(checkAuth());
  }, [dispatch]);

  const goToAuth = () => {
    navigate("/auth");
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="home-page">
      <div className="home-card">
        <div className={`status ${isAuthenticated ? "auth" : "not-auth"}`}>
          Статус: {isAuthenticated ? "авторизован" : "не авторизован"}
        </div>

        <h1>
          {isAuthenticated
            ? `Добро пожаловать, ${user?.email}!`
            : "Требуется авторизация"}
        </h1>

        <p>
          {isAuthenticated
            ? "Вы успешно вошли в систему."
            : "Для доступа к приложению необходимо войти в систему"}
        </p>

        <button onClick={isAuthenticated ? handleLogout : goToAuth}>
          {isAuthenticated
            ? "Выйти"
            : "Перейти к авторизации →"}
        </button>

        {isAuthenticated && (
          <div className="user-info">
            <h3>Информация о пользователе:</h3>
            <p>Email: {user?.email}</p>
          </div>
        )}
      </div>
    </div>
  );
};
