import type { CN, Message } from "../../type";
import { useDispatch } from "react-redux";
import { setChat } from "../chat/chatStore";

export const ChatNotification = (props: {
  notifications: Message[];
  setChatNotification: React.Dispatch<React.SetStateAction<CN>>;
}) => {
  const { notifications, setChatNotification } = props;
  const dispatch = useDispatch();
  return (
    <div className="noti">
      {notifications.map((notification, i) => (
        <button
          className="chatnoti"
          key={i}
          onClick={() => {
            dispatch(
              setChat({
                receiver: {
                  name: notification.senderName,
                  id: notification.senderId,
                },
                showChat: true,
              })
            );
            setChatNotification((cn) => ({ ...cn, show: false, count: cn.count-1 }));
          }}
        >
          <p>You have a new message from </p> <h5>{notification.senderName}</h5>
        </button>
      ))}
    </div>
  );
};
