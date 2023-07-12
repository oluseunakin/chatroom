import { EntityState, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type { Room } from "../../type";
import { RootState } from "../../store";

const roomAdapter = createEntityAdapter<Room>();

const initialState = roomAdapter.getInitialState();

const roomSlice = createSlice({
  name: "rooms",
  reducers: {
    setRoom: roomAdapter.setOne,
    setMyRooms: roomAdapter.setMany,
    reset: roomAdapter.removeAll,
  },
  initialState,
});

export const { setMyRooms, reset, setRoom } = roomSlice.actions;

export const { selectAll: getMyRooms } =
  roomAdapter.getSelectors((state: RootState) => state.rooms);

export default roomSlice.reducer;
