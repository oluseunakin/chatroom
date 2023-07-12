import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  apiSlice,
  useCreateRoomMutation,
  useDeleteMutation,
  useGetAllRoomsQuery,
  useGetUserQuery,
  useLogoutMutation,
} from "../features/api/apiSlice";
import { RoomComponent, RoomExcerpt } from "../features/room/Room";
import {
  getMyRooms,
  reset as roomReset,
  setMyRooms,
} from "../features/room/roomStore";
import { getUser, reset as userReset } from "../features/user/userStore";
import { RootState } from "../store";
import type { Room, User } from "../type";
import { socket } from "../features/socket";
import { reset as chatReset } from "../features/chat/chatStore";
import { RoomNotification } from "../features/notifications/RoomNotification";
import { Spinner } from "./Spinner";
import { getRoom } from "../features/roomname";
import Nothing from "./Nothing";

export function Welcome() {
  const dispatch = useDispatch();
  const [modal, showModal] = useState(false);
  const [joined, setJoined] = useState(false);
  const userr = useSelector<RootState, User>((state) => getUser(state));
  const { data: user, isLoading: userLoading } = useGetUserQuery("");
  const myRooms = useSelector<RootState, Room[]>((state) => getMyRooms(state));
  const enteredRoom = useSelector<RootState, { id: number; entered: number[] }>(
    (state) => getRoom(state)
  );
  const [roomname, setRoomname] = useState("");
  const [pageno, setPageNo] = useState(0);
  const [reload, setReload] = useState(false);
  const [logout] = useLogoutMutation();
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
  const [myrooms, setMyrooms] = useState({ display: true, clicked: false });
  const [roomNotification, setRoomNotification] = useState<{
    count: number;
    noti: string[];
    show: boolean;
  }>({
    count: 0,
    noti: [],
    show: false,
  });

  useEffect(() => {
    if (user) {
      user.myrooms && dispatch(setMyRooms(user.myrooms));
      socket.emit(
        "online",
        user.name,
        user.myrooms.map((room: Room) => room.id)
      );
    }
  }, [user]);

  useEffect(() => {
    !latest?.status && window.addEventListener("scroll", bodyScroll);
  }, [latest]);

  useEffect(() => {
    if (!roomsLoading && !allrooms?.status) {
      setLatest(allrooms);
    } else
      setLatest({
        toprooms: Array<Room>(),
        others: Array<Room>(),
        status: undefined,
      });
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
    if (pageno > 0) {
      refetch();
    }
  }, [pageno]);

  useEffect(() => {
    if (window.innerWidth >= 640) setMenu({ ...menu, display: false });
  }, [window.innerWidth]);

  useEffect(() => {
    const joinedRoom = (message: string) => {
      setRoomNotification({
        ...roomNotification,
        noti: [message, ...roomNotification.noti],
        count: roomNotification.count + 1,
      });
    };
    socket.on("joinedroom", joinedRoom);
    return () => {
      socket.removeAllListeners()
    };
  });

  function menuDiv() {
    let r = "notmenudiv";
    if (menu.clicked) r = "mmenu";
    return r;
  }

  function myroomsDiv() {
    let r = "notmyroomsdiv";
    if (myrooms.clicked) r = "myroomsdiv";
    return r;
  }
  if (userLoading || roomLoading) return <Spinner />;

  return (
    <div className={modal ? "active" : ""}>
      {roomNotification.show && (
        <RoomNotification
          roomNotification={roomNotification}
          setRoomNotification={setRoomNotification}
        />
      )}
      {modal && enteredRoom.id !== -1 && (
        <RoomComponent showModal={showModal} />
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
        {
          <div className={menuDiv()}>
            <div className="menudiv">
              {user.id === 1860 && (
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
                        const newroom = { name: roomname };
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
                          alert(
                            await deleete(deleteRef.current!.value).unwrap()
                          );
                        }
                      }}
                    />
                  </div>
                </div>
              )}
              <button
                className="super"
                onClick={() =>
                  setMyrooms({ ...myrooms, clicked: !myrooms.clicked })
                }
              >
                <span>My Rooms</span>
                {joined && (
                  <div className="material-symbols-outlined">star</div>
                )}
              </button>
              <button
                onClick={() => {
                  setRoomNotification({
                    ...roomNotification,
                    count: roomNotification.count - 1,
                    show: true,
                  });
                }}
              >
                <span className="material-symbols-outlined">
                  manage_accounts
                </span>
                {roomNotification.count > 0 && (
                  <div>{roomNotification.count}</div>
                )}
              </button>
              <button
                onClick={(e) => {
                  dispatch(roomReset());
                  dispatch(userReset());
                  dispatch(chatReset());
                  logout("");
                  dispatch(apiSlice.util.resetApiState());
                  socket.disconnect()
                }}
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
            {myRooms && myrooms.display && (
              <div className={myroomsDiv()}>
                {myRooms.map((room: Room, i: number) => (
                  <RoomExcerpt room={room} key={i} showModal={showModal} />
                ))}
              </div>
            )}
          </div>
        }
        <h1>{user.name}</h1>
      </header>
      {latest?.status || roomsLoading ? (
        <Spinner />
      ) : (
        <div className="allrooms">
          <div className="joinmessage">
            Join or Enter a Room to Join the Conversation{" "}
          </div>
          <div>
            <h2>Top Rooms</h2>
            <hr />
            {latest?.toprooms?.length == 0 ? (
              <Nothing />
            ) : (
              <div>
                {latest!.toprooms!.map((room: Room, i: number) => (
                  <RoomExcerpt room={room} key={i} setJoined={setJoined} />
                ))}
              </div>
            )}
          </div>
          <div>
            <h2>Check these out</h2>
            <hr />
            {latest?.others?.length == 0 ? (
              <Nothing />
            ) : (
              <div>
                {latest!.others!.map((room: Room, i: number) => (
                  <RoomExcerpt room={room} key={i} setJoined={setJoined} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
