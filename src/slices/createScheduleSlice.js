import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/axios';

// Начальное состояние
const initialState = {
  startDate: '',
  shifts: ['בוקר', 'ערב'], // Значения по умолчанию
  rooms: [],
  selectedRooms: [],
  schedule: [],
  error: null,
  loading: false,
};

// Асинхронное действие для получения списка комнат
export const fetchRooms = createAsyncThunk('createSchedule/fetchRooms', async (_, thunkAPI) => {
  try {
    const branchId = sessionStorage.getItem('branch_id');
    if (!branchId) throw new Error('Branch ID is missing');
    
    const response = await API.get(`/branches/${branchId}/rooms/`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue('Failed to fetch rooms');
  }
});

// Слайс
const createScheduleSlice = createSlice({
  name: 'createSchedule',
  initialState,
  reducers: {
    setStartDate: (state, action) => {
      state.startDate = action.payload;
    },
    setShifts: (state, action) => {
      state.shifts = action.payload;
    },
    setSelectedRooms: (state, action) => {
      state.selectedRooms = action.payload;
    },
    setSchedule: (state, action) => {
      state.schedule = action.payload;
    },
    updateEmployee: (state, action) => {
      const { dayIndex, shiftIndex, roomIndex, employee } = action.payload;
      state.schedule[dayIndex].shifts[shiftIndex].rooms[roomIndex].employee = employee;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Экспортируем действия
export const { setStartDate, setShifts, setSelectedRooms, setSchedule, updateEmployee } =
  createScheduleSlice.actions;

// Экспортируем редьюсер
export default createScheduleSlice.reducer;
