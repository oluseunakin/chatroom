import { useState, useEffect } from "react";
import { Conversation } from "../type";

export function useList(props: {
  newData?: Conversation;
  oldData: Conversation[];
  divRef?: React.RefObject<HTMLDivElement>;
}) {
  const { newData, oldData, divRef } = props;
  const [index, setIndex] = useState(-1);
  const [init, setInit] = useState(false);
  const [internalList, setInternalList] = useState<Conversation[]>(oldData);

  useEffect(() => {
    setInternalList(oldData);
  }, [oldData]);

  useEffect(() => {
    if (init) {
      setInternalList((oldList) => {
        let updatedList = [...oldList];
        updatedList.splice(index, 0, newData!);
        return updatedList;
      });
    }
  }, [index]);

  useEffect(() => {
    if (init && newData && divRef) {
      setIndex(Math.ceil(divRef.current!.scrollTop / 220));
    }
  }, [newData]);

  useEffect(() => {
    setInit(true);
  }, []);

  return { internalList, index };
}
