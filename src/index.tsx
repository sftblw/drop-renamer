/* @refresh reload */
import { render } from "solid-js/web";

import "virtual:uno.css"
import "./styles.css";
import App from "./App";

render(() => <App />, document.getElementById("root") as HTMLElement);
