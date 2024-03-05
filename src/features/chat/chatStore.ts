import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import type { User } from "..//..//type";

const initialState: {
  receiver: User;
} = {
  receiver: { name: "", id: -1 },
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChat: (state, action) => (state = action.payload),
    setReceiver: (state, action) => ({...state, receiver: action.payload}),
    reset: () => initialState,
  },
});

export const getReceiver = (state: RootState) => state.chat.receiver;

export const { setChat, reset, setReceiver } = chatSlice.actions;

export default chatSlice.reducer;
