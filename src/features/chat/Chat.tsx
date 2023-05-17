import { useDispatch, useSelector } from "react-redux";
import { useGetChatQuery, useSetChatMutation } from "../api/apiSlice";
import { getUser } from "../user/userStore";
import type { RootState } from "../../store";
import type { Message, User } from "../../type";
import { useMemo, useRef, useState } from "react";
import { socket } from "../socket";
import { getReceiver, setShowChat } from "./chatStore";
import { flushSync } from "react-dom";
import { Spinner } from "../../components/Spinner";

export const ChatComponent = (props: { showModal: Function }) => {
  const dispatch = useDispatch();
  const receiver = useSelector<RootState, User>((state) => getReceiver(state));
  const [chats, setChats] = useState<Message[]>([]);
  const sender = useSelector<RootState, User>((state) => getUser(state));
  const chatRef = useRef<HTMLTextAreaElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const { data: chatFromServer, isLoading: chatLoading } = useGetChatQuery(
    receiver.id
  );
  const [sendChat, { isSuccess }] = useSetChatMutation();
  const messages = useMemo<Message[]>(() => {
    if (chatFromServer) return chatFromServer.messages;
    return [];
  }, [chatFromServer]);

  function placeChat(c: Message) {
    flushSync(() => {
      setChats([...chats, c]);
    });
    const div = divRef.current;
    if (div?.scrollTop !== 0) div!.lastElementChild?.scrollIntoView();
  }

  async function sendMsg() {
    const c: Message = {
      text: chatRef.current!.value,
      createdAt: new Date().toDateString(),
      senderId: sender.id!,
      senderName: sender.name,
    };
    chatRef.current!.value = "";
    sendChat({ receiverId: receiver.id!, message: c })
      .unwrap()
      .then(() => {
        socket.emit("chat", receiver, c);
      });
    placeChat(c);
  }
  if (chatLoading) return <Spinner />;

  function setClassname(senderId: number) {
    return senderId === sender.id ? "sender" : "receiver";
  }

  socket.on("receiveChat", (chat: Message) => {
    placeChat(chat);
  });

  return (
    <div className="chat">
      <div>
        <div>
          <button
            onClick={() => {
              dispatch(setShowChat(false));
              props.showModal(false);
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <h3>{receiver.name}</h3>
      </div>
      <div ref={divRef}>
        {messages.map((message, i, arr) => {
          const last = i === 0 ? message : arr[i - 1];
          return (
            <div>
              {(last.createdAt !== message.createdAt || i === 0) && (
                <h5>{message.createdAt}</h5>
              )}
              <div className={setClassname(message.senderId)}>
                {message.text}
              </div>
            </div>
          );
        })}
        {chats.length > 0 &&
          chats.map((rc, i) => {
            return i === 0 &&
              messages.length > 0 &&
              messages[messages.length - 1].createdAt !== rc.createdAt ? (
              <div key={i}>
                <h5>{rc.createdAt}</h5>
                <div className={setClassname(rc.senderId)}>{rc.text}</div>
              </div>
            ) : (
              <div className={setClassname(rc.senderId)} key={i}>
                {rc.text}
              </div>
            );
          })}
      </div>
      <div>
        <textarea
          placeholder="Chat"
          rows={1}
          ref={chatRef}
          onKeyUp={(e) => {
            if (e.key === "Enter") sendMsg();
          }}
        ></textarea>
        <span onClick={() => sendMsg()} className="material-symbols-outlined">
          send
        </span>
      </div>
    </div>
  );
};
