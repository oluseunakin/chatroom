import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";

const initialState = { laiver: "", isLive: false, type: "going" };

const liveSlice = createSlice({
  name: "live",
  initialState,
  reducers: {
    setLive: (state, action) => action.payload,
  },
});

export const {setLive} = liveSlice.actions

export const getLive = (state: RootState) => state.live

export default liveSlice.reducer