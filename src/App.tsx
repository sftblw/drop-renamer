
import "./App.scss";
import { Route, Router, Routes } from "@solidjs/router";
import Renamer from "./pages/renaming/Renamer";
import { JSX, lazy } from "solid-js";
import { NavButtonLink } from "./components/NavButtonLink";

function RoutedApp(): JSX.Element {
  return (
    <div class="app-container">
      <nav class="app-nav">
        <h1>drop-renamer</h1>
        <NavButtonLink target_path="/help" icon_class="i-pajamas-question">howto</NavButtonLink>
        <NavButtonLink target_path="/settings" icon_class="i-pajamas-settings">settings</NavButtonLink>
      </nav>
      <div>
        <Routes>
          <Route path="/" component={Renamer} />
          <Route path="/help" component={lazy(() => import("./pages/help/HelpPage"))} />
          <Route path="/settings" component={lazy(() => import("./pages/settings/SettingsPage"))} />
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
