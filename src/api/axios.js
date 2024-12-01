import axios from 'axios';

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
    if (error.response && error.response.status === 401 && !originalRequest._retry && refreshToken) {
      originalRequest._retry = true; // Пометка для предотвращения зацикливания
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
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error); // Обрабатываем остальные ошибки
  }
);

export default API;
