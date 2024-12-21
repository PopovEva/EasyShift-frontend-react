import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, // Информация о пользователе
  tokens: {
    access: null,
    refresh: null,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.tokens = { access: null, refresh: null };
    },
    setTokens: (state, action) => {
      state.tokens = action.payload;
    },
  },
});

export const { setUser, clearUser, setTokens } = userSlice.actions;

export default userSlice.reducer;
