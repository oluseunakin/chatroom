import { useEffect, useRef, useState } from "react";
import { useAgreeMutation, useLazyGetCommentsQuery } from "../api/apiSlice";
import { Conversation, Room, User } from "../../type";
import { useDisagreeMutation } from "../api/apiSlice";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../user/userStore";
import { RootState } from "../../store";
import { socket } from "../socket";
import { setCommentState, setComments } from "../comment/commentStore";
import {
  agree as setAg,
  disagree as setDg,
  update,
} from "../conversation/conversationStore";
import { Spinner } from "../../components/Spinner";

export const ConversationComponent = (props: {
  convo: Conversation;
  room: Room;
  isNew?: boolean;
}) => {
  const [agree] = useAgreeMutation();
  const [disagree] = useDisagreeMutation();
  const [getComments, {isLoading}] = useLazyGetCommentsQuery();
  const { convo, room, isNew } = props;
  const [reload, setReload] = useState(false);
  const [agreeReload, setAgreeReload] = useState({ id: -1, data: [] });
  const [disagreeReload, setDisagreeReload] = useState({ id: -1, data: [] });
  const divRef = useRef<HTMLDivElement>(null);
  const oldagree = convo.agree;
  const oldDisagree = convo.disagree;
  const talker = useSelector<RootState, User>((state) => getUser(state));
  const dispatch = useDispatch();

  useEffect(() => {
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
  }, [oldDisagree]);

  useEffect(() => {
    if (agreeReload.id !== -1) {
      dispatch(
        update({ id: agreeReload.id, changes: { agree: agreeReload.data } })
      );
    }
  }, [agreeReload]);

  useEffect(() => {
    if (disagreeReload.id !== -1)
      dispatch(
        update({
          id: disagreeReload.id,
          changes: { disagree: disagreeReload.data },
        })
      );
  }, [disagreeReload]);

  socket
    .on("comment", (data: Conversation) => {
      //setNewData(data);
    })
    .on("agree", (id, userid, data) => {
      userid !== talker.id && setAgreeReload({ id, data });
    })
    .on("disagree", (id, userid, data) => {
      userid !== talker.id && setDisagreeReload({ id, data });
    });

  return (
    <div ref={divRef}>
      {isNew && <h5>New</h5>}
      <h4>{convo.talker?.name}</h4>
      <div>
        <div>{convo.message.text}</div>
        <div>{convo.message.createdAt}</div>
      </div>
      <div>
        <button
          onClick={() => {
            dispatch(setAg({ id: convo.id, userid: talker.id }));
            setReload(true);
          }}
        >
          <span className="material-symbols-outlined agree">
            sentiment_very_satisfied
          </span>
          {oldagree!.length}
          <span></span>
        </button>
        <button
          onClick={() => {
            dispatch(setDg({ userid: talker.id, id: convo.id }));
            setReload(true);
          }}
        >
          <span className="material-symbols-outlined disagree">
            sentiment_very_dissatisfied
          </span>
          <span>{oldDisagree!.length}</span>
        </button>
        <button
          onClick={async () => {
            const comments = await getComments(convo.id!).unwrap();
            dispatch(
              setCommentState({
                showComment: true,
                room: { id: room.id, name: room.name },
                convo: {id: convo.id, commentsCount: convo.commentsCount},
              })
            );
            dispatch(setComments(comments.comments));
          }}
        >
          <span className="material-symbols-outlined comment">reply</span>
          <span>{convo.commentsCount}</span>
        </button>
      </div>
      {isLoading && <Spinner />}
    </div>
  );
};
