import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { Conversation } from "../../type";

const commentAdapter = createEntityAdapter<Conversation>();
const initialState = commentAdapter.getInitialState({
  showComment: false,
  convo: {id: -1, commentsCount: 0},
  room: { id: -1, name: "" },
});

const commentSlice = createSlice({
  initialState,
  reducers: {
    setComments: commentAdapter.setMany,
    reset: () => initialState,
    setCommentState: (state, action) => {
      state.convo = action.payload.convo
      state.showComment = action.payload.showComment
      state.room = action.payload.room
      return state
    }
  },
  name: "comment",
});

export const { setComments, reset, setCommentState } = commentSlice.actions;

export const {selectAll: getComments} = commentAdapter.getSelectors<RootState>((state) => state.comment)

export const getCommentState = (state: RootState) => state.comment;

export default commentSlice.reducer;
