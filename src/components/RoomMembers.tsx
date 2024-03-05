import { useEffect, useMemo, useState } from "react";
import { useGetRoomMembersQuery } from "../features/api/apiSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { getRoom } from "../features/roomname";
import { ChatComponent } from "../features/chat/Chat";
import { socket } from "../features/socket";
import { setReceiver } from "../features/chat/chatStore";
import { getUser } from "../features/user/userStore";
import { User } from "../type";

export const RoomMembers = (props: {
  setRoomModal: React.Dispatch<
    React.SetStateAction<{
      display: boolean;
      type: string;
    }>
  >;
}) => {
  const roomId = useSelector<RootState, number>((state) => getRoom(state));
  const me = useSelector<RootState, User>((state) => getUser(state));
  const [memberPageno, setMemberPageNo] = useState(0);
  const { currentData: currentMembers } = useGetRoomMembersQuery({
    id: roomId,
    pageno: memberPageno,
  });
  const membersWithoutMe = useMemo(
    () =>
      currentMembers ? currentMembers.members.filter((m) => m.id != me.id) : [],
    [currentMembers]
  );
  const [online, setOnline] = useState<number[]>();
  const { setRoomModal } = props;
  const [internalModal, setInternalModal] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    currentMembers &&
      socket
        .emit(
          "isOnline",
          membersWithoutMe.map((cm) => `${cm.name}${roomId}`)
        )
        .on("onlineStatus", (status: boolean[][]) => {
          const isOnlineArray = status.filter((stat, i) => stat.includes(true));
          const onlineIndex: number[] = [];
          isOnlineArray.forEach((ioa) => {
            ioa.forEach((i, j) => {
              if (i == true) onlineIndex.push(j);
            });
          });
          setOnline(onlineIndex);
        });
  }, [currentMembers, membersWithoutMe]);

  useEffect(() => {
    if (currentMembers)
      socket.on("inroomm", (user) => {
        const index = membersWithoutMe.findIndex((m) => m.name === user);
        if (online) setOnline([...online!, index!]);
        else setOnline([index]);
      });
  }, [online, currentMembers, membersWithoutMe]);

  return (
    <div className="modal">
      {internalModal && <ChatComponent />}
      <div className="close">
        <button
          onClick={() => {
            setRoomModal({ display: false, type: "rc" });
          }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="members">
        <h2>Members</h2>
        <div>
          {membersWithoutMe &&
            membersWithoutMe.map((member, i) => (
              <button
                key={i}
                onClick={() => {
                  dispatch(setReceiver(member));
                  setInternalModal(true);
                }}
              >
                <span>{member.name}</span>
                <span
                  className={(() => {
                    return online?.includes(i) ? "online" : "offline";
                  })()}
                ></span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};
