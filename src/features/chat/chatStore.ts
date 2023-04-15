import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { Message } from "../../type";

const initialState: {
  receiver: string;
  showChat: boolean;
} = {
  receiver: "",
  showChat: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChat: (state, action) => state = action.payload,
    reset: () => initialState
  },
});

export const getReceiver = (state: RootState) => state.chat.receiver;

export const getShowChat = (state: RootState) => state.chat.showChat;

export const { setChat, reset } = chatSlice.actions;

export default chatSlice.reducer;
