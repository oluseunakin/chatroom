import { useDispatch, useSelector } from "react-redux";
import { useGetChatQuery, useSetChatMutation } from "../api/apiSlice";
import { getUser } from "../user/userStore";
import type { RootState } from "../../store";
import type { Message, User } from "../../type";
import { useEffect, useMemo, useRef, useState } from "react";
import { socket } from "../socket";
import { getReceiver, getShowChat, setShowChat } from "./chatStore";
import { flushSync } from "react-dom";
import { Spinner } from "../../components/Spinner";

export const ChatComponent = () => {
  const dispatch = useDispatch();
  const receiver = useSelector<RootState, User>((state) => getReceiver(state));
  const [chats, setChats] = useState<Message[]>([]);
  const showChat = useSelector<RootState, boolean>((state) =>
    getShowChat(state)
  );
  const sender = useSelector<RootState, User>((state) => getUser(state));
  const chatRef = useRef<HTMLTextAreaElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const {
    data: chatFromServer,
    isLoading: chatLoading,
    refetch,
  } = useGetChatQuery(receiver.id);
  const [sendChat, { isSuccess }] = useSetChatMutation();
  const messages = useMemo<Message[]>(() => {
    if (chatFromServer) return chatFromServer.messages;
    return [];
  }, [chatFromServer]);

  function placeChat(c?: Message) {
    c &&
      flushSync(() => {
        setChats([...chats, c]);
      });
    const div = divRef.current;
    if (div) {
      div!.scrollTop = div!.scrollHeight;
    }
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
        socket.emit("chat", receiver.name, c);
      });
    placeChat(c);
  }

  function setClassname(senderId: number) {
    return senderId === sender.id ? "sender" : "receiver";
  }

  useEffect(() => {
    !isSuccess && placeChat();
  });

  useEffect(() => {
    if (localStorage.getItem("chat")) refetch();
  }, [receiver.id]);

  useEffect(() => {
    return () => {
      localStorage.setItem("chat", receiver.id!.toString());
    };
  });

  useEffect(() => {
    const newChat = (chat: Message) => {
      placeChat(chat);
    };
    socket.on("receiveChat", newChat);
    return () => {
      socket.off("receiveChat", newChat);
    };
  });

  return chatLoading ? (
    <Spinner />
  ) : (
    <div className="chat">
      <div>
        <div>
          <button
            onClick={() => {
              dispatch(setShowChat(false));
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
            <div key={message.id}>
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
              <div key={rc.id}>
                <h5>{rc.createdAt}</h5>
                <div className={setClassname(rc.senderId)}>{rc.text}</div>
              </div>
            ) : (
              <div className={setClassname(rc.senderId)} key={rc.id}>
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
