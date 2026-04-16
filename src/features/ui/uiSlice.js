import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    activeView: "pets",
    notice: ""
  },
  reducers: {
    setActiveView: (state, action) => {
      state.activeView = action.payload;
    },
    setNotice: (state, action) => {
      state.notice = action.payload;
    },
    clearNotice: (state) => {
      state.notice = "";
    }
  }
});

export const { setActiveView, setNotice, clearNotice } = uiSlice.actions;
export const selectActiveView = (state) => state.ui.activeView;
export const selectNotice = (state) => state.ui.notice;
export default uiSlice.reducer;
