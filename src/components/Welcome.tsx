import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  apiSlice,
  useDeleteMutation,
  useGetUserQuery,
  useLogoutMutation,
} from "../features/api/apiSlice";
import { RoomComponent } from "../features/room/Room";
import { getUser, reset as userReset } from "../features/user/userStore";
import { RootState } from "../store";
import { socket } from "../features/socket";
import { Notification } from "../features/notifications/Notification";
import { Spinner } from "./Spinner";
import { getRoom } from "../features/roomname";
import "../styles/welcome.css";
import { CreateRoom } from "./CreateRoom";
import { RoomList } from "./RoomList";
import { getModal, showModal } from "../features/modal";
import { getJoinedRooms, getMyRooms } from "../features/room/roomStore";
import { Room, User } from "../type";

export function Welcome() {
  const dispatch = useDispatch();
  const modal = useSelector<RootState, { display: boolean; type: string }>(
    (state) => getModal(state)
  );
  const me = useSelector<RootState, User>((state) => getUser(state));
  const { data: user, isLoading: userLoading } = useGetUserQuery("");
  const enteredRoom = useSelector<RootState, number>((state) => getRoom(state));
  const [pageno, setPageNo] = useState(0);
  const [logout] = useLogoutMutation();
  const deleteRef = useRef<HTMLInputElement>(null);
  const [deleete] = useDeleteMutation();
  const [notification, setNotification] = useState<{
    count: number;
    noti: string[];
  }>({
    count: 0,
    noti: [],
  });
  const [type, setType] = useState("myrooms");
  const myRooms = useSelector<RootState, Room[]>((state) => getMyRooms(state));
  const joinedRooms = useSelector<RootState, Room[]>((state) =>
    getJoinedRooms(state)
  );

  function bodyScroll() {
    window.requestAnimationFrame(() => {
      const loadPosition = Math.floor(0.9 * document.body.scrollHeight);
      const scrollHeight = window.scrollY + window.innerHeight;
      if (scrollHeight >= loadPosition) {
        setPageNo((pageno) => pageno++);
      }
    });
  }

  useEffect(() => {
    window.addEventListener("scroll", bodyScroll);
  }, []);

  useEffect(() => {
    const joinedRoom = (message: string) => {
      setNotification({
        ...notification,
        noti: [message, ...notification.noti],
        count: notification.count + 1,
      });
    };
    socket.connect().on("joinedroom", joinedRoom);
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (myRooms && joinedRooms)
      socket.emit(
        "online",
        me.name,
        myRooms && myRooms.map((room: Room) => room.id),
        joinedRooms && joinedRooms.map((room: Room) => room.id)
      );
  });

  if (userLoading) return <Spinner />;

  return (
    <>
      {modal.display && modal.type === "noti" && (
        <Notification
          roomNotification={notification}
        />
      )}
      {modal.display && modal.type === "rc" && enteredRoom != -1 && (
        <RoomComponent />
      )}
      {modal.display && modal.type === "cr" && <CreateRoom />}
      <header>
        <h1>{user!.name}</h1>
        <div>
          <button
            onClick={() => {
              dispatch(showModal({ display: true, type: "cr" }));
            }}
          >
            Create a Room
          </button>
          <button
            onClick={() => {
              setNotification({
                ...notification,
                count: notification.count - 1,
              });
              dispatch(showModal({ display: true, type: "noti" }));
            }}
          >
            <span className="material-symbols-outlined">manage_accounts</span>
            {notification.count > 0 && (
              <span>{notification.count}</span>
            )}
          </button>
          <button
            onClick={() => {
              dispatch(userReset());
              localStorage.clear();
              logout("");
              dispatch(apiSlice.util.resetApiState());
              socket.disconnect();
            }}
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>
      <div>
        <main>
          <h2>
            <button
              onClick={() => {
                setType("myrooms");
              }}
            >
              <span>My Rooms</span>
            </button>
            <button
              onClick={() => {
                setType("joinedrooms");
              }}
            >
              Following
            </button>
            <button onClick={() => setType("allrooms")}>See All Rooms</button>
          </h2>
          <RoomList type={type} />
        </main>
        <aside>Aside</aside>
      </div>
    </>
  );
}
