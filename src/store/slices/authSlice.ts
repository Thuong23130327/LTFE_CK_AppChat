import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  username: string | null;
  reLoginCode: string | null;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  username: localStorage.getItem("username") || null,
  reLoginCode: localStorage.getItem("reLoginCode") || null,
  isAuthenticated: false,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ username: string; reLoginCode: string }>
    ) => {
      state.username = action.payload.username;
      state.reLoginCode = action.payload.reLoginCode;
      state.isAuthenticated = true;
      state.error = null;

      localStorage.setItem("username", action.payload.username);
      localStorage.setItem("reLoginCode", action.payload.reLoginCode);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      // Ram
      state.username = null;
      state.reLoginCode = null;
      state.isAuthenticated = false;
      state.error = null;
      // o cung
      localStorage.removeItem("username");
      localStorage.removeItem("reLoginCode");
    },
  },
});

export const { loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;

