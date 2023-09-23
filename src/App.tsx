
import "./App.scss";
import { Route, Router, Routes } from "@solidjs/router";
import Renamer from "./renaming/Renamer";
import { JSX, lazy } from "solid-js";
import { NavButtonLink } from "./NavButtonLink";

function RoutedApp(): JSX.Element {
  return (
    <div class="app-container">
      <nav class="app-nav">
        <h1>drop-renamer</h1>
        <NavButtonLink target_path="/settings" />
      </nav>
      <div>
        <Routes>
          <Route path="/" component={Renamer} />
          <Route path="/settings" component={lazy(() => import("./Settings"))} />
        </Routes>
      </div>
    </div>
  );
}

function App(): JSX.Element {
  return (
    <Router>
      <RoutedApp />
    </Router>
  );
}

export default App;
