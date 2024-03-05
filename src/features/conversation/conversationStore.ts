import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { Conversation, Room, RoomType, User } from "../../type";

const conversationAdapter = createEntityAdapter<Conversation>();
const initialState = conversationAdapter.getInitialState<{
  newConversation: Conversation;
  room: Room;
}>({
  newConversation: {
    id: -1,
    talker: { name: "", id: -1 },
    agree: Array<User>(),
    disagree: Array<User>(),
    room: {
      id: -1,
      name: "",
      topic: { id: -1, name: "" },
      creatorId: -1,
      type: RoomType.OPEN,
    },
    convo: "",
    media: Array<string>(),
    createdAt: new Date(),
    _count: {
      comments: 0,
    },
  },
  room: {
    id: -1,
    name: "",
    topic: { id: -1, name: "" },
    creatorId: -1,
    type: RoomType.OPEN,
  }
});

const conversationSlice = createSlice({
  initialState,
  reducers: {
    setConversations: conversationAdapter.setMany,
    setConversationRoom: (state, action) => ({
      ...state,
      room: action.payload,
    }),
    setNewConversation: (state, action) => {
      state.newConversation = action.payload;
      return state;
    },
    reset: () => initialState,
    update: conversationAdapter.updateOne,
  },
  name: "conversations",
});

export const {
  setConversations,
  reset,
  setNewConversation,
  setConversationRoom,
  update,
} = conversationSlice.actions;

export const { selectAll: getConversations, selectById: getConversation } =
  conversationAdapter.getSelectors((state: RootState) => state.conversations);

export const getNewConversation = (state: RootState) =>
  state.conversations.newConversation;

export const getRoom = (state: RootState) => state.conversations.room;

export default conversationSlice.reducer;
