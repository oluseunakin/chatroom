import { EntityState, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type { Room } from "../../type";
import { RootState } from "../../store";

const initialState: {myRooms: Room[], joinedRooms: Room[]} = {myRooms: [], joinedRooms: []}

const roomSlice = createSlice({initialState, reducers: {
  setMyRooms: (state, action) => ({...state, myRooms: action.payload}),
  setJoinedRooms: (state, action) => ({...state, joinedRooms: action.payload})
}, name: "rooms"})

export const {setJoinedRooms, setMyRooms} = roomSlice.actions

export const getMyRooms = (state: RootState) => state.rooms.myRooms

export const getJoinedRooms = (state: RootState) => state.rooms.joinedRooms

export default roomSlice.reducer;
