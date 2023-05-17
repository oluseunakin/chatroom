import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { Conversation, Message, Room, User } from "../../type";
import {
  useGetRoomWithUsersQuery,
  useJoinRoomMutation,
  useSayConversationMutation,
} from "../api/apiSlice";
import { getMyRooms, setRoom } from "./roomStore";
import { useEffect, useMemo, useRef, useState } from "react";
import { getUser } from "../user/userStore";
import { socket } from "../socket";
import { setChat } from "../chat/chatStore";
import { Spinner } from "../../components/Spinner";
import { getShowChat } from "../chat/chatStore";
import { Conversations } from "../conversation/Conversations";
import { enterRoom, getRoom, leaveRoom } from "../roomname";
import {
  setConversationRoom,
  setConversations,
  setNewConversation,
  reset,
} from "../conversation/conversationStore";

export function RoomExcerpt(props: { room: Room; showModal: Function }) {
  const user = useSelector<RootState, User>((state) => getUser(state));
  const myrooms = useSelector<RootState, Room[]>((state) => getMyRooms(state));
  const { room } = props;
  const [joinroom, { isLoading }] = useJoinRoomMutation();
  const inRoom = useMemo(() => myrooms.includes(room), [myrooms]);
  const dispatch = useDispatch();
  return (
    <div className="card">
      <h3>{room.name}</h3>
      {inRoom ? (
        <button
          onClick={() => {
            dispatch(enterRoom(room.id));
            props.showModal(true);
          }}
        >
          <span className="material-symbols-outlined">door_open</span>
        </button>
      ) : (
        <button
          onClick={async () => {
            dispatch(setRoom(room));
            const joinedRoom = await joinroom(room.name).unwrap();
            socket.emit("joinroom", joinedRoom, user.name);
          }}
        >
          <span className="material-symbols-outlined">group_add</span>
        </button>
      )}
    </div>
  );
}

export function RoomComponent(props: {showModal: Function}) {
  const { showModal } = props;
  const entered = useSelector<
    RootState,
    { id: number; entered: Array<number> }
  >((state) => getRoom(state));
  const talker = useSelector<RootState, User>((state) => getUser(state));
  const divRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  let {
    currentData: room,
    isLoading: roomLoading,
    refetch,
  } = useGetRoomWithUsersQuery(entered.id);
  const [showUsers, setShowUsers] = useState(false);
  const users = useMemo(
    () =>
      room ? room.users.filter((user: User) => user.name !== talker.name) : [],
    [room]
  );
  const sayRef = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState<boolean[]>([]);
  const chatState = useSelector<RootState, boolean>((state) =>
    getShowChat(state)
  );
  const [converse, { isLoading: converseLoading }] =
    useSayConversationMutation();

  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [entered.id]);

  useEffect(() => {
    if (entered.entered.includes(entered.id) && room) {
      refetch()
    }
  }, [room, entered])

  useEffect(() => {
    if (room) {
      dispatch(setConversations(room.conversations));
      dispatch(setConversationRoom({ id: room.id, name: room.name }));
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
          refetch();
        })
        .on("message", (data: Conversation) => {
          dispatch(setNewConversation(data));
        })
        .on("agree", (data) => {});
    }
  });

  if (roomLoading) return <Spinner />;

  return (
    <div className={chatState ? "active modal" : "modal"} ref={divRef}>
      <div className="close">
        <button
          onClick={() => {
            dispatch(leaveRoom());
            showModal(false);
          }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="header">
        <h2>{room.name}</h2>
        <button onClick={() => setShowUsers(!showUsers)}>
          <span className="material-symbols-outlined">group</span>
        </button>
      </div>
      {converseLoading ? (
        <Spinner />
      ) : (
        <div className="convo">
          {showUsers && (
            <div className="users">
              {users.map((user: User, i: number) => (
                <button
                  key={user.id}
                  value={user.name}
                  onClick={(e) => {
                    if (status[i])
                      dispatch(setChat({ receiver: user, showChat: true }));
                    else alert("You can only chat when the person is online");
                  }}
                >
                  {user.name}{" "}
                  <span className={status[i] ? "online" : "offline"}></span>
                </button>
              ))}
            </div>
          )}
          {room && <Conversations divRef={divRef} />}
          {
            <div>
              <textarea ref={sayRef} placeholder="Say Hello"></textarea>
              <span
                onClick={async () => {
                  const said = sayRef.current?.value!;
                  const message: Message = {
                    text: said,
                    createdAt: new Date().toDateString(),
                    senderId: talker.id!,
                    senderName: talker.name,
                  };
                  const conversation: Conversation = {
                    room: { id: room.id, name: room.name },
                    message,
                    talker: { id: talker.id, name: talker.name },
                  };
                  const newConversation = await converse(conversation).unwrap();
                  socket.emit("receivedRoomMessage", newConversation);
                  sayRef.current!.value = "";
                }}
                className="material-symbols-outlined"
              > 
                send
              </span>
            </div>
          }
        </div>
      )}
    </div>
  );
}
