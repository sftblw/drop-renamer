import { JSX } from "solid-js/jsx-runtime";
import RenamePatternInput from "./RenamePatternInput";
import { For, createSignal, onCleanup, createEffect, createResource, createRenderEffect } from "solid-js";

import { appWindow } from "@tauri-apps/api/window";
import { fs } from "@tauri-apps/api";
import { UnlistenFn } from "@tauri-apps/api/event";

export let [files, setFiles] = createSignal([] as string[]);
export let [dropped, setDropped] = createSignal(false);
export const [regex, setRegex] = createSignal("");
export const [renamePattern, setRenamePattern] = createSignal("");

function renameFiles(): void {
    let target_files = files();
    target_files
        .filter(it => it.match(regex()))
        .forEach(it => fs.renameFile(it, it.replace(regex(), renamePattern())))
        ;
}

function registerFileDropEvent() {
    let unlisten: UnlistenFn | null = null;
    let unlisten_promise = appWindow.onFileDropEvent(ev => {
        let payload = ev.payload;
        switch (payload.type) {
            case 'hover': { setFiles(payload.paths); } break;
            case 'drop': {
                setFiles(payload.paths);
                renameFiles();
                setFiles([]);
            } break;
            case 'cancel': { setFiles([]); } break;
        }
    });
    unlisten_promise.then(it => {unlisten = it;});
    onCleanup(() => {
        if (unlisten != null) { unlisten(); }
    })
}

export default function Renamer(): JSX.Element {
    createRenderEffect(registerFileDropEvent);

    return (
        <>
            <RenamePatternInput onRegexChanged={setRegex} onRenamePatternChanged={setRenamePattern} class="p-2" />
            <div class="p-2">
                <For each={files()} fallback={<div>No items</div>}>
                    {(file, index) => <div data-index={index()}>{file}</div>}
                </For>
            </div>
        </>
    );
}