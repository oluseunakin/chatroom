import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import type{ User } from "..//..//type";

const initialState: {
  receiver: User;
  showChat: boolean;
} = {
  receiver: {name: "", id: -1},
  showChat: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChat: (state, action) => state = action.payload,
    setShowChat: (state, action) => ({...state, showChat: action.payload}),
    reset: () => initialState
  },
});

export const getReceiver = (state: RootState) => state.chat.receiver;

export const getShowChat = (state: RootState) => state.chat.showChat;

export const { setChat, reset, setShowChat } = chatSlice.actions;

export default chatSlice.reducer;
