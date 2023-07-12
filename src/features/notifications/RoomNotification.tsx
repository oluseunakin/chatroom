import type { Conversation } from "../../type";

export const RoomNotification = (props: {
  roomNotification: {
    count: number;
    noti: string[];
    show: boolean;
  };
  setRoomNotification: React.Dispatch<React.SetStateAction<{
    count: number;
    noti: string[];
    show: boolean;
}>>
}) => {
  const { roomNotification, setRoomNotification } = props;

  return (
    <div className="modal">
      <div className="close">
        <button
          onClick={() => {
            setRoomNotification({...roomNotification, show: false})
          }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="noti">
        {roomNotification.noti.map((notification, i) => (
          <div key={i} className="joinnoti">
            <div>
              {notification}
            </div>
            <div>{new Date().toDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
