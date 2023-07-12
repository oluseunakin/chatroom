import { Conversation, Room, User } from "../../type";
import { ConversationComponent } from "./Conversation";
import { useList } from "../../components/useList";
import { useDispatch, useSelector } from "react-redux";
import {
  getConversations,
  getNewConversation,
  getRoom,
  setNewConversation,
} from "./conversationStore";
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
  const newData = useSelector<RootState, Conversation>((state) =>
    getNewConversation(state)
  );
  const conversations = useSelector<RootState, Conversation[]>((state) =>
    getConversations(state)
  );
  const room = useSelector<RootState, Room>((state) => getRoom(state));
  const { internalList, index } = useList({
    newData,
    oldData: conversations,
    divRef,
  });

  useEffect(() => {
    const newConverse = (data: Conversation) => {
      /* if (data.talker?.id !== me.id) {
        dispatch(setNewConversation(data));
      } */
      dispatch(setNewConversation(data));
    };
    socket.on("messages", newConverse);
    return () => {
      socket.off("messages", newConverse);
    };
  });

  function isNew(i: number) {
    if (index === i) return true;
    else return false;
  }

  return (
    <>
      {internalList.length > 0 && (
        <div className="conversations">
          {internalList.map((conversation: Conversation, i: number) => (
            <ConversationComponent
              key={conversation.id}
              convo={conversation}
              room={room}
              isNew={isNew(i)}
            />
          ))}
        </div>
      )}
    </>
  );
};
