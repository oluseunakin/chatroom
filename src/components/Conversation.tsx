import { Conversation } from "../type";
import { MessageComponent } from "./Message";

export const ConversationComponent = (props: { convo: Conversation }) => {
  const { convo } = props;
  return (
    <div>
      <h4>{convo.talkerName}</h4>
      <MessageComponent message={convo.message} />
    </div>
  );
};
