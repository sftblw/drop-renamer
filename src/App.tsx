
import "./App.scss";
import { A, Route, Router, Routes, useLocation } from "@solidjs/router";
import Renamer from "./renaming/Renamer";
import { JSX, lazy } from "solid-js";

function RoutedApp(): JSX.Element {
  const location = useLocation();
  return (
    <div class="app-container">
      <nav class="app-nav">
        <h1>drop-renamer</h1>
        <A href={location.pathname !== "/settings" ? "/settings" : "/"} class="nav-button">
          <span class="i-pajamas-settings inline-block"></span>
          <span>settings</span>
        </A>
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
