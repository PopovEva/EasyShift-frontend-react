import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  tokens: {
    access: localStorage.getItem('access_token') || null,
    refresh: localStorage.getItem('refresh_token') || null,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      console.log('User data received:', action.payload);
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
