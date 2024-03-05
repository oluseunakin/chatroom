import { useEffect, useState } from "react";
import { RoomExcerpt } from "../features/room/Room";
import { Room } from "../type";
import {
  useLazyGetAllRoomsQuery,
  useLazyGetMyRoomsQuery,
  useLazyGetJoinedRoomsQuery,
} from "../features/api/apiSlice";
import { Spinner } from "./Spinner";
import { useDispatch } from "react-redux";
import { setJoinedRooms, setMyRooms } from "../features/room/roomStore";

export const RoomList = (props: { type: string }) => {
  const { type } = props;
  const [pageno, setPageNo] = useState(0);
  const [list, setList] = useState<Room[]>();
  const [getAllRooms] = useLazyGetAllRoomsQuery();
  const [getMyRooms] = useLazyGetMyRoomsQuery();
  const [getJoinedRooms] = useLazyGetJoinedRoomsQuery();
  const dispatch = useDispatch();

  function bodyScroll() {
    window.requestAnimationFrame(() => {
      const loadPosition = Math.floor(0.9 * document.body.scrollHeight);
      const scrollHeight = window.scrollY + window.innerHeight;
      if (scrollHeight >= loadPosition) {
        setPageNo((pageno) => pageno++);
      }
    });
  }

  useEffect(() => {
    window.addEventListener("scroll", bodyScroll);
  }, []);

  useEffect(() => {
    async function getRooms() {
      const joinedRooms = await getJoinedRooms(pageno.toString()).unwrap();
      const myRooms = await getMyRooms(pageno.toString()).unwrap();
      dispatch(setMyRooms(myRooms));
      dispatch(setJoinedRooms(joinedRooms));
      if (type === "joinedrooms") {
        joinedRooms && setList(joinedRooms);
      } else if (type === "allrooms") {
        const allRooms = await getAllRooms(pageno).unwrap();
        allRooms && setList(allRooms);
      } else {
        myRooms && setList(myRooms);
      }
    }
    getRooms();
  }, [pageno, type]);

  return (
    <div>
      {list ? (
        list.length > 0 ? (
          list.map((room, i) => <RoomExcerpt room={room} key={i} />)
        ) : (
          <h3>Nothing to see here</h3>
        )
      ) : (
        <Spinner />
      )}
    </div>
  );
};
