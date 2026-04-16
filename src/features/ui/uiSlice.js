import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    activeView: "pets",
    activeParams: null,
    notice: ""
  },
  reducers: {
    setActiveView: (state, action) => {
      state.activeView = action.payload.view || action.payload;
      state.activeParams = action.payload.params || null;
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
export const selectActiveParams = (state) => state.ui.activeParams;
export const selectNotice = (state) => state.ui.notice;
export default uiSlice.reducer;
