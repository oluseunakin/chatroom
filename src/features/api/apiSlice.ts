import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Chat, Conversation, Room, User } from "../../type";

//const baseUrl = "https://roomserver2.onrender.com";
const baseUrl = "http://localhost:3000";

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl, credentials: "include" }),
  tagTypes: ["room", "rooms"],
  endpoints: (builder) => ({
    delete: builder.mutation({
      query: (names) => ({
        method: "POST",
        body: names,
        url: "/deletetables",
      }),
    }),
    getUser: builder.query<User, string>({
      query: () => ({
        url: "/user/getuser",
      }),
    }),
    getMyRooms: builder.query<Room[] | undefined | null, string>({
      query: (count) => ({
        url: `/user/getmyrooms/${count}`,
      }),
    }),
    getJoinedRooms: builder.query<Room[] | undefined | null, string>({
      query: (count) => ({
        url: `/user/getjoinedrooms/${count}`,
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
    createRoom: builder.mutation<Room, Room>({
      query: (room) => ({
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
    leaveRoom: builder.mutation({
      query: (data) => ({
        method: "POST",
        body: data,
        url: "room/leaveroom",
      }),
      invalidatesTags: ["room"],
    }),
    getAllRooms: builder.query<Room[] | undefined | null, number>({
      query: (pageno) => `/room/all/${pageno}`,
      providesTags: ["rooms"],
    }),
    getRoom: builder.query({
      query: (roomname) => `/room/${roomname}`,
    }),
    getRoomWithConversations: builder.query<{room: Room, isMember: boolean}, number>({
      query: (roomid) => `/room/${roomid}/withconversations`,
      providesTags: ["room"],
    }),
    getRoomMembers: builder.query<
      {
        members: {
          id: number;
          name: string;
        }[];
      } | null,
      { id: number; pageno: number }
    >({
      query: (data) => `/room/${data.id}/getmembers/${data.pageno}`,
    }),
    getTopics: builder.query<{ id: number; name: string }[], null>({
      query: () => "/topics",
    }),
    sayConversation: builder.mutation({
      query: (conversation) => ({
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
        url: "/logout",
        method: "POST",
      }),
    }),
    agree: builder.mutation({
      query: (data: { conversationId: number; data: number }) => ({
        url: `/conversation/${data.conversationId}/agree`,
        method: "POST",
        body: data.data,
      }),
    }),
    disagree: builder.mutation({
      query: (data: { conversationId: number; data: number }) => ({
        url: `/conversation/${data.conversationId}/disagree`,
        method: "POST",
        body: data.data,
      }),
    }),
    comment: builder.mutation({
      query: (data: { comment: Conversation; conversationId: number }) => ({
        url: `/conversation/${data.conversationId}/comment`,
        method: "POST",
        body: data.comment,
      }),
    }),
    getComments: builder.query({
      query: (conversationId) => `/conversation/${conversationId}/getcomments`,
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
  useGetRoomWithConversationsQuery,
  useGetRoomMembersQuery,
  useGetTopicsQuery,
  useUpdateUserMutation,
  useSayConversationMutation,
  useGetUserWithChatsQuery,
  useGetChatQuery,
  useSetChatMutation,
  useJoinRoomMutation,
  useLeaveRoomMutation,
  useDeleteMutation,
  useLogoutMutation,
  useAgreeMutation,
  useCommentMutation,
  useDisagreeMutation,
  useLazyGetCommentsQuery,
  useLazyGetAllRoomsQuery,
  useLazyGetJoinedRoomsQuery,
  useLazyGetMyRoomsQuery,
} = apiSlice;
