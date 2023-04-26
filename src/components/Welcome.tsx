import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  apiSlice,
  useCreateRoomMutation,
  useGetAllRoomsQuery,
  useGetUserQuery,
} from "../features/api/apiSlice";
import { RoomComponent, RoomExcerpt } from "../features/room/Room";
import {
  getMyRooms,
  reset as roomReset,
  setMyRoom,
} from "../features/room/roomStore";
import { getUser, reset as userReset } from "../features/user/userStore";
import { RootState } from "../store";
import type { Conversation, Message, Room } from "../type";
import { transformEntityState } from "../helper";
import { socket } from "../features/socket";
import { getShowChat, reset as chatReset } from "../features/chat/chatStore";
import { ChatComponent } from "../features/chat/Chat";
import { RoomNotification } from "../features/notifications/RoomNotification";
import { ChatNotification } from "../features/notifications/ChatNotification";

export function Welcome() {
  const dispatch = useDispatch();
  const username = useSelector<RootState, string>((state) => getUser(state));
  const showChat = useSelector<RootState, boolean>((state) =>
    getShowChat(state)
  );
  const rooms = useSelector<RootState, Room[]>((state) =>
    transformEntityState(getMyRooms(state))
  );
  const { data: user, isLoading: userLoading } = useGetUserQuery(username);
  const [showNotification, setShowNotification] = useState({
    room: false,
    chat: false,
  });
  const enteredRoom = useSelector<RootState, string>((state) => state.roomname);
  const [roomname, setRoomname] = useState("");
  const { data: allrooms, isLoading: roomsLoading } = useGetAllRoomsQuery("");
  const [createRoom, { isLoading: roomLoading }] = useCreateRoomMutation();
  const [menu, setMenu] = useState({ display: false, clicked: false });
  const [roomNotification, setRoomNotification] = useState<{
    conversations?: Conversation[];
    count: number;
    noti: string[];
  }>({
    conversations: [],
    count: 0,
    noti: [],
  });
  const [chatNotification, setChatNotification] = useState<{
    messages?: Message[];
    count: number;
  }>({
    messages: [],
    count: 0,
  });

  useEffect(() => {
    if (user && user.myrooms) {
      socket.emit("rooms", user.myrooms, username);
      dispatch(setMyRoom(user.myrooms));
    }
    if(enteredRoom.length > 0) document.getElementsByName('body')[0].classList.add('modal')
  }, [user, enteredRoom.length]);

  useEffect(() => {
    socket.connect();
  }, [username]);

  window.onresize = () => {
    if (window.innerWidth <= 799) setMenu({ ...menu, display: true });
    else setMenu({ ...menu, display: false });
  };

  socket
    .on("message", (conversation: Conversation) => {
      if (conversation.talkerName !== username)
        setRoomNotification({
          ...roomNotification,
          conversations: roomNotification.conversations?.concat([conversation]),
          count: roomNotification.count + 1,
        });
    })
    .on("receiveChat", (chat: Message) => {
      setChatNotification({
        messages: chatNotification.messages?.concat([chat]),
        count: chatNotification.count + 1,
      });
    })
    .on("joinedroom", (joiner: string, roomname: string) => {
      setRoomNotification({
        ...roomNotification,
        noti: [...roomNotification.noti, `${joiner} joined ${roomname}`],
        count: roomNotification.count + 1,
      });
    });

  function menuDiv() {
    let r = "notmenudiv";
    if (menu.clicked) r = "menudiv";
    return r;
  }
  if (userLoading) return <div>Loading User</div>;
  return (
    <div>
      {showChat && <ChatComponent />}
      {showNotification.room && (
        <RoomNotification
          convoNotifications={roomNotification.conversations!}
          joinNotifications={roomNotification.noti}
          showNoti={setShowNotification}
        />
      )}
      {showNotification.chat && (
        <ChatNotification
          showNoti={setShowNotification}
          notifications={chatNotification.messages!}
        />
      )}
      <header>
        {menu.display && (
          <button
            className="material-symbols-outlined menu"
            onClick={() => setMenu({ ...menu, clicked: !menu.clicked })}
          >
            menu
          </button>
        )}
        <h1>{user.name}</h1>
        {
          <div className={menuDiv()}>
            {user.name === "Oluseun" && (
              <div className="create">
                <input
                  placeholder="Type the room name"
                  onChange={(e) => {
                    setRoomname(e.target.value);
                  }}
                />
                <span
                  className="material-symbols-outlined"
                  onClick={async () => {
                    const newroom: Room = { name: roomname };
                    await createRoom(newroom).unwrap();
                  }}
                >
                  add
                </span>
              </div>
            )}
            <button
              className="super"
              onClick={() => {
                setShowNotification({ ...showNotification, chat: true });
                setChatNotification({ ...chatNotification, count: 0 });
              }}
            >
              <span className="material-symbols-outlined">message</span>
              {chatNotification.count > 0 && (
                <div>{chatNotification.count}</div>
              )}
            </button>
            <button
              className="super"
              onClick={() => {
                setShowNotification({ ...showNotification, room: true });
                setRoomNotification({ ...roomNotification, count: 0 });
              }}
            >
              <span className="material-symbols-outlined">manage_accounts</span>
              {roomNotification.count > 0 && (
                <div>{roomNotification.count}</div>
              )}
            </button>
            <button
              onClick={(e) => {
                dispatch(roomReset());
                dispatch(userReset());
                dispatch(chatReset());
                dispatch(apiSlice.util.resetApiState());
                socket.emit("offline", username);
              }}
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        }
      </header>
      {enteredRoom.length > 0 && <RoomComponent />}
      <div className="r">  
        <div className="myrooms">
          {rooms &&
            rooms.map((room: Room, i: number) => (
              <RoomExcerpt room={room} key={i} />
            ))}
        </div>
        {roomsLoading ? (
          <div>Loading rooms</div>
        ) : (
          <div className="allrooms">
            {allrooms.map((room: Room, i: number) => (
              <RoomExcerpt room={room} key={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
