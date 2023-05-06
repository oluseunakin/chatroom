import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import type { Room } from "../../type";

const roomAdapter = createEntityAdapter<Room>({selectId: model =>model.name })

const initialState = roomAdapter.getInitialState()

const roomSlice = createSlice({name: 'rooms', reducers: {
    joinRoom: roomAdapter.setOne,
    setMyRooms: roomAdapter.setMany,
    reset: () => initialState
}, initialState})

export const {joinRoom, setMyRooms, reset} = roomSlice.actions

export const getARoom = (state: RootState, roomname: string) => state.rooms.entities[roomname]

export const getMyRooms = (state: RootState) => state.rooms

export default roomSlice.reducer