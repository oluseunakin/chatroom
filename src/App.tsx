import { useDispatch, useSelector } from "react-redux";
import "./styles/App.css";
import { Welcome } from "./components/Welcome";
import CreateUser from "./features/user/CreateUser";
import { getUser, setUser } from "./features/user/userStore";
import { type RootState } from "./store";
import { User } from "./type";
import { useEffect, useState } from "react";
import { Spinner } from "./components/Spinner";

function App() {
  const dispatch = useDispatch();
  const ls = localStorage.getItem("user");
  useEffect(() => {
    if (ls) {
      dispatch(setUser(JSON.parse(ls)));
    }
  }, []);
  const user = useSelector<RootState, User>((state) => getUser(state));
  if (ls) {
    if (user.id != -1) return <Welcome />;
    return <Spinner />;
  }
  return <CreateUser />;
}

export default App;
