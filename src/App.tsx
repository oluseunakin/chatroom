import { useSelector } from "react-redux";
import "./App.css";
import { Welcome } from "./components/Welcome";
import CreateUser from "./features/user/CreateUser";
import { getUser } from "./features/user/userStore";
import { type RootState } from "./store";

function App() {
  const founduser = useSelector<RootState, String>((state) => getUser(state));
  return founduser.length > 0 ? <Welcome /> : <CreateUser />
}

export default App;
