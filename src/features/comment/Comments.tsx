import { useRef, useState } from "react";
import { socket } from "../socket";
import { Conversation, Message, Room, User } from "../../type";
import { ConversationComponent } from "../conversation/Conversation";
import { useList } from "../../components/useList";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../user/userStore";
import { RootState } from "../../store";
import { useCommentMutation } from "../api/apiSlice";
import { getCommentState, getComments, reset } from "./commentStore";
import { Spinner } from "../../components/Spinner";
import { update } from "../conversation/conversationStore";

export const Comments = () => {
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const dispatch = useDispatch();
  const commentState = useSelector((state: RootState) =>
    getCommentState(state)
  );
  const comments = useSelector<RootState, Conversation[]>((state) =>
    getComments(state)
  );
  const [comment, { isLoading: commentLoading }] = useCommentMutation();
  const talker = useSelector<RootState, User>((state) => getUser(state));
  const divRef = useRef<HTMLDivElement>(null);
  const [newData, setNewData] = useState<Conversation>();
  const { internalList, index } = useList({
    newData,
    oldData: comments,
    divRef,
  });

  function isNew(i: number) {
    if (index === i) return true;
    else return false;
  }

  socket.on("comment", (data) => {
    const convo = commentState.convo
    dispatch(update({id: convo.id, changes: {commentsCount: convo.commentsCount + 1}}))
    setNewData(data);
  });

  return (
    <div className="commentDiv" ref={divRef}>
      <div className="close">
        <button
          onClick={() => {
            dispatch(reset());
          }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      {commentLoading ? (
        <Spinner />
      ) : (
        <div className="conversations">
          {internalList.map((conversation: Conversation, i: number) => (
            <ConversationComponent
              key={conversation.id}
              convo={conversation}
              room={commentState.room}
              isNew={isNew(i)}
            />
          ))}
        </div>
      )}
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
              room: { id: commentState.room.id, name: commentState.room.name },
              message,
              talker,
            };
            commentRef.current!.value = "";
            const createdComment = await comment({
              comment: newComment,
              conversationId: commentState.convo.id!,
            }).unwrap();
            socket.emit("commented", createdComment, commentState.room.id);
            
          }}
          className="material-symbols-outlined"
        >
          send
        </span>
      </div>
    </div>
  );
};
