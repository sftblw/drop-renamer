import { JSX } from "solid-js/jsx-runtime";
import RenamePatternInput from "./RenamePatternInput";
import { For, createSignal, onCleanup, createRenderEffect, createMemo } from "solid-js";

import { appWindow } from "@tauri-apps/api/window";
import { fs } from "@tauri-apps/api";
import { UnlistenFn } from "@tauri-apps/api/event";

import './Renamer.scss';
import { createStore } from "solid-js/store";
import { PathItem, asFullPath, joinStemAndExt, pathItemFromString } from "./path_item";


export let [files, setFiles] = createStore([] as PathItem[]);

export let [dropped, setDropped] = createSignal(false);
export const [regex, setRegex] = createSignal("");
export const [renamePattern, setRenamePattern] = createSignal("");

const regExpObj = () => new RegExp(regex());

function renameFiles(): void {
    let target_files = files;
    target_files
        .filter(it => it.stem.match(regex()))
        .forEach(async fromItem => {
            let toItem = Object.assign({}, fromItem);

            toItem.stem = toItem.stem.replace(regExpObj(), renamePattern());

            let fromFull = await asFullPath(fromItem);
            let toFull = await asFullPath(toItem);

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
                let files = await Promise.all(payload.paths.map(async it => await pathItemFromString(it)));
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
            <div class="mt-8">
                <For each={files} fallback={<div>No items</div>}>
                    {(file, index) =>
                        <div data-index={index()} class="file-item">
                            <ul>
                                <li class="dir"><span class='i-pajamas-folder-open'>folder</span><span>{file.dir}</span></li>
                                <li class="rename">
                                    <span class='from'>{joinStemAndExt(file.stem, file.ext)}</span>
                                    <span class='arrow i-pajamas-arrow-right'>→</span>
                                    <span class='to'>{joinStemAndExt(file.stem.replace(regExpObj(), renamePattern()), file.ext)}</span>
                                </li>
                            </ul>
                        </div>
                    }
                </For>
            </div>
        </>
    );
}