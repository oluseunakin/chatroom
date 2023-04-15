import type { Message } from "../type";

export const MessageComponent = (props: { message: Message }) => {
  const { message } = props;
  return (
    <div>
      <div>{message.text}</div>
      <div>{message.createdAt}</div>
    </div>
  );
};
