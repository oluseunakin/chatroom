import { configureStore } from '@reduxjs/toolkit'
import userReducer from './features/user/userStore'
import chatReducer from "./features/chat/chatStore"
import modalReducer from "./features/modal"
import roomsReducer from "./features/room/roomStore"
import liveReducer from "./features/live/liveStore"
import { apiSlice } from './features/api/apiSlice'
import roomnameReducer from './features/roomname'
import conversationReducer from './features/conversation/conversationStore'

export const store =  configureStore({
  reducer: {
    user: userReducer,
    roomname: roomnameReducer,
    conversations: conversationReducer,
    rooms: roomsReducer,
    chat: chatReducer,
    modal: modalReducer,
    live: liveReducer,
    [apiSlice.reducerPath]: apiSlice.reducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(apiSlice.middleware)
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch