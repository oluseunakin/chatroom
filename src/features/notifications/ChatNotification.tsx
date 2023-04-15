import { useEffect, useState } from "react";
import { MessageComponent } from "../../components/Message";
import type { Message } from "../../type";
import { useDispatch, useSelector } from "react-redux";
import { getShowChat, setChat } from "../chat/chatStore";
import { RootState } from "../../store";
import { ChatComponent } from "../chat/Chat";

export const ChatNotification = (props: {
  notifications: Message[];
  showNoti: React.Dispatch<
    React.SetStateAction<{
      room: boolean;
      chat: boolean;
    }>
  >;
}) => {
  const { notifications, showNoti } = props;
  const showChat = useSelector<RootState, boolean>(
    (state) => getShowChat(state)
  );
  const dispatch = useDispatch();

  return (
    <div className="notifications">
      {showChat && <ChatComponent />}
      <div className="close">
        <button onClick={() => showNoti((noti) => ({ ...noti, chat: false }))}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="noti">
        {notifications.map((notification, i) => (
          <button className="chatnoti"
            key={i}
            onClick={() => {
              dispatch(setChat({receiver: notification.sender, showChat: true}))
              showNoti((noti) => ({...noti, chat: false}))
            }}
          >
            <p>You have a new message from </p> <h5>{notification.sender}</h5>
          </button>
        ))}
      </div>
    </div>
  );
};
