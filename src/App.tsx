
import "./App.css";
import { A, Route, Router, Routes } from "@solidjs/router";
import Renamer from "./renaming/Renamer";
import { JSX, lazy } from "solid-js";


function App(): JSX.Element {
  return (
    <Router>
    <div class="container p-2">
      <nav>
        <A href="/">rename</A>
        <A href="/config">config</A>
      </nav>
      <div>
      <Routes>
        <Route path="/" component={Renamer}/>
        <Route path="/config" component={lazy(() => import("./Settings"))} />
      </Routes>
      </div>
    </div>
    </Router>
  );
}

export default App;
