import { useState, useEffect } from "react";
import { Conversation } from "../type";
import { useSelector } from "react-redux";
import { getConversations, getNewConversation } from "../features/conversation/conversationStore";
import { RootState } from "../store";

export function useList(props: {
  divRef?: React.RefObject<HTMLDivElement>;
}) {
  const { divRef} = props;
  const conversations = useSelector<RootState, Conversation[]>((state) =>
    getConversations(state)
  );
  const newConversation = useSelector<RootState, Conversation>((state) =>
    getNewConversation(state)
  );
  const [index, setIndex] = useState(-1);
  const [internalList, setInternalList] = useState<Conversation[]>(conversations);

  useEffect(() => {
    conversations && setInternalList(conversations);
  }, [conversations]);
  
  useEffect(() => {
    if (newConversation && newConversation?.id != -1 && divRef?.current) {
      setIndex(Math.ceil(divRef.current.scrollTop / 222));
    }
  }, [newConversation]);

  useEffect(() => {
    if (index != -1) {
      setInternalList((oldList) => {
        let updatedList = [...oldList];
        newConversation && updatedList.splice(index, 0, newConversation!);
        return updatedList;
      });
    }
  }, [index]);

  return { internalList, index };
}
