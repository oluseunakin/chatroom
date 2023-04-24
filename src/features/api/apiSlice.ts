import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Chat, Conversation, Room, User } from "../../type";

const baseUrl = "https://roomserver2.onrender.com";

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ["room"],
  endpoints: (builder) => ({
    getUser: builder.query({ query: (username) => `/user/${username}` }),
    getUserWithChats: builder.query({
      query: (username) => `/user/withchats/${username}`,
    }),
    updateUser: builder.mutation({
      query: (data: { username: string; rooms: Room[] }) => ({
        method: "POST",
        body: data.rooms,
        url: `/user/update/${data.username}`,
      }),
    }),
    createUser: builder.mutation({
      query: (user: User) => ({
        method: "PUT",
        body: user,
        url: "/user/createuser",
      }),
    }),
    getAllUsers: builder.query({ query: () => "/user/all" }),
    createRoom: builder.mutation({
      query: (room: Room) => ({
        method: "PUT",
        body: room,
        url: "room/createroom",
      }),
      invalidatesTags: ["room"],
    }),
    getAllRooms: builder.query({
      query: () => "/room/all",
      providesTags: ["room"],
    }),
    getRoom: builder.query({ query: (roomname) => `/room/${roomname}` }),
    getRoomWithUsers: builder.query({
      query: (roomname) => `/room/withusers/${roomname}`,
    }),
    sayConversation: builder.mutation({
      query: (conversation: Conversation) => ({
        method: "PUT",
        url: "/conversation/create",
        body: conversation,
      }),
    }),
    getChat: builder.query({
      query: (arg: { sender: string; receiver: string }) =>
        `/chat/${arg.sender}/${arg.receiver}`,
    }),
    setChat: builder.mutation({
      query: (chat: Chat) => ({
        url: "/chat/setchat",
        method: "POST",
        body: chat,
      }),
    }),
  }),
});

export const {
  useGetUserQuery,
  useCreateUserMutation,
  useGetAllUsersQuery,
  useCreateRoomMutation,
  useGetAllRoomsQuery,
  useGetRoomQuery,
  useGetRoomWithUsersQuery,
  useUpdateUserMutation,
  useSayConversationMutation,
  useGetUserWithChatsQuery,
  useGetChatQuery,
  useSetChatMutation
} = apiSlice;
