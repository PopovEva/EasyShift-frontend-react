import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import scheduleReducer from './slices/scheduleSlice';
import createScheduleReducer from './slices/createScheduleSlice';

// Конфигурация хранилища
const store = configureStore({
  reducer: {
    user: userReducer, // Редюсер пользователя
    schedule: scheduleReducer,
    createSchedule: createScheduleReducer,
  },
});

export default store;
