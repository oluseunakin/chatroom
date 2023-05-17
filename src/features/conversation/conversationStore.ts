import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { Conversation } from "../../type";

const conversationAdapter = createEntityAdapter<Conversation>();

const initialState = conversationAdapter.getInitialState({
  newConversation: {
    id: -1,
    message: { text: "", createdAt: "", senderId: 0, senderName: "" },
    talker: { name: "", id: -1 },
    agree: Array<number>(),
    disagree: Array<number>(),
    room: { id: -1, name: "" },
  },
  room: { id: -1, name: "" },
});

const conversationSlice = createSlice({
  initialState,
  reducers: {
    setConversations: conversationAdapter.setMany,
    setConversationRoom: (state, action) => ({
      ...state,
      room: action.payload,
    }),
    setNewConversation: (state, action) => ({...state, newConversation: action.payload}),
    reset: () => initialState,
    agree: (state, action) => {
      const { userid, id } = action.payload;
      const oldAgree = state.entities[id]?.agree;
      if (oldAgree) {
        if (oldAgree.includes(userid)) {
          const index = oldAgree.findIndex((val) => val === userid);
          oldAgree.splice(index, 1);
        } else oldAgree.push(userid);
      }
      return state;
    },
    disagree: (state, action) => {
      const { userid, id } = action.payload;
      const oldDisagree = state.entities[id]?.disagree;
      if (oldDisagree) {
        if (oldDisagree.includes(userid)) {
          const index = oldDisagree.findIndex((val) => val === userid);
          oldDisagree.splice(index, 1);
        } else oldDisagree.push(userid);
      }
      return state;
    },
    update: conversationAdapter.updateOne
  },
  name: "conversations",
});

export const {
  setConversations,
  reset,
  setNewConversation,
  agree,
  disagree,
  setConversationRoom,
  update
} = conversationSlice.actions;

export const { selectAll: getConversations, selectById: getConversation } =
  conversationAdapter.getSelectors((state: RootState) => state.conversations);

export const getNewConversation = (state: RootState) =>
  state.conversations.newConversation;

export const getRoom = (state: RootState) => state.conversations.room;

export default conversationSlice.reducer;
