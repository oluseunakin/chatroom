import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  apiSlice,
  useCreateRoomMutation,
  useDeleteMutation,
  useGetAllRoomsQuery,
  useGetUserQuery,
} from "../features/api/apiSlice";
import { RoomComponent, RoomExcerpt } from "../features/room/Room";
import {
  getMyRooms,
  reset as roomReset,
  setMyRooms,
} from "../features/room/roomStore";
import { getUser, reset as userReset } from "../features/user/userStore";
import { RootState } from "../store";
import type { CN, Conversation, Message, Room, User } from "../type";
import { transformEntityState } from "../helper";
import { socket } from "../features/socket";
import { getShowChat, reset as chatReset } from "../features/chat/chatStore";
import { ChatComponent } from "../features/chat/Chat";
import { RoomNotification } from "../features/notifications/RoomNotification";
import { ChatNotification } from "../features/notifications/ChatNotification";
import { Spinner } from "./Spinner";

export function Welcome() {
  const dispatch = useDispatch();
  const [modal, showModal] = useState(false);
  const username = useSelector<RootState, string>((state) => getUser(state));
  const rooms = useSelector<RootState, Room[]>((state) =>
    transformEntityState(getMyRooms(state))
  );
  const {
    data: user,
    isLoading: userLoading,
    isFetching,
  } = useGetUserQuery(username);
  const showChat = useSelector<RootState, boolean>((state) =>
    getShowChat(state)
  );
  const [showNotification, setShowNotification] = useState({
    room: false,
    chat: false,
  });
  const enteredRoom = useSelector<RootState, string>((state) => state.roomname);
  const [roomname, setRoomname] = useState("");
  const [pageno, setPageNo] = useState(0);
  const [reload, setReload] = useState(false);
  const {
    data: allrooms,
    currentData,
    isLoading: roomsLoading,
    isFetching: roomsFetching,
    refetch,
  } = useGetAllRoomsQuery(pageno);
  const [latest, setLatest] = useState(allrooms);
  const [createRoom, { isLoading: roomLoading }] = useCreateRoomMutation();
  const deleteRef = useRef<HTMLInputElement>(null);
  const [deleete, { isLoading }] = useDeleteMutation();
  const [menu, setMenu] = useState({ display: true, clicked: false });
  const [roomNotification, setRoomNotification] = useState<{
    conversations?: Conversation[];
    count: number;
    noti: string[];
  }>({
    conversations: [],
    count: 0,
    noti: [],
  });
  const [chatNotification, setChatNotification] = useState<CN>({
    messages: [],
    count: 0,
  });

  useEffect(() => {
    if (user && user.myrooms) {
      socket.emit("rooms", user.myrooms, username);
      dispatch(setMyRooms(user.myrooms));
    }
  }, [user]);
  
  useEffect(() => {
    !latest?.status && window.addEventListener("scroll", bodyScroll);
  },[latest])

  useEffect(() => {
    if (!roomsLoading && !allrooms?.status) {
      setLatest(allrooms);
    }
    else setLatest({toprooms: Array<Room>(), others: Array<Room>(), status: allrooms?.status})
  }, [roomsLoading]);

  useEffect(() => {
    if (!roomsFetching && pageno !== 0) {
      if (currentData!.status) {
        window.removeEventListener("scroll", bodyScroll);
      } else {
        const oldTopRooms = latest!.toprooms!;
        const oldOthers = latest!.others!;
        currentData &&
          setLatest({
            toprooms: [...oldTopRooms, ...currentData.toprooms!],
            others: [...oldOthers, ...currentData.others!],
            status: latest?.status,
          });
        setReload(false);
      }
    }
  }, [roomsFetching, pageno]);

  useEffect(() => {
    socket.connect();
  }, [username]);

  window.onresize = () => {
    if (window.innerWidth >= 799) setMenu({ ...menu, display: false });
    else setMenu({ ...menu, display: true });
  };

  function bodyScroll() {
    window.requestAnimationFrame(() => {
      const loadPosition = Math.floor(0.9 * document.body.scrollHeight);
      const scrollHeight = window.scrollY + window.innerHeight;
      if (scrollHeight >= loadPosition) {
        setReload(true);
      }
    });
  }

  useEffect(() => {
    if (reload) {
      setPageNo((oldno) => oldno + 1);
    }
  }, [reload]);

  useEffect(() => {
    if(pageno > 0) {
      //console.log(pageno)
      refetch()
    }
  }, [pageno]);

  useEffect(() => {
    if (window.innerWidth >= 799) setMenu({ ...menu, display: false });
  }, [window.innerWidth]);

  socket
    .on("message", (conversation: Conversation) => {
      if (conversation.talkerName !== username)
        setRoomNotification({
          ...roomNotification,
          conversations: roomNotification.conversations?.concat([conversation]),
          count: roomNotification.count + 1,
        });
    })
    .on("receiveChat", (receiver: User, chat: Message) => {
      setChatNotification({
        messages: chatNotification.messages?.concat([chat]),
        count: chatNotification.count + 1,
        receiver
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
  if (userLoading || roomLoading) return <Spinner />;

  return (
    <div className={modal ? "active" : ""}>
      {showChat && <ChatComponent />}
      {showNotification.room && (
        <RoomNotification
          convoNotifications={roomNotification.conversations!}
          showModal={showModal}
          joinNotifications={roomNotification.noti}
          showNoti={setShowNotification}
        />
      )}
      {showNotification.chat && (
        <ChatNotification
          showModal={showModal}
          showNoti={setShowNotification}
          notifications={chatNotification}
        />
      )}
      <header>
        {menu.display && (
          <div className="menu">
            <button
              className="material-symbols-outlined"
              onClick={() => setMenu({ ...menu, clicked: !menu.clicked })}
            >
              menu
            </button>
          </div>
        )}
        <h1>{user.name}</h1>
        {
          <div className={menuDiv()}>
            {user.name === "Oluseun" && (
              <div className="create">
                <div>
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
                <div>
                  <input
                    ref={deleteRef}
                    placeholder="Delete"
                    onKeyUp={async (e) => {
                      if (e.key === "Enter") {
                        alert(await deleete(deleteRef.current!.value).unwrap());
                      }
                    }}
                  />
                </div>
              </div>
            )}
            <button
              className="super"
              onClick={() => {
                showModal(true);
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
                showModal(true);
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
      <div className="joinmessage">
        Join or Enter a Room to Join the Conversation{" "}
      </div>
      {enteredRoom.length > 0 && <RoomComponent showModal={showModal} />}
      <div className="jdiv">
        <div className="myrooms">
          {rooms &&
            rooms.map((room: Room, i: number) => (
              <RoomExcerpt room={room} key={i} showModal={showModal}/>
            ))}
        </div>
        {latest?.status ? (
          <Spinner />
        ) : (
          <div className="allrooms">
            <div>
              <h3>Top Rooms</h3>
              <hr />
              <div>
                {latest!.toprooms!.map((room: Room, i: number) => (
                  <RoomExcerpt room={room} key={i} showModal={showModal}/>
                ))}
              </div>
            </div>
            <div>
              <h3>Check these out</h3>
              <hr />
              <div>
                {latest!.others!.map((room: Room, i: number) => (
                  <RoomExcerpt room={room} key={i} showModal={showModal}/>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}