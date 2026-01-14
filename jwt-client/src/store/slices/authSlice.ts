import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Создаем экземпляр axios с interceptors для автоматического обновления токенов
const api = axios.create({
  baseURL: "http://localhost:3005",
  withCredentials: true,
});

// Флаг для предотвращения множественных одновременных запросов на refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor для обработки 401 ошибок и автоматического обновления токенов
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Если refresh не удался, пользователь не авторизован
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Логин
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/sign-in", credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Ошибка входа");
    }
  }
);

// Регистрация
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/sign-up", credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Ошибка регистрации"
      );
    }
  }
);

// Проверка авторизации
export const checkAuth = createAsyncThunk(
  "auth/check",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/me");
      return response.data;
    } catch (error: any) {
      return rejectWithValue("Не авторизован");
    }
  }
);

// Выход
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await api.post("/logout");
      dispatch(logout()); // Очищаем состояние в Redux
      return { message: "Logged out successfully" };
    } catch (error: any) {
      // Даже если запрос не удался, все равно очищаем локальное состояние
      dispatch(logout());
      return rejectWithValue(error.response?.data?.error || "Ошибка выхода");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type.endsWith("/pending") && !action.type.includes("check"),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/fulfilled") && action.type.includes("login"),
        (state, action) => {
          state.isLoading = false;
          state.isAuthenticated = true;
          state.user = action.payload.user;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/fulfilled") && action.type.includes("register"),
        (state, action) => {
          state.isLoading = false;
          state.isAuthenticated = true;
          state.user = action.payload.user;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/fulfilled") && action.type.includes("check"),
        (state, action) => {
          state.isAuthenticated = true;
          state.user = action.payload.user;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
          state.isAuthenticated = false;
          state.user = null;
        }
      );
  },
});

export const { clearError, logout } = authSlice.actions;
export default authSlice.reducer;
