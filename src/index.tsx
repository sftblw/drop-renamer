/* @refresh reload */
import { render } from "solid-js/web";

import "virtual:uno.css"
import '@unocss/reset/sanitize/sanitize.css'
import '@unocss/reset/sanitize/assets.css'

import "./styles.scss";
import App from "./App";

render(() => <App />, document.getElementById("root") as HTMLElement);
