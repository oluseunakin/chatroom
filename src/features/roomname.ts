import { createSlice } from "@reduxjs/toolkit";

const roomnameSlice = createSlice({name: 'roomname', reducers: {
    setRoomname: (state, action) => action.payload 
}, initialState: ''})

export const {setRoomname} = roomnameSlice.actions

export default roomnameSlice.reducer