import { createSlice } from "@reduxjs/toolkit";

const storedAuth = localStorage.getItem("adoptly-auth");

const initialState = storedAuth
  ? JSON.parse(storedAuth)
  : { token: "", user: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem("adoptly-auth", JSON.stringify(action.payload));
    },
    updateCurrentUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("adoptly-auth", JSON.stringify({ token: state.token, user: state.user }));
    },
    logout: (state) => {
      state.token = "";
      state.user = null;
      localStorage.removeItem("adoptly-auth");
    }
  }
});

export const { setCredentials, updateCurrentUser, logout } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export const selectCurrentUser = (state) => state.auth.user;
export default authSlice.reducer;
