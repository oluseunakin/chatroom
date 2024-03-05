import { useEffect, useRef, useState } from "react";
import { useAgreeMutation, useLazyGetCommentsQuery } from "../api/apiSlice";
import { Conversation, Room, User } from "../../type";
import { useDisagreeMutation } from "../api/apiSlice";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../user/userStore";
import { RootState } from "../../store";
import { socket } from "../socket";
import { Spinner } from "../../components/Spinner";
import { Comments } from "../../components/Comments";

export const ConversationComponent = (props: {
  conversation: Conversation;
  room: Room;
  isNew?: boolean;
}) => {
  const [iAgree] = useAgreeMutation();
  const [iDisagree] = useDisagreeMutation();
  const me = useSelector<RootState, User>((state) => getUser(state));
  const [getComments, { isLoading }] = useLazyGetCommentsQuery();
  const { conversation, room, isNew } = props;
  const [agree, setAgree] = useState(() =>
    conversation.agree ? conversation.agree : []
  );
  const [disagree, setDisagree] = useState(() =>
    conversation.disagree ? conversation.disagree : []
  );
  const divRef = useRef<HTMLDivElement>(null);
  const [comments, setComments] = useState<Conversation[] | undefined>();
  const dispatch = useDispatch();

  /* useEffect(() => {
    if (reload) {
      agree({ data: oldagree!, conversationId: convo.id! });
      socket.emit("agreed", room.id, convo.id, talker.id, oldagree);
      setReload(false);
    }
  }, [oldagree]);

  useEffect(() => {
    if (reload) {
      disagree({ data: oldDisagree!, conversationId: convo.id! });
      socket.emit("disagreed", convo.room.id, convo.id, talker.id, oldDisagree);
      setReload(false);
    }
  }, [oldDisagree]); */

  useEffect(() => {
    socket
      .on("comment", (data: Conversation) => {})
      .on("agree", (conversationId, agreer: User) => {
        conversation.id == conversationId && setAgree([...agree!, agreer]);
      })
      .on("disagree", (conversationId, disagreer: User) => {
        conversation.id == conversationId &&
          setDisagree([...disagree!, disagreer]);
      });
  }, []);

  useEffect(() => {
    if (divRef.current && isNew) {
      const div = divRef.current;
      div.style.backgroundColor = "green";
      setTimeout(() => {}, 10000);
      div.style.backgroundColor = "unset";
    }
  }, [isNew]);

  return (
    <div ref={divRef} className="conversediv">
      <h3>{conversation.talker?.name}</h3>
      <div>{conversation.convo}</div>
      <div>{new Date(conversation.createdAt).toDateString()}</div>
      <div>
        <button
          onClick={async () => {
            setAgree([...agree!, me]);
            socket.emit("useragree", me, conversation.id);
            await iAgree({ conversationId: conversation.id!, data: me.id! });
          }}
        >
          <span>{agree.length}</span>
          <span className="material-symbols-outlined agree">
            sentiment_very_satisfied
          </span>
        </button>
        <button
          onClick={async () => {
            setDisagree([...disagree!, me]);
            socket.emit("userdisagree", me, conversation.id);
            await iDisagree({ conversationId: conversation.id!, data: me.id! });
          }}
        >
          <span>{disagree.length}</span>
          <span className="material-symbols-outlined disagree">
            sentiment_very_dissatisfied
          </span>
        </button>
        <button
          onClick={async () => {
            const comments = await getComments(conversation.id!).unwrap();
            setComments(comments.comments);
          }}
        >
          <span>{conversation._count.comments}</span>
          <span className="material-symbols-outlined comment">reply</span>
        </button>
      </div>
      {comments && (
        <Comments comments={comments} room={room} convo={conversation} />
      )}
      {isLoading && <Spinner />}
    </div>
  );
};
