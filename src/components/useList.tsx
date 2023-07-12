import { useState, useEffect } from "react";
import { Conversation } from "../type";

export function useList(props: {
  newData: Conversation | undefined;
  oldData: Conversation[];
  divRef?: React.RefObject<HTMLDivElement>;
}) {
  const { newData, oldData, divRef } = props;
  const [index, setIndex] = useState(-1);
  const [internalList, setInternalList] = useState<Conversation[]>(oldData);
  useEffect(() => {
    oldData && setInternalList(oldData);
  }, [oldData]);

  useEffect(() => {
    if (index != -1) {
      setInternalList((oldList) => {
        let updatedList = [...oldList];
        updatedList.splice(index, 0, newData!);
        return updatedList;
      });
    }
  }, [index]);

  useEffect(() => {
    if (newData && newData?.id != -1 && divRef?.current) {
      setIndex(Math.ceil(divRef.current.scrollTop / 222));
    }
  }, [newData]);

  return { internalList, index };
}
