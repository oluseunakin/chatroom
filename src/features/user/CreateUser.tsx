import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { useCreateUserMutation } from "../api/apiSlice";
import { setUser } from "./userStore";
import { Spinner } from "../../components/Spinner";
import { socket } from "../socket";

export default function CreateUser() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("")
  const dispatch = useDispatch<AppDispatch>();
  const [createUser, { isLoading }] = useCreateUserMutation();

  return isLoading ? (
    <Spinner />
  ) : (
    <div className="creatediv">
      <label htmlFor="user">Wole si Gbagede</label>
      <input
        onChange={e => {setName(e.target.value)}}
        id="user"
        placeholder="Your Name"
      />
      <input type="password"  onChange={e => {setPassword(e.target.value)}} placeholder="Password"/>
      <button onClick={async () => {
        const user = await createUser({ name, password}).unwrap();
        dispatch(setUser(user));
        socket.connect()
      }} >Wole</button>
    </div>
  );
}
