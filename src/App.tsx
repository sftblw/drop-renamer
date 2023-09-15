import "./App.css";
import { For, createSignal, onCleanup, createEffect } from "solid-js";
import RenamePatternInput from "./RenamePatternInput";

import { appWindow } from "@tauri-apps/api/window";
import { fs } from "@tauri-apps/api";

export let [files, setFiles] = createSignal([] as string[]);
export let [dropped, setDropped] = createSignal(false);
export const [regex, setRegex] = createSignal("");
export const [renamePattern, setRenamePattern] = createSignal("");

function App() {
  const renameFiles = () => {
    let target_files = files();
    target_files
      .filter(it => it.match(regex()))
      .forEach(it => fs.renameFile(it, it.replace(regex(), renamePattern())))
      ;
  }

  createEffect(async () => {
    let unlisten = await appWindow.onFileDropEvent(ev => {
      let payload = ev.payload;
      switch (payload.type) {
        case 'hover': { setFiles(payload.paths); } break;
        case 'drop': {
          setFiles(payload.paths);
          renameFiles()
          setFiles([]);
        } break;
        case 'cancel': { setFiles([]); } break;
      }
    });
    onCleanup(() => {
      unlisten();
    })
  });


  return (
    <div class="container">
      <RenamePatternInput onRegexChanged={setRegex} onRenamePatternChanged={setRenamePattern} />
      <span>{regex()} to {renamePattern()}</span>
      <For each={files()} fallback={<div>No items</div>}>
        {(file, index) => <div data-index={index()}>{file}</div>}
      </For>
    </div>
  );
}

export default App;
