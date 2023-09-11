import { createSignal } from "solid-js";
import "./App.css";
import RenamePatternInput from "./RenamePatternInput";

function App() {
  const [regex, setRegex] = createSignal("");
  const [renamePattern, setRenamePattern] = createSignal("");

  return (
    <div class="container">
      <RenamePatternInput setRegex={setRegex} setRenamePattern={setRenamePattern} />
      <span>{regex()}</span>
    </div>
  );
}

export default App;
