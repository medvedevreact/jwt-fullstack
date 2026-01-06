import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../store/store";
import "./Home.css";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const goToAuth = () => {
    navigate("/auth");
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

        <button onClick={goToAuth}>
          {isAuthenticated
            ? "Перейти в личный кабинет →"
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
