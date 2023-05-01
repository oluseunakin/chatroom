import type { EntityState } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { Conversation, Message, Room, User } from "../../type";
import { useGetRoomWithUsersQuery, useJoinRoomMutation } from "../api/apiSlice";
import { setRoomname } from "../roomname";
import { getMyRooms, joinRoom } from "./roomStore";
import { useEffect, useMemo, useRef, useState } from "react";
import { getUser } from "../user/userStore";
import { socket } from "../socket";
import { ConversationComponent } from "../../components/Conversation";
import { setChat } from "../chat/chatStore";
import { Spinner } from "../../components/Spinner";
import { getShowChat } from "../chat/chatStore";

export function RoomExcerpt(props: { room: Room }) {
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
          }}
        >
          <span className="material-symbols-outlined">door_open</span>
        </button>
      ) : (
        <button
          onClick={async () => {
            dispatch(joinRoom({ name: room.name }));
            await joinroom({ name: room.name, joiner: user }).unwrap();
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
  const [reload, setReload] = useState(false);
  const dispatch = useDispatch();
  const { data: room, isLoading: roomLoading, refetch } = useGetRoomWithUsersQuery(
    enteredRoom,
    { refetchOnMountOrArgChange: true }
  );
  const [newConversations, setNewConversations] = useState<Conversation[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const users = useMemo(() => {
    if (room) {
      return room.users.filter((user: User) => user.name !== talkerName);
    }
    return [];
  }, [room]);
  const sayRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<boolean[]>([]);
  const chatState = useSelector<RootState, boolean>((state) =>
    getShowChat(state)
  );
  useEffect(() => {
    props.showModal();
  }, [props.showModal]);
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
        .on("joinedroom", () => {
          setReload(true);
          refetch()
        });
    }
  });
  socket.on("message", (data) => {
    setNewConversations([...newConversations, data]);
  });

  if (roomLoading) return <Spinner />;
  return (
    <div className={chatState ? "active modal" : "modal"}>
      <div className="close">
        <button onClick={() => {
          dispatch(setRoomname(""))
          setReload(false)
          }}>
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
                key={i}
                value={user.name}
                onClick={(e) => {
                  dispatch(
                    setChat({ receiver: e.currentTarget.value, showChat: true })
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
