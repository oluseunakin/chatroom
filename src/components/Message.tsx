import type { Message } from "../type";

export const MessageComponent = (props: { message: Message }) => {
  const { message } = props;
  return (
    <div className={message.type}>
      <p>{message.text}</p>
      <small>{new Date(message.createdAt!).toDateString()}</small>
    </div>
  );
};
