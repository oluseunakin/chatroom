import type { Conversation } from "../../type";

export const RoomNotification = (props: {
  convoNotifications: Conversation[];
  joinNotifications: string[];
  showNoti: React.Dispatch<
    React.SetStateAction<{
      room: boolean;
      chat: boolean;
    }>
  >;
}) => {
  const { convoNotifications, showNoti, joinNotifications } = props;

  return (
    <div className="notifications">
      <div className="close">
        <button onClick={() => showNoti((noti) => ({ ...noti, room: false }))}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="noti">
        {joinNotifications.map((notification, i) => (
          <div key={i} className="joinnoti">
            <div>{notification}</div>
            <div>{new Date().toDateString()}</div>
          </div>
        ))}
      </div>
      <div className="noti">
        {convoNotifications.map((notification, i) => (
          <div key={i} className="joinnoti">
            <div>
              {notification.talkerName} posted in {notification.roomName}
            </div>
            <div>{new Date().toDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
