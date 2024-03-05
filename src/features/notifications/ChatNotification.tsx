import type { Message, User } from "../../type";
import { useDispatch, useSelector } from "react-redux";
import { getReceiver, setReceiver } from "../chat/chatStore";
import { RootState } from "../../store";
import { ChatComponent } from "../chat/Chat";

export const ChatNotification = (props: {
  messages: Message[];
  sender: User;
  setChatNotification: React.Dispatch<
    React.SetStateAction<{
      messages: Message[];
      count: number;
      sender: User | null;
    }>
  >;
  setRoomModal: React.Dispatch<
    React.SetStateAction<{
      display: boolean;
      type: string;
    }>
  >;
}) => {
  const { messages, setChatNotification, sender, setRoomModal } = props;
  const dispatch = useDispatch();
  const receiver = useSelector<RootState, User>((state) => getReceiver(state));

  return (
    <div className="modal">
      {receiver.id != -1 && <ChatComponent messages={messages}/>}
      <div className="close">
        <button
          onClick={() => {
            setRoomModal({ display: false, type: "chatnoti" });
          }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="chatnotidiv">
        {messages.map((message, i) => (
          <div>
            <button
              className="chatnoti"
              key={i}
              onClick={() => {
                dispatch(setReceiver(sender));
              }}
            >
              <p>You have a new message from </p> <h5>{sender.name}</h5>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
