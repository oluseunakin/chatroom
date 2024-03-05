import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

const roomnameSlice = createSlice({
  name: "roomname",
  reducers: {
    enterRoom: (state, action) => {
      return action.payload;
    },
    leaveRoom: (state) => {
      return -1;
    },
  },
  initialState: -1,
});

export const { enterRoom, leaveRoom } = roomnameSlice.actions;

export const getRoom = (state: RootState) => state.roomname;

export default roomnameSlice.reducer;
