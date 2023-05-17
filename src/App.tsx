import { useSelector } from "react-redux";
import "./App.css";
import { Welcome } from "./components/Welcome";
import CreateUser from "./features/user/CreateUser";
import { getUser } from "./features/user/userStore";
import { type RootState } from "./store";
import { User } from "./type";

function App() {
  const founduser = useSelector<RootState, User>((state) => getUser(state));
  return founduser.id !== -1 ? <Welcome /> : <CreateUser />
}

export default App;
