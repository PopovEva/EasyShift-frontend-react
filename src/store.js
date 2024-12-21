import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';

// Конфигурация хранилища
const store = configureStore({
  reducer: {
    user: userReducer, // Редюсер пользователя
  },
});

export default store;
