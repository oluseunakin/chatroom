import { configureStore } from '@reduxjs/toolkit'
import userReducer from './features/user/userStore'
import { apiSlice } from './features/api/apiSlice'
import roomReducer from './features/room/roomStore'
import roomnameReducer from './features/roomname'
import chatReducer from './features/chat/chatStore'
import conversationReducer from './features/conversation/conversationStore'

export const store =  configureStore({
  reducer: {
    user: userReducer,
    rooms: roomReducer,
    roomname: roomnameReducer,
    chat: chatReducer,
    conversations: conversationReducer,
    [apiSlice.reducerPath]: apiSlice.reducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(apiSlice.middleware)
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch