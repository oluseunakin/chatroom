import { useDispatch, useSelector } from "react-redux";
import { useGetChatQuery } from "../api/apiSlice";
import { getUser } from "../user/userStore";
import type { RootState } from "../../store";
import type { Message } from "../../type";
import { useMemo, useRef, useState } from "react";
import { socket } from "../socket";
import { getReceiver, setChat } from "./chatStore";

export const ChatComponent = () => {
  const dispatch = useDispatch();
  const receiver = useSelector<RootState, string>((state) =>
    getReceiver(state)
  );
  const [chats, setChats] = useState<Message[]>([]);
  const sender = useSelector<RootState, string>((state) => getUser(state));
  const chatRef = useRef<HTMLInputElement>(null);
  const { data: chatFromServer, isLoading: chatLoading } = useGetChatQuery({
    sender,
    receiver,
  });
  const messages = useMemo<Message[]>(() => {
    if (chatFromServer) return chatFromServer.messages;
    return [];
  }, [chatFromServer]);
  if (chatLoading) return <div>Loading</div>;

  function setClassname(senderr: string) {
    return senderr === sender ? "sender" : "receiver";
  }

  socket.on("receiveChat", (chat: Message) => {
    setChats([...chats, chat])
  });
  return (
    <div className="chat">
      <div className="close">
        <button
          onClick={() => {
            dispatch(
              setChat((chat: { showChat: boolean; receiver: string }) => ({
                ...chat,
                showChat: true,
              }))
            );
          }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <h3>{receiver}</h3>
      </div>
      <div>
        {messages.map((message, i, arr) => {
          const last = i === 0 ? message : arr[i - 1];
          return (
            <div>
              {(last.createdAt !== message.createdAt || i === 0) && (
                <h5>{message.createdAt}</h5>
              )}
              <div className={setClassname(message.sender)}>{message.text}</div>
            </div>
          );
        })}
        {chats.length > 0 &&
          chats.map((rc, i) => {
            return i === 0 && messages.length > 0 &&
              messages[messages.length - 1].createdAt !== rc.createdAt ? (
              <div key={i}>
                <h5>{rc.createdAt}</h5>
                <div className={setClassname(rc.sender)}>{rc.text}</div>
              </div>
            ) : (
              <div className={setClassname(rc.sender)} key={i}>
                {rc.text}
              </div>
            );
          })}
      </div>
      <div>
        <input
          placeholder="Chat"
          ref={chatRef}
          onKeyUp={(e) => {
            console.log(e.key)
            if (e.key === "Enter") {
              const c: Message = {
                text: chatRef.current!.value,
                createdAt: new Date().toDateString(),
                sender,
              };
              chatRef.current!.value = ''
              socket.emit("chat", receiver, c);
              setChats([...chats, c]);
            }
          }}
        />
      </div>
    </div>
  );
};
