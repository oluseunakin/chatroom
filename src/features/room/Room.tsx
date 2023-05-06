import type { EntityState } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { Conversation, Message, Room, User } from "../../type";
import {
  useGetRoomWithUsersQuery,
  useJoinRoomMutation,
  useSayConversationMutation,
} from "../api/apiSlice";
import { setRoomname } from "../roomname";
import { getMyRooms, joinRoom } from "./roomStore";
import { useEffect, useMemo, useRef, useState } from "react";
import { getUser } from "../user/userStore";
import { socket } from "../socket";
import { ConversationComponent } from "../../components/Conversation";
import { setChat } from "../chat/chatStore";
import { Spinner } from "../../components/Spinner";
import { getShowChat } from "../chat/chatStore";

export function RoomExcerpt(props: { room: Room; showModal: Function }) {
  const user = useSelector<RootState, string>((state) => getUser(state));
  const myrooms = useSelector<RootState, EntityState<Room>>((state) =>
    getMyRooms(state)
  );
  const { room } = props;
  const [joinroom, { isLoading }] = useJoinRoomMutation();
  const inRoom = myrooms.ids.includes(room.name);
  const dispatch = useDispatch();
  return (
    <div className="card">
      <h3>{room.name}</h3>
      {inRoom ? (
        <button
          onClick={() => {
            dispatch(setRoomname(room.name));
            props.showModal(true);
          }}
        >
          <span className="material-symbols-outlined">door_open</span>
        </button>
      ) : (
        <button
          onClick={async () => {
            dispatch(joinRoom({ name: room.name }));
            await joinroom(room.name).unwrap();
            socket.emit("joinroom", room.name, user);
          }}
        >
          <span className="material-symbols-outlined">group_add</span>
        </button>
      )}
    </div>
  );
}

export function RoomComponent(props: { showModal: Function }) {
  const enteredRoom = useSelector<RootState, string>((state) => state.roomname);
  const talkerName = useSelector<RootState, string>((state) => getUser(state));
  const dispatch = useDispatch();
  const {
    currentData: room,
    isLoading: roomLoading,
    refetch,
  } = useGetRoomWithUsersQuery(enteredRoom);
  const [newConversations, setNewConversations] = useState<Conversation[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const users = useMemo(() => room ? room.users.filter((user: User) => user.name !== talkerName) : [], [room]);
  const sayRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<boolean[]>([]);
  const chatState = useSelector<RootState, boolean>((state) =>
    getShowChat(state)
  );
  const [converse, { isLoading }] = useSayConversationMutation();

  useEffect(() => {
    if (room) {
      setStatus(Array(users.length).fill(false));
      socket.emit("isonline", users).on("status", (status) => {
        setStatus(status);
      });
    }
  }, [room]);
  useEffect(() => {
    if (room) {
      socket
        .on("goneoff", (offed) => {
          const offedIndex = users.findIndex(
            (user: User, i: number) => user.name === offed
          );
          setStatus((status) => {
            const nstatus = [...status];
            nstatus[offedIndex] = false;
            return nstatus;
          });
        })
        .on("comeon", (oned) => {
          const onedIndex = users.findIndex(
            (user: User, i: number) => user.name === oned
          );
          setStatus((status) => {
            const nstatus = [...status];
            nstatus[onedIndex] = true;
            return nstatus;
          });
        })
        .on("joinedroom", () => {refetch();})
        .on("message", (data) => {
          setNewConversations([...newConversations, data]);
        });
    }
  });

  if (roomLoading) return <Spinner />;
  return (
    <div className={chatState ? "active modal" : "modal"}>
      <div className="close">
        <button
          onClick={() => {
            dispatch(setRoomname(""));
            props.showModal(false);
          }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="header">
        <h2>{enteredRoom}</h2>
        <button onClick={() => setShowUsers(!showUsers)}>
          <span className="material-symbols-outlined">group</span>
        </button>
      </div>
      <div className="convo">
        {showUsers && (
          <div className="users">
            {users.map((user: User, i: number) => (
              <button
                key={user.id}
                value={user.name}
                onClick={(e) => {
                  dispatch(
                    setChat({ receiver: user, showChat: true })
                  );
                }}
              >
                {user.name}{" "}
                <span className={status[i] ? "online" : "offline"}></span>
              </button>
            ))}
          </div>
        )}
        {room && (
          <div className="conversations">
            {room.conversations.map((conversation: Conversation, i: number) => (
              <ConversationComponent key={i} convo={conversation} />
            ))}
            {newConversations &&
              newConversations.map((nc, i) => (
                <ConversationComponent
                  convo={nc}
                  key={i + room.conversations.length}
                />
              ))}
          </div>
        )}
        <div>
          <input ref={sayRef} placeholder="hello" />
          <span
            onClick={async () => {
              const said = sayRef.current?.value!;
              const message: Message = {
                text: said,
                createdAt: new Date().toDateString(),
                sender: talkerName,
              };
              const conversation: Conversation = {
                talkerName,
                roomName: room.name,
                message,
              };
              socket.emit("receivedRoomMessage", conversation);
              const newConversation = await converse(conversation).unwrap();
              sayRef.current!.value = "";
            }}
            className="material-symbols-outlined"
          >
            send
          </span>
        </div>
      </div>
    </div>
  );
}
