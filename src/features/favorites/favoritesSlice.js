import { createSlice } from "@reduxjs/toolkit";

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: {
    ids: [],
    pets: []
  },
  reducers: {
    setFavorites: (state, action) => {
      state.pets = action.payload;
      state.ids = action.payload.map((pet) => pet._id);
    }
  }
});

export const { setFavorites } = favoritesSlice.actions;
export const selectFavoriteIds = (state) => state.favorites.ids;
export const selectFavoritePets = (state) => state.favorites.pets;
export default favoritesSlice.reducer;
