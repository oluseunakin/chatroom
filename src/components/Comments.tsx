import { useEffect, useRef, useState } from "react";
import { socket } from "../features/socket";
import { Conversation, Message, Room, User } from "../type";
import { ConversationComponent } from "../features/conversation/Conversation";
import { useList } from "./useList";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../features/user/userStore";
import { RootState } from "../store";
import { useCommentMutation } from "../features/api/apiSlice";
import { Spinner } from "./Spinner";
import { update } from "../features/conversation/conversationStore";
import Nothing from "./Nothing";

export const Comments = (props: {
  comments: Conversation[];
  room: Room;
  convo: Conversation;
}) => {
  const { comments, room, convo } = props;
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const dispatch = useDispatch();
  const [comment, { isLoading: commentLoading }] = useCommentMutation();
  const talker = useSelector<RootState, User>((state) => getUser(state));
  const divRef = useRef<HTMLDivElement>(null);
  const [newData, setNewData] = useState<Conversation>();
  const { internalList, index } = useList({
    newConversation: newData,
    oldData: comments,
    divRef,
  });

  function isNew(i: number) {
    if (index === i) return true;
    else return false;
  }

  /* useEffect(() => {
    const commented = (data: Conversation) => {
      dispatch(
        update({
          id: convo.id!,
          changes: { commentsCount: convo.commentsCount! + 1 },
        })
      );
      setNewData(data);
    };
    socket.on("comment", commented);
    return () => {
      socket.off("comment", commented);
    };
  }); */

  if (commentLoading) return <Spinner />;
  return (
    <div className="commentDiv">
      <div className="conversations" ref={divRef}>
        {!internalList || internalList.length == 0 ? (
          <Nothing />
        ) : (
          internalList.map((conversation: Conversation, i: number) => (
            <ConversationComponent
              key={conversation.id}
              conversation={conversation}
              room={room}
              isNew={isNew(i)}
            />
          ))
        )}
      </div>
      <div>
        <textarea ref={commentRef} placeholder="Comment here"></textarea>
        <span
          onClick={async () => {
            const said = commentRef.current?.value!;
            const message: Message = {
              text: said,
              createdAt: new Date().toDateString(),
              senderId: talker.id!,
              senderName: talker.name,
            };
            const newComment: Conversation = {
              room: { id: room.id, name: room.name },
              
              talker,
            };
            commentRef.current!.value = "";
            const createdComment = await comment({
              comment: newComment,
              conversationId: convo.id!,
            }).unwrap();
            socket.emit("commented", createdComment, room.id);
          }}
          className="material-symbols-outlined"
        >
          send
        </span>
      </div>
    </div>
  );
};
