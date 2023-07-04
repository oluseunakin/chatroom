import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import type { User } from "../../type";

const initialState = {
  name: "",
  id: -1,
  status: false
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => action.payload,
    reset: () => initialState,
  },
});

export const getUser = (state: RootState) => {
  return state.user;
};

export const { setUser, reset } = userSlice.actions;

export default userSlice.reducer;
