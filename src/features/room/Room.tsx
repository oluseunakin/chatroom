import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { Message, Room, User } from "../../type";
import {
  useGetRoomWithConversationsQuery,
  useJoinRoomMutation,
  useLeaveRoomMutation,
  useSayConversationMutation,
} from "../api/apiSlice";
import { useEffect, useMemo, useRef, useState } from "react";
import { getUser } from "../user/userStore";
import { socket } from "../socket";
import { Spinner } from "../../components/Spinner";
import { Conversations } from "../conversation/Conversations";
import { enterRoom, getRoom, leaveRoom } from "../roomname";
import {
  setConversationRoom,
  setConversations,
  reset,
  setNewConversation,
} from "../conversation/conversationStore";
import { ChatNotification } from "../notifications/ChatNotification";
import { Notification } from "../notifications/Notification";
import { RoomMembers } from "../../components/RoomMembers";
import { showModal } from "../modal";
import { Live } from "../live/Live";
import { getLive, setLive } from "../live/liveStore";

export function RoomExcerpt(props: { room: Room }) {
  const { room } = props;
  const dispatch = useDispatch();

  return (
    <div
      className="card"
      onClick={() => {
        dispatch(showModal({ type: "rc", display: true }));
        dispatch(enterRoom(room.id));
      }}
    >
      <h3>{room.name}</h3>
      <span className="material-symbols-outlined">door_open</span>
    </div>
  );
}

export function RoomComponent() {
  const me = useSelector<RootState, User>((state) => getUser(state));
  const [roomModal, setRoomModal] = useState({ display: false, type: "" });
  const divRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const entered = useSelector<RootState, number>((state) => getRoom(state));
  const { currentData, isLoading: roomLoading } =
    useGetRoomWithConversationsQuery(entered);
  const [becomeMember, { isLoading: joinRoomLoading }] = useJoinRoomMutation();
  const [unsubscribe, { isLoading: leaveRoomLoading }] = useLeaveRoomMutation();
  const [isMember, setIsMember] = useState(false);
  const isOwner = useMemo(
    () => me.id == currentData?.room?.creatorId,
    [currentData?.room, me]
  );
  const sayRef = useRef<HTMLTextAreaElement>(null);
  const [converse, { isLoading: converseLoading }] =
    useSayConversationMutation();
  const [chatNotification, setChatNotification] = useState<{
    messages: Message[];
    count: number;
    sender: User | null;
  }>({
    messages: [],
    count: 0,
    sender: null,
  });
  const [notification, setNotification] = useState<{
    noti: string[];
    count: number;
  }>({ noti: [], count: 0 });
  const live = useSelector<RootState, { laiver: string; isLive: boolean }>(
    (state) => getLive(state)
  );

  useEffect(() => {
    if (currentData?.room) {
      setIsMember(currentData.isMember);
    }
  }, [currentData, me]);

  useEffect(() => {
    if (currentData && currentData.room && currentData.room.conversations) {
      dispatch(setConversations(currentData.room.conversations));
      dispatch(
        setConversationRoom({
          id: currentData.room.id,
          name: currentData.room.name,
        })
      );
    }
  }, [currentData]);

  useEffect(() => {
    socket
      .on("receiveChat", (message, sender) => {
        setChatNotification({
          ...chatNotification,
          count: chatNotification.count + 1,
          messages: [...chatNotification.messages!, message],
          sender,
        });
      })
      .on("joinedroom", (message, joiner) => {
        if (joiner !== me.name)
          setNotification({
            ...notification,
            noti: [message, ...notification.noti],
            count: notification.count + 1,
          });
      })
      .on("leftroom", (message, lefter) => {
        if (lefter !== me.name)
          setNotification({
            ...notification,
            noti: [message, ...notification.noti],
            count: notification.count + 1,
          });
      })
      .on("setupLive", (sender: string) => {
        if (sender !== me.name) {
          dispatch(setLive({ laiver: sender, isLive: true, type: "incoming" }));
        }
      });
  }, []);

  useEffect(() => {
    isMember && socket.emit("inroom", entered, me.name);
  }, [isMember]);

  if (roomLoading) return <Spinner />;

  return (
    <div className="modal" ref={divRef}>
      {live.isLive && <Live />}
      {roomModal.display && roomModal.type === "roomnoti" && (
        <Notification
          roomNotification={notification}
          setRoomModal={setRoomModal}
        />
      )}
      {roomModal.display && roomModal.type === "members" && (
        <RoomMembers setRoomModal={setRoomModal} />
      )}
      {roomModal.display && roomModal.type === "chatnoti" && (
        <ChatNotification
          sender={chatNotification.sender!}
          messages={chatNotification.messages!}
          setChatNotification={setChatNotification}
          setRoomModal={setRoomModal}
        />
      )}
      <div className="close">
        <button
          onClick={() => {
            dispatch(leaveRoom());
            dispatch(reset());
            dispatch(showModal({ display: false, type: "close" }));
          }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="rfdiv">
        <div>
          <h2>{currentData!.room!.name}</h2>
          <h3>{currentData!.room!.topic!.name}</h3>
        </div>
        <div>
          {!isOwner &&
            (isMember ? (
              <button
                onClick={async () => {
                  await unsubscribe(currentData!.room?.id);
                  socket.emit(
                    "leaveroom",
                    currentData!.room?.id,
                    currentData!.room?.name,
                    me.name
                  );
                }}
              >
                Leave
              </button>
            ) : (
              <button
                onClick={async () => {
                  await becomeMember(currentData!.room?.id);
                  socket.emit(
                    "joinroom",
                    currentData!.room?.id,
                    currentData!.room?.name,
                    me.name
                  );
                }}
              >
                Join
              </button>
            ))}
          {(isMember || isOwner) && (
            <>
              <button
                onClick={() => {
                  setRoomModal({ display: true, type: "members" });
                }}
              >
                <span className="material-symbols-outlined">group</span>
              </button>
              <button
                onClick={() => {
                  setRoomModal({ display: true, type: "chatnoti" });
                }}
              >
                <span className="material-symbols-outlined">message</span>
                {chatNotification.count > 0 && (
                  <div>{chatNotification.count}</div>
                )}
              </button>
              <button
                onClick={() => {
                  setNotification({
                    ...notification,
                    count: notification.count - 1,
                  });
                  setRoomModal({ display: true, type: "roomnoti" });
                }}
              >
                <span>notification</span>
                {notification.count > 0 && (
                  <span className="noti">{notification.count}</span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
      {(isMember || isOwner) &&
        (converseLoading ? (
          <Spinner />
        ) : (
          <div className="convo">
            <div>
              {currentData && currentData.room && (
                <Conversations divRef={divRef} />
              )}
            </div>
            <div>
              <textarea ref={sayRef} placeholder="Say Hello"></textarea>

              <label>
                <span>Add Media</span>
                <input type="file" />
              </label>
              <button
                onClick={async () => {
                  const said = sayRef.current?.value!;
                  const newConversation = await converse({
                    roomId: currentData!.room!.id,
                    convo: said,
                  }).unwrap();
                  sayRef.current!.value = "";
                  dispatch(setNewConversation(newConversation));
                  socket.emit("newconversation", newConversation);
                }}
              >
                <span className="material-symbols-outlined">send</span>
              </button>
              <button
                onClick={() => {
                  dispatch(
                    setLive({ laiver: me.name, type: "going", isLive: true })
                  );
                }}
              >
                Go Live
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
