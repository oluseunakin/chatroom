import { useState } from "react";
import {
  useCreateRoomMutation,
  useGetTopicsQuery,
} from "../features/api/apiSlice";
import { Spinner } from "./Spinner";
import { enterRoom } from "../features/roomname";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { getUser } from "../features/user/userStore";
import { Room, RoomType, User } from "../type";
import { showModal } from "../features/modal";

export const CreateRoom = (props: {}) => {
  const [createRoom, { isLoading: roomLoading }] = useCreateRoomMutation();
  const dispatch = useDispatch();
  const user = useSelector<RootState, User>((state) => getUser(state));
  const [newTopic, setNewTopic] = useState(false);
  const [room, setRoom] = useState<Room>({
    name: "",
    creatorId: user.id!,
    topic: {
      name: "",
    },
    type: RoomType.OPEN,
  });
  const { isLoading: topicsLoading, data: topics } = useGetTopicsQuery(null);

  if (roomLoading) return <Spinner />;

  return (
    <div className="modal">
      <div className="close">
        <button
          onClick={() => {
            dispatch(showModal({ display: false, type: "cr" }));
          }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="cfdiv">
        <h2>You are about to create a Room</h2>
        <div>
          <label htmlFor="name">What would you like to name this Room</label>
          <input
            placeholder="Name"
            id="name"
            onChange={(e) => {
              setRoom({ ...room!, name: e.target.value });
            }}
          />
          {topicsLoading ? (
            <Spinner />
          ) : (
            <div>
              <label>Choose topic</label>
              <select
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "nt") setNewTopic(true);
                  else
                    setRoom({ ...room, topic: { name: value } });
                }}
              >
                <option>-------------------</option>
                {topics &&
                  topics.map((topic, i) => (
                    <option key={topic.id}>{topic.name}</option>
                  ))}
                <option value="nt">Add your Topic</option>
              </select>
            </div>
          )}
          {newTopic && (
            <div>
              <label>
                Enter Topic{" "}
                <input
                  onChange={(e) => {
                    setRoom({
                      ...room,
                      topic: { ...room.topic, name: e.target.value },
                    });
                  }}
                />
              </label>
            </div>
          )}
          <div>
            <p>
              An Open Room can be <em>Searched</em>{" "}
            </p>
            <div className="roomtypediv">
              <button
                onClick={(e) => {
                  setRoom({ ...room, type: RoomType.OPEN });
                  e.currentTarget.classList.add("clicked")
                }}
              >
                Open
              </button>
              <button
                onClick={(e) => {
                  setRoom({ ...room, type: RoomType.CLOSED });
                  e.currentTarget.classList.add("clicked")
                }}
              >
                Closed
              </button>
            </div>
          </div>
        </div>
        <div>
          <button
            onClick={async () => {
              const createdRoom = await createRoom(room).unwrap();
              dispatch(enterRoom(createdRoom.id));
              dispatch(showModal({ type: "rc", display: true }));
            }}
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};
