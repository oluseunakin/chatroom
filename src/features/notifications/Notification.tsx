import { useDispatch } from "react-redux";
import { showModal } from "../modal";

export const Notification = (props: {
  roomNotification: {
    count: number;
    noti: string[];
  };
  setRoomModal?: React.Dispatch<
    React.SetStateAction<{
      display: boolean;
      type: string;
    }>
  >;
}) => {
  const { roomNotification, setRoomModal } = props;
  const dispatch = useDispatch();

  return (
    <div className="modal">
      <div className="close">
        <button
          onClick={() => {
            setRoomModal
              ? setRoomModal({ display: false, type: "close" })
              : dispatch(showModal({ display: false, type: "close" }));
          }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="">
        {roomNotification.noti.map((notification, i) => (
          <div key={i} className="joinnoti">
            <div>{notification}</div>
            <div>{new Date().toDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
