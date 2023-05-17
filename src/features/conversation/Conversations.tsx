import { Conversation, Room } from "../../type";
import { ConversationComponent } from "./Conversation";
import { useList } from "../../components/useList";
import { useSelector } from "react-redux";
import {
  getConversations,
  getNewConversation,
  getRoom,
} from "./conversationStore";
import { RootState } from "../../store";

export const Conversations = (props: {
  divRef: React.RefObject<HTMLDivElement>;
}) => {
  const { divRef } = props;
  const conversations = useSelector<RootState, Conversation[]>((state) =>
    getConversations(state)
  );
  const newData = useSelector<RootState, Conversation>((state) =>
    getNewConversation(state)
  );
  const room = useSelector<RootState, Room>((state) => getRoom(state));
  const { internalList, index } = useList({
    newData,
    oldData: conversations,
    divRef,
  });

  function isNew(i: number) {
    if (index === i) return true;
    else return false;
  }

  return (
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
  );
};
