import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Chat, Conversation, Room, User } from "../../type";

//const baseUrl = "https://roomserver2.onrender.com";
const baseUrl = "http://localhost:3000";

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl , credentials: 'include'}),
  tagTypes: ["room", "rooms"],
  endpoints: (builder) => ({
    delete: builder.mutation({
      query: (names) => ({
        method: "POST",
        body: names,
        url: "/deletetables",
      }),
    }),
    getUser: builder.query({
      query: () => ({
        url: "/user/getuser",
      }),
    }),
    getUserWithChats: builder.query({
      query: (username) => `/user/withchats/${username}`,
    }),
    updateUser: builder.mutation({
      query: (data: { rooms: Room[] }) => ({
        method: "POST",
        body: data.rooms,
        url: `/user/updateuser`,
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
      invalidatesTags: ["rooms"],
    }),
    joinRoom: builder.mutation({
      query: (data) => ({
        method: "POST",
        body: data,
        url: "room/joinroom",
      }),
      invalidatesTags: ["room"],
    }),
    getAllRooms: builder.query<
      {
        toprooms: Room[] | undefined;
        others: Room[] | undefined;
        status: string | undefined;
      },
      number
    >({
      query: (pageno) => `/room/all/${pageno}`,
      providesTags: ["rooms"],
    }),
    getRoom: builder.query({
      query: (roomname) => `/room/${roomname}`,
    }),
    getRoomWithUsers: builder.query({
      query: (roomname) => `/room/withusers/${roomname}`,
      providesTags: ["room"],
    }),
    sayConversation: builder.mutation({
      query: (conversation: Conversation) => ({
        method: "PUT",
        url: "/conversation/create",
        body: conversation,
      }),
    }),
    getChat: builder.query({
      query: (receiver) => ({
        url: `/chat/${receiver}`,
      }),
    }),
    setChat: builder.mutation({
      query: (chat: Chat) => ({
        url: "/chat/setchat",
        method: "POST",
        body: chat,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      })
    })
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
  useSetChatMutation,
  useJoinRoomMutation,
  useDeleteMutation,
  useLogoutMutation
} = apiSlice;
