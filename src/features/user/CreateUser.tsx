import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { useCreateUserMutation } from "../api/apiSlice";
import { setUser } from "./userStore";
import { Spinner } from "../../components/Spinner";
import "../../styles/create.css";

export default function CreateUser() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const [createUser, { isLoading }] = useCreateUserMutation();

  return isLoading ? (
    <Spinner />
  ) : (
    <>
      <header>
        <h1>Ekaabo si Gbagede</h1>
      </header>
      <main className="creatediv">
        <div>
          <p>Create and join rooms</p>
          <p>Share opinions with room members</p>
          <p>Chat with room members</p>
        </div>
        <div>
          <label htmlFor="user">Wole si Gbagede</label>
          <input
            onChange={(e) => {
              setName(e.target.value);
            }}
            id="user"
            placeholder="Your Name"
          />
          <input
            type="password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            placeholder="Password"
          />
          <button
            onClick={async () => {
              const user = await createUser({ name, password }).unwrap();
              localStorage.setItem("user", JSON.stringify(user))
              dispatch(setUser(user));
            }}
          >
            Wole
          </button>
        </div>
      </main>
    </>
  );
}
