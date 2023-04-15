import { useRef } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { useCreateUserMutation } from "../api/apiSlice";
import { setUser } from "./userStore";

export default function CreateUser() {
  const nameRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [createUser, { isLoading }] = useCreateUserMutation();

  return (
    <div className="creatediv">
      <label htmlFor="user">Enter your name then press Enter</label>
      <input
        ref={nameRef}
        id="user"
        placeholder="Enter the Room"
        onKeyUp={async (e) => {
          if (e.key === "Enter") {
            const name = nameRef.current!.value;
            const newuser = await createUser({ name }).unwrap();
            dispatch(setUser(newuser.name));
          }
        }}
      />
    </div>
  );
}
