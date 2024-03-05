import { useDispatch, useSelector } from "react-redux";
import { useGetChatQuery, useSetChatMutation } from "../api/apiSlice";
import { getUser } from "../user/userStore";
import type { RootState } from "../../store";
import { MessageType, type Message, type User } from "../../type";
import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import { Spinner } from "../../components/Spinner";
import { MessageComponent } from "../../components/Message";
import { getRoom } from "../roomname";
import { getReceiver } from "./chatStore";
import { showModal } from "../modal";

export const ChatComponent = (props: { messages?: Message[] }) => {
  const { messages } = props;
  const dispatch = useDispatch();
  const receiver = useSelector<RootState, User>((state) => getReceiver(state));
  const sender = useSelector<RootState, User>((state) => getUser(state));
  const roomid = useSelector<RootState, number>((state) => getRoom(state));
  const chatRef = useRef<HTMLTextAreaElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const {
    data: chatFromServer,
    isLoading: chatLoading,
    refetch,
  } = useGetChatQuery(receiver.id);
  const [chats, setChats] = useState<Message[]>(() => messages ?? []);
  const [chatsToServer, setChatsToServer] = useState<Message[]>([]);
  const [sendChat, { isSuccess }] = useSetChatMutation();

  useEffect(() => {
    if (chatFromServer) setChats([...chats, ...chatFromServer.messages]);
  }, [chatFromServer]);

  useEffect(() => {
    socket.on("receiveChat", (newChat: Message) => {
      setChats([...chats, newChat]);
    });
  }, []);

  return chatLoading ? (
    <Spinner />
  ) : (
    <div className="modal">
      <div className="close">
        <button
          onClick={() => {
            !messages && sendChat({ receiverId: receiver.id!, message: chatsToServer });
            dispatch(showModal({ display: false, type: "close" }));
          }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="chatdiv">
        <h3>{receiver.name}</h3>
        <div ref={divRef}>
          {chats.length > 0 &&
            chats.map((chat, i) => <MessageComponent message={chat} key={i} />)}
        </div>
        <div>
          <textarea
            placeholder="Chat"
            ref={chatRef}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const message: Message = {
                  text: chatRef.current!.value,
                  createdAt: new Date().toDateString(),
                  type: MessageType.SENT,
                };
                chatRef.current?.value;
                setChats([...chats, message]);
                setChatsToServer([...chatsToServer, message]);
                socket.emit("newchat", sender, `${receiver.name}${roomid}`, {
                  ...message,
                  type: MessageType.RECEIVED,
                });
              }
            }}
          ></textarea>
          <span
            className="material-symbols-outlined"
            onClick={() => {
              const message: Message = {
                text: chatRef.current!.value,
                createdAt: new Date().toDateString(),
                type: MessageType.SENT,
              };
              setChats([...chats, message]);
              setChatsToServer([...chatsToServer, message]);
              socket.emit("newchat", sender.name, `${receiver.name}${roomid}`, {
                ...message,
                type: MessageType.RECEIVED,
              });
            }}
          >
            send
          </span>
        </div>
      </div>
    </div>
  );
};
