import type { EntityState } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { Conversation, Message, Room, User } from "../../type";
import { useGetRoomWithUsersQuery } from "../api/apiSlice";
import { setRoomname } from "../roomname";
import { getMyRooms, joinRoom } from "./roomStore";
import { useEffect, useMemo, useRef, useState } from "react";
import { getUser } from "../user/userStore";
import { socket } from "../socket";
import { ConversationComponent } from "../../components/Conversation";
import { setChat } from "../chat/chatStore";
import { Spinner } from "../../components/Spinner";
import { getShowChat } from "../chat/chatStore";
import { ChatComponent } from "../chat/Chat";

export function RoomExcerpt(props: { room: Room }) {
  const user = useSelector<RootState, string>((state) => getUser(state));
  const myrooms = useSelector<RootState, EntityState<Room>>((state) =>
    getMyRooms(state)
  );
  const { room } = props;
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
          onClick={() => {
            dispatch(joinRoom({ name: room.name }));
            socket.emit("joinroom", room.name, user);
          }}
        >
          <span className="material-symbols-outlined">group_add</span>
        </button>
      )}
    </div>
  );
}

export function RoomComponent() {
  const enteredRoom = useSelector<RootState, string>((state) => state.roomname);
  const showChat = useSelector<RootState, boolean>((state) =>
    getShowChat(state)
  );
  const talkerName = useSelector<RootState, string>((state) => getUser(state));
  const dispatch = useDispatch();
  const { data: room, isLoading: roomLoading } =
    useGetRoomWithUsersQuery(enteredRoom);
  const [newConversations, setNewConversations] = useState<Conversation[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const users = useMemo(() => {
    if (room) {
      return room.users.filter((user: User) => user.name !== talkerName);
    }
    return [];
  }, [room]);
  const sayRef = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState<boolean[]>([]);
  const chatState = useSelector<RootState, boolean>((state) =>
    getShowChat(state)
  );
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
        .on("joinedroom", (joiner: string) => {});
    }
  });
  socket.on("message", (data) => {
    setNewConversations([...newConversations, data]);
  });

  if (roomLoading) return <Spinner />;
  return (
    <div className={chatState ? "active enteredroom" : "enteredroom"}>
      {showChat && <ChatComponent />}
      <div className="close">
        <button onClick={() => dispatch(setRoomname(""))}>
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
          <textarea
            ref={sayRef}
            rows={1}
            placeholder="hello"
            onKeyUp={(e) => {
              const inp = sayRef.current!;
              const style = window.getComputedStyle(inp);
              const charWidth = parseFloat(style.getPropertyValue("font-size")) * 0.6;
              const maxWidth = Math.floor(inp.clientWidth / charWidth);
              console.log(maxWidth)
            }}
          />
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
