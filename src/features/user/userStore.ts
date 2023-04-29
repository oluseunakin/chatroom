import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../store";

const userSlice = createSlice({
  name: "user",
  initialState: "",
  reducers: {
    setUser: (state, action) => action.payload,
    reset: () => "",
  },
});
export const getUser = (state: RootState) => {
  return state.user;
};

export const { setUser, reset } = userSlice.actions;

export default userSlice.reducer;
