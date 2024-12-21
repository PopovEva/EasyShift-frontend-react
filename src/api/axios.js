import axios from 'axios';
import { toast } from 'react-toastify';

// Создаем экземпляр Axios
const API = axios.create({
  baseURL: 'http://localhost:8000/api/', // Убедитесь, что ваш API доступен по этому адресу
});

// Интерсептор запросов для добавления токена
API.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token'); // Получаем токен из localStorage
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`; // Добавляем заголовок авторизации
    }
    return config;
  },
  (error) => {
    toast.error('Ошибка при отправке запроса!'); // Показываем уведомление об ошибке
    return Promise.reject(error); // Обрабатываем ошибки в запросе
  }
);

// Интерсептор ответов для обработки ошибок 401 (Unauthorized)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem('refresh_token');

    // Если токен истек и есть refresh-токен
    if (error.response) {
      // Обработка ошибки 401 (Unauthorized)
      if (error.response.status === 401 && !originalRequest._retry && refreshToken) {
        originalRequest._retry = true;
      try {
        // Обновляем access-токен
        const response = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken,
        });
        localStorage.setItem('access_token', response.data.access); // Сохраняем новый access-токен
        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
        return API(originalRequest); // Повторяем исходный запрос с новым токеном
      } catch (refreshError) {
        localStorage.removeItem('access_token'); // Удаляем старые токены
        localStorage.removeItem('refresh_token');
        window.location.href = '/'; // Перенаправляем на страницу логина
        toast.error('Сессия истекла. Пожалуйста, войдите снова.');
        return Promise.reject(refreshError);
      }
    }
    // Обработка других ошибок
    if (error.response.status === 403) {
      toast.error('Доступ запрещен!');
    } else if (error.response.status === 500) {
      toast.error('Ошибка сервера!');
    } else {
      toast.error(`Ошибка: ${error.response.data.detail || 'Произошла ошибка'}`);
    }
  } else {
    // Обработка сетевых ошибок
    toast.error('Ошибка соединения с сервером.');
  }

    return Promise.reject(error); // Обрабатываем остальные ошибки
  }
);

export default API;
