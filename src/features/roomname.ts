import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

const roomnameSlice = createSlice({
  name: "roomname",
  reducers: {
    enterRoom: (state, action) => {
      return {
        id: action.payload,
        entered: [...state.entered, action.payload],
      };
    },
    leaveRoom: ( state ) => {
      return {...state, id: -1}
    }
  },
  initialState: { id: -1, entered: Array<number>() },
});

export const { enterRoom, leaveRoom } = roomnameSlice.actions;

export const getRoom = (state: RootState) => state.roomname

export default roomnameSlice.reducer;
