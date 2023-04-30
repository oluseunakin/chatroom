import { useRef } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { useCreateUserMutation } from "../api/apiSlice";
import { setUser } from "./userStore";
import { Spinner } from "../../components/Spinner";

export default function CreateUser() {
  const nameRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [createUser, { isLoading }] = useCreateUserMutation();

  return isLoading ? (
    <Spinner />
  ) : (
    <div className="creatediv">
      <label htmlFor="user">Enter your name then press Enter</label>
      <input
        ref={nameRef}
        id="user"
        placeholder="Wole Si Gbagede"
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            const name = nameRef.current!.value;
            createUser({ name }).unwrap();
            dispatch(setUser(name));
          }
        }}
      />
    </div>
  );
}
