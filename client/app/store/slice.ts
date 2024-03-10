import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store/store";

// Define the Country data type
interface Country {
  name: string;
  // ... other country properties
}

// Define the Redux slice's state type
interface CountryState {
  selectedCountry: Country | null;
}

// Initial state
const initialState: CountryState = {
  selectedCountry: null,
};

export const countrySlice = createSlice({
  name: "country",
  initialState,
  reducers: {
    setSelectedCountry: (state, action: PayloadAction<Country>) => {
      state.selectedCountry = action.payload;
    },
  },
});

export const { setSelectedCountry } = countrySlice.actions;

export const selectCountry = (state: RootState) =>
  state.country.selectedCountry;

export default countrySlice.reducer;
