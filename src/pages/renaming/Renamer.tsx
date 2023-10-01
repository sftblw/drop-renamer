import { JSX } from "solid-js/jsx-runtime";
import RenamePatternInput from "./RenamePatternInput";
import { For, createSignal, onCleanup, createRenderEffect, createMemo, createEffect, Accessor, Setter, Show, untrack } from "solid-js";

import { appWindow } from "@tauri-apps/api/window";
import { fs } from "@tauri-apps/api";
import { UnlistenFn } from "@tauri-apps/api/event";

import './Renamer.scss';
import { createStore } from "solid-js/store";
import { PathItem } from "./path_item";
import { createSettingsSignal } from "../../settings/settings_signal";


interface FileFromTo {
    from: PathItem;
    to: PathItem | null;
}

let [filesRaw, setFilesRaw] = createSignal([] as string[]);
let [files, setFiles] = createStore([] as FileFromTo[]);

const [regex, setRegex] = createSignal("");
const [renamePattern, setRenamePattern] = createSignal("");


function renameFiles(clearFiles: boolean = true): void {
    // snapshot clone.
    let target_files = [...files];

    target_files
        .filter(it => it.to != null)
        .forEach(async it => {
            let from = it.from;
            let to = it.to!;

            let fromFull = await from.asFullPath();
            let toFull = await to.asFullPath();

            if (!await fs.exists(to.dir)) {
                await fs.createDir(to.dir, {recursive: true});
            }

            fs.renameFile(fromFull, toFull);
        })
        ;

    if (clearFiles) {
        setFilesRaw([]);
        setFiles([]);
    }
}

/**
 * update files store, without reactivity.
 */
async function updateFiles(
    fileFromTo: FileFromTo[],
    regExpObj: RegExp,
    renamePattern: string,
    options: {includeFullPath: boolean, includeExt: boolean}
) {
    let filesNew = await Promise.all(fileFromTo.map(async it => {
        let fromItem = it.from;

        let targetString: string;
        if (options.includeFullPath) {
            targetString = await fromItem.asFullPath();
        } else if (options.includeExt) {
            targetString = fromItem.filename;
        } else {
            targetString = fromItem.stem;
        }

        let toItem: PathItem | null = fromItem.clone();
        if (targetString.match(regExpObj) == null) {
            toItem = null;
        } else {
            if (options.includeFullPath) {
                toItem = await PathItem.fromString(targetString.replace(regExpObj, renamePattern));
            } else if (options.includeExt) {
                toItem.filename = targetString.replace(regExpObj, renamePattern);
            } else {
                toItem.stem = targetString.replace(regExpObj, renamePattern);
            }

            toItem = await toItem.resolved();
        }

        return {from: fromItem, to: toItem};
    }));

    setFiles(filesNew);
}



function registerFileDropEvent(options: {renameWhenDropped: Accessor<boolean>}) {
    let unlisten: UnlistenFn | null = null;
    let unlisten_promise = appWindow.onFileDropEvent(async ev => {
        let payload = ev.payload;
        switch (payload.type) {
            case 'hover': {
                setFilesRaw(payload.paths);
            } break;
            case 'drop': {
                if (untrack(() => options.renameWhenDropped())) {
                    renameFiles(true);
                }
            } break;
            case 'cancel': {
                setFilesRaw([]);
                setFiles([]);
            } break;
        }
    });
    unlisten_promise.then(it => { unlisten = it; });
    onCleanup(() => {
        if (unlisten != null) { unlisten(); }
    })
}

export default function Renamer(): JSX.Element {
    const [renameWhenDropped, setRenameWhenDropped] = createSettingsSignal('renameConf.renameWhenDropped');
    const [includeExt, setIncludeExt] = createSettingsSignal('renameConf.includeExt');
    const [includeFullPath, setIncludeFullPath] = createSettingsSignal('renameConf.includeFullPath');

    createRenderEffect(() => registerFileDropEvent({renameWhenDropped: renameWhenDropped}));

    const regExpObj = createMemo(() => new RegExp(regex()));

    createEffect(() => {
        // reactivity
        let regExpObjVal = regExpObj();
        let filesRawVal = filesRaw();
        let renamePatternVal = renamePattern();
        let options = {
            includeExt: includeExt(),
            includeFullPath: includeFullPath()
        };

        // without reactivity
        (async () => {
            let fromItemList = await Promise.all(filesRawVal.map(async it => await PathItem.fromString(it)));
            let newFiles = fromItemList.map(from => ({from: from, to: null}));
    
            updateFiles(newFiles, regExpObjVal, renamePatternVal, options);
        })();

    });

    const OptionsCheckbox = (
        props: {
            compId: string, accessor: Accessor<boolean>, setter: Setter<boolean>, children?: JSX.Element
    }) => {
        return (
            <label for={props.compId} class="check-option"><input
                type="checkbox"
                id={props.compId}
                checked={props.accessor()}
                onchange={ev => props.setter(ev.target.checked)}
            /><span class='label-content'>{props.children}</span></label>
        );
    };

    return (
        <>
            <RenamePatternInput onRegexChanged={setRegex} onRenamePatternChanged={setRenamePattern} />

            <div class="rename-options">
                <ul class="common-options">
                    <li><OptionsCheckbox compId="include-full-path" accessor={includeFullPath} setter={setIncludeFullPath}>include full path</OptionsCheckbox></li>
                    <Show when={!includeFullPath()}>
                        <li><OptionsCheckbox compId="include-ext" accessor={includeExt} setter={setIncludeExt}>include extension</OptionsCheckbox></li>
                    </Show>
                </ul>
                <ul class="rename-action">
                    <li><OptionsCheckbox compId="rename-when-dropped" accessor={renameWhenDropped} setter={setRenameWhenDropped}>rename when dropped</OptionsCheckbox></li>
                    <Show when={!renameWhenDropped()}>
                       <li><button onclick={_ev => renameFiles()}><span class='icon i-pajamas-play'>▶</span><span>rename</span></button></li>
                    </Show>
                </ul>
            </div>

            <div class="mt-8">
                <For each={files} fallback={<div class="file-item-none">No items.<br />Drop some files to rename.</div>}>
                    {(pair, index) =>
                        <div data-index={index()} class="file-item">
                            <ul>
                                <li class="dir from"><span class='i-pajamas-folder-open'>folder</span><span>{pair.from.dir}</span></li>
                                <Show when={pair.to != null && pair.from.dir != pair.to.dir}>
                                    <li class="dir to"><span class='icon arrow i-pajamas-arrow-right'>→</span><span class='i-pajamas-folder-open'>folder</span><span>{pair.to?.dir}</span></li>
                                </Show>
                                <li class="rename">
                                    <span class='from'>{pair.from.filename}</span>
                                    <span class='icon arrow i-pajamas-arrow-right'>→</span>
                                    <span class='to'>{pair.to?.filename}</span>
                                </li>
                            </ul>
                        </div>
                    }
                </For>
            </div>
        </>
    );
}