import { JSX } from "solid-js/jsx-runtime";
import RenamePatternInput from "./RenamePatternInput";
import { For, createSignal, onCleanup, createRenderEffect, createMemo } from "solid-js";

import { appWindow } from "@tauri-apps/api/window";
import { fs } from "@tauri-apps/api";
import { UnlistenFn } from "@tauri-apps/api/event";

import './Renamer.scss';
import { createStore } from "solid-js/store";
import { PathItem } from "./path_item";


export let [files, setFiles] = createStore([] as PathItem[]);

export const [regex, setRegex] = createSignal("");
export const [renamePattern, setRenamePattern] = createSignal("");

const regExpObj = createMemo(() => new RegExp(regex()));

function renameFiles(): void {
    let target_files = files;
    target_files
        .filter(it => it.stem.match(regex()))
        .forEach(async fromItem => {
            let toItem = fromItem.clone();
            toItem.stem = toItem.stem.replace(regExpObj(), renamePattern());

            let fromFull = await fromItem.asFullPath();
            let toFull = await toItem.asFullPath();

            fs.renameFile(fromFull, toFull);
        })
        ;
}

function registerFileDropEvent() {
    let unlisten: UnlistenFn | null = null;
    let unlisten_promise = appWindow.onFileDropEvent(async ev => {
        let payload = ev.payload;
        switch (payload.type) {
            case 'hover': {
                let files = await Promise.all(payload.paths.map(async it => await PathItem.fromString(it)));
                setFiles(files);
            } break;
            case 'drop': {
                renameFiles();
                setFiles([]);
            } break;
            case 'cancel': { setFiles([]); } break;
        }
    });
    unlisten_promise.then(it => { unlisten = it; });
    onCleanup(() => {
        if (unlisten != null) { unlisten(); }
    })
}

export default function Renamer(): JSX.Element {
    createRenderEffect(registerFileDropEvent);

    return (
        <>
            <RenamePatternInput onRegexChanged={setRegex} onRenamePatternChanged={setRenamePattern} />

            {/* <div class="rename-options">
                <label for="rename-instantly"><input type="checkbox" checked id="rename-instantly"/> rename instantly</label>
            </div> */}
            
            <div class="mt-8">
                <For each={files} fallback={<div class="file-item-none">No items.<br/>Drop some files to rename.</div>}>
                    {(file, index) =>
                        <div data-index={index()} class="file-item">
                            <ul>
                                <li class="dir"><span class='i-pajamas-folder-open'>folder</span><span>{file.dir}</span></li>
                                <li class="rename">
                                    <span class='from'>{file.filename}</span>
                                    <span class='arrow i-pajamas-arrow-right'>→</span>
                                    <span class='to'>{file.withStem(file.stem.replace(regExpObj(), renamePattern())).filename}</span>
                                </li>
                            </ul>
                        </div>
                    }
                </For>
            </div>
        </>
    );
}