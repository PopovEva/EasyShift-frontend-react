import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axios";
import { toast } from 'react-toastify';

// Fetch available weeks
export const fetchAvailableWeeks = createAsyncThunk(
  "schedule/fetchAvailableWeeks",
  async ({ branchId, statuses = ["draft", "approved"] }, { rejectWithValue }) => {
    try {
      const response = await API.get(`/available-weeks/${branchId}`, {
        params: { status: statuses },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch schedules
export const fetchSchedules = createAsyncThunk(
  "schedule/fetchSchedules",
  async ({ branchId, week, status }, { rejectWithValue }) => {
    try {
      console.log("Fetching schedules:", { branchId, week, status });
      const response = await API.get(`/get-schedule/${branchId}/${status}`, {
        params: { week_start_date: week },
      });
      return response.data;
    } catch (error) {
      console.error("Fetch schedules error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update schedules in DB
export const updateSchedulesInDB = createAsyncThunk(
  "schedule/updateSchedules",
  async ({ branchId, schedules }, { rejectWithValue }) => {
    try {
      const response = await API.post("/update-schedule/", {
        branch_id: branchId,
        schedules,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Approve schedules in DB
export const approveSchedulesInDB = createAsyncThunk(
  "schedule/approveSchedules",
  async ({ branchId, schedules, status }, { rejectWithValue }) => {
    try {
      const response = await API.post("/update-schedule/", {
        branch_id: branchId,
        schedules,
        status,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteScheduleByWeek = createAsyncThunk(
  "schedule/deleteScheduleByWeek",
  async ({ branchId, weekStartDate }, { rejectWithValue }) => {
    try {
      await API.delete(`/schedules/delete-by-week/`, {
        params: { branch_id: branchId, week_start_date: weekStartDate },
      });
      return weekStartDate; // Возвращаем дату удаленной недели
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice definition
const scheduleSlice = createSlice({
  name: "schedule",
  initialState: {
    schedules: [],
    availableWeeks: [],
    selectedWeek: "",
    error: null,
    loading: false,
  },
  reducers: {
    setSelectedWeek(state, action) {
      state.selectedWeek = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableWeeks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableWeeks.fulfilled, (state, action) => {
        state.loading = false;
        state.availableWeeks = action.payload;
        if (action.payload.length > 0) {
          const sortedWeeks = [...action.payload].sort((a, b) => new Date(a) - new Date(b));
          const today = new Date();
          const weeksBeforeToday = sortedWeeks.filter((week) => new Date(week) <= today);
          const defaultWeek =
            weeksBeforeToday.length > 0
              ? weeksBeforeToday[weeksBeforeToday.length - 1]
              : sortedWeeks[0];
          state.selectedWeek = defaultWeek;
        }
      })
      .addCase(fetchAvailableWeeks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        console.log("Schedules fetched:", action.payload);
        state.loading = false;
        state.schedules = action.payload;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSchedulesInDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSchedulesInDB.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateSchedulesInDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(approveSchedulesInDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveSchedulesInDB.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(approveSchedulesInDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteScheduleByWeek.fulfilled, (state, action) => {
        state.schedules = state.schedules.filter(schedule => schedule.week_start_date !== action.payload);
        state.availableWeeks = state.availableWeeks.filter(week => week !== action.payload);
        toast.success("Schedule for the week deleted successfully!");
      })
      .addCase(deleteScheduleByWeek.rejected, (state, action) => {
        state.error = action.payload;
        toast.error("Failed to delete schedule for the week.");
      });
  },
});

export const { setSelectedWeek } = scheduleSlice.actions;
export default scheduleSlice.reducer;
