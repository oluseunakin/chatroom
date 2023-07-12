import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { CN, Conversation, Message, Room, User } from "../../type";
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
  reset,
} from "../conversation/conversationStore";
import { ChatComponent } from "../chat/Chat";
import { ChatNotification } from "../notifications/ChatNotification";

export function RoomExcerpt(props: { room: Room; showModal?: Function; setJoined?: Function }) {
  const myrooms = useSelector<RootState, Room[]>((state) => getMyRooms(state));
  const { room, showModal, setJoined } = props;
  const me = useSelector<RootState, User>((state) => getUser(state));
  const [joinroom, { isLoading }] = useJoinRoomMutation();
  const inRoom = useMemo(() => myrooms.includes(room), [myrooms]);
  const dispatch = useDispatch();
  return (
    <div className="card">
      {isLoading && <Spinner />}
      <h3>{room.name}</h3>
      {inRoom ? (
        <button
          onClick={() => {
            dispatch(enterRoom(room.id));
            showModal && showModal(true);
            socket.emit("enterroom", room.id);
          }}
        >
          <span className="material-symbols-outlined">door_open</span>
        </button>
      ) : (
        <button
          onClick={async () => {
            await joinroom(room.name).unwrap();
            dispatch(setRoom(room));
            setJoined && setJoined(true)
            socket.emit("joinroom", room.id, room.name, me.name);
          }}
        >
          <span className="material-symbols-outlined">group_add</span>
        </button>
      )}
    </div>
  );
}

export function RoomComponent(props: { showModal: Function }) {
  const { showModal } = props;
  const entered = useSelector<
    RootState,
    { id: number; entered: Array<number> }
  >((state) => getRoom(state));
  const me = useSelector<RootState, User>((state) => getUser(state));
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
      room ? room.users.filter((user: User) => user.name !== me.name) : [],
    [room]
  );
  const [members, setMembers] = useState<number[]>([]);
  const showChat = useSelector<RootState, boolean>((state) =>
    getShowChat(state)
  );
  const sayRef = useRef<HTMLTextAreaElement>(null);
  const [converse, { isLoading: converseLoading }] =
    useSayConversationMutation();
  const [chatNotification, setChatNotification] = useState<CN>({
    messages: [],
    count: 0,
    show: false,
  });

  function isInRoom(userId: number) {
    return members.includes(userId);
  }

  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [entered.id]);

  useEffect(() => {
    if (entered.entered.includes(entered.id) && room) {
      refetch();
    }
  }, [room, entered]);

  useEffect(() => {
    if (room) {
      dispatch(setConversations(room.conversations));
      dispatch(setConversationRoom({ id: room.id, name: room.name }));
      socket.emit("inroom", room.id, me.id);
    }
  }, [room]);

  const goneoff = (offed: number[]) => {
    setMembers(offed);
  };
  const enteredRoom = (online: number[]) => {
    setMembers(online);
  };
  const receiveChat = (message: Message) => {
    if (!showChat) {
      setChatNotification({
        ...chatNotification,
        count: chatNotification.count + 1,
        messages: [...chatNotification.messages!, message],
      });
    }
  };
  useEffect(() => {
    socket
    .on("goneoff", goneoff)
    .on("enteredroom", enteredRoom)
    .on("receiveChat", receiveChat);
    return () => {
      socket.off("goneoff", goneoff).off("enteredroom", enteredRoom).off("receiveChat", receiveChat)
    }
  })

  if (roomLoading) return <Spinner />;

  return (
    <div className="modal" ref={divRef}>
      {showChat && <ChatComponent />}
      <div className="close">
        <button
          onClick={() => {
            dispatch(leaveRoom());
            showModal(false);
            socket.emit("leftroom", room.id, me.id);
          }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="header">
        <h2>{room.name}</h2>
        <div>
          <button onClick={() => setShowUsers(!showUsers)}>
            <span className="material-symbols-outlined">group</span>
          </button>
          <button
            className="super"
            onClick={() => {
              setChatNotification({
                ...chatNotification,
                show: !chatNotification.show,
              });
            }}
          >
            <span className="material-symbols-outlined">message</span>
            {chatNotification.count > 0 && <div>{chatNotification.count}</div>}
          </button>
        </div>
        {showUsers && (
          <div className="users">
            {users.map((user: User, i: number) => (
              <button
                key={user.id}
                value={user.name}
                onClick={(e) => {
                  if (isInRoom(user.id!))
                    dispatch(setChat({ receiver: user, showChat: true }));
                  else
                    alert("You can only chat when the person is in the room");
                }}
              >
                {user.name}{" "}
                <span
                  className={isInRoom(user.id!) ? "online" : "offline"}
                ></span>
              </button>
            ))}
          </div>
        )}
        {chatNotification.show && (
          <ChatNotification
            notifications={chatNotification.messages!}
            setChatNotification={setChatNotification}
          />
        )}
      </div>
      {converseLoading ? (
        <Spinner />
      ) : (
        <div className="convo">
          {
            <div>
              <textarea ref={sayRef} placeholder="Say Hello"></textarea>
              <span
                onClick={async () => {
                  const said = sayRef.current?.value!;
                  const message: Message = {
                    text: said,
                    createdAt: new Date().toDateString(),
                    senderId: me.id!,
                    senderName: me.name,
                  };
                  const conversation: Conversation = {
                    room: { id: room.id, name: room.name },
                    message,
                    talker: { ...me },
                  };
                  sayRef.current!.value = "";
                  const newConversation = await converse(conversation).unwrap();
                  //dispatch(setNewConversation(newConversation));
                  socket.emit("receivedRoomMessage", newConversation);
                }}
                className="material-symbols-outlined"
              >
                send
              </span>
            </div>
          }
          {room && <Conversations divRef={divRef} />}
        </div>
      )}
    </div>
  );
}
