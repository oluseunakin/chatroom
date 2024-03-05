import { Conversation, Room, User } from "../../type";
import { ConversationComponent } from "./Conversation";
import { useList } from "../../components/useList";
import { useDispatch, useSelector } from "react-redux";
import { getRoom, setNewConversation } from "./conversationStore";
import { RootState } from "../../store";
import { socket } from "../socket";
import { getUser } from "../user/userStore";
import { useEffect } from "react";

export const Conversations = (props: {
  divRef: React.RefObject<HTMLDivElement>;
}) => {
  const { divRef } = props;
  const dispatch = useDispatch();
  const me = useSelector<RootState, User>((state) => getUser(state));
  const room = useSelector<RootState, Room>((state) => getRoom(state));
  const { internalList, index } = useList({ divRef });

  useEffect(() => {
    const newConverse = (data: Conversation) => {
      if (data.talker?.id !== me.id) {
        dispatch(setNewConversation(data));
      }
    };
    socket.on("nc", newConverse);
  }, []);

  function isNew(i: number) {
    if (index === i) return true;
    else return false;
  }

  return (
    <>
      {internalList.length > 0 &&
        internalList.map((data: Conversation, i: number) => (
          <ConversationComponent
            key={data.id}
            conversation={data}
            room={room}
            isNew={isNew(i)}
          />
        ))}
    </>
  );
};
