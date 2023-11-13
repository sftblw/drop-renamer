import { JSX } from "solid-js/jsx-runtime";
import RenamePatternInput from "./RenamePatternInput";
import { For, createSignal, onCleanup, createRenderEffect, createMemo, createEffect, Accessor, Setter, Show, untrack } from "solid-js";

import { appWindow } from "@tauri-apps/api/window";
import { UnlistenFn } from "@tauri-apps/api/event";

import './Renamer.scss';
import { PathItem } from "./path_item";
import { createSettingsSignal } from "../../settings/settings_signal";
import RenameTarget, { RenameResult } from "./rename_target";
import RenameTargetView from "./RenameTargetView";


let [filesRaw, setFilesRaw] = createSignal([] as string[]);
let [renameTargets, setRenameTargets] = createSignal([] as RenameTarget[]);

const [regex, setRegex] = createSignal("");
const [renamePattern, setRenamePattern] = createSignal("");


export default function Renamer(): JSX.Element {

    ////////
    // like- global

    const [renameWhenDropped, setRenameWhenDropped] = createSettingsSignal('renameConf.renameWhenDropped');
    const [includeExt, setIncludeExt] = createSettingsSignal('renameConf.includeExt');
    const [includeFullPath, setIncludeFullPath] = createSettingsSignal('renameConf.includeFullPath');

    const [errorMsg, setErrorMsg] = createSignal('');

    const [preventApplyRegexPattern, setPreventApplyRegexPattern] = createSignal(false);

    const options = createMemo(() => { return {
        renameWhenDropped: renameWhenDropped(),
        includeExt: includeExt(),
        includeFullPath: includeFullPath()
    }});

    function renameFiles(clearFiles: boolean = true): void {
        // snapshot clone.
        let filesVal = untrack(() => renameTargets());
        let optionsVal = untrack(() => options());
        
        (async () => {
            try {
                await Promise.allSettled(
                    filesVal
                        .filter(target => untrack(() => target.to() instanceof PathItem))
                        .map(async target => {
                            await target.renameActualFile(optionsVal);
                        })
                );

                if (clearFiles) {
                    untrack(() => {
                        let failed_elems = filesVal.filter(it => it.renameResult() != RenameResult.Success);
                        setPreventApplyRegexPattern(true);

                        setRenameTargets(failed_elems);

                        setPreventApplyRegexPattern(false);
                    });                    
                }
            } catch (ex) {
                setErrorMsg(`error on renaming: ${ex}`);
            }
        })();
    }

    function registerFileDropEvent() {
        let optionsVal = options();

        let unlisten: UnlistenFn | null = null;
        let unlisten_promise = appWindow.onFileDropEvent(async ev => {
            let payload = ev.payload;
            switch (payload.type) {
                case 'hover': {
                    setFilesRaw(payload.paths);
                } break;
                case 'drop': {
                    if (untrack(() => optionsVal.renameWhenDropped)) {
                        renameFiles(true);
                    }
                } break;
                case 'cancel': {
                    setFilesRaw([]);
                } break;
            }
        });
        unlisten_promise.then(it => { unlisten = it; });
        onCleanup(() => {
            if (unlisten != null) { unlisten(); }
        })
    };


    ////////
    // like- local

    createRenderEffect(() => registerFileDropEvent());

    const regExpObj = createMemo(() => {
        try {
            setErrorMsg('');
            return new RegExp(regex());
        } catch(ex) {
            setErrorMsg(`malformed regex: ${ex}`);
            return null;
        }
    });

    createEffect(() => {
        // reactivity
        let filesRawVal = filesRaw();

        // without reactivity
        (async () => {
            let files = await Promise.all(filesRawVal.map(async it => {
                let target = await RenameTarget.fromString(it);
                return target;
            }));
            
            setRenameTargets(files);
        })();
    });

    createEffect(() => {
        // reactivity
        let regExpObjVal = regExpObj();
        let filesVal = renameTargets();
        let renamePatternVal = renamePattern();
        let optionsVal = options();

        if (regExpObjVal == null) {
            return;
        }

        if (untrack(() => preventApplyRegexPattern())) {
            return;
        }

        // without reactivity
        (async () => {
            await Promise.all(filesVal.map(async target => {
                await target.applyRegexPattern(regExpObjVal as RegExp, renamePatternVal, optionsVal);
                return target;
            }));
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
            <Show when={errorMsg().length > 0}>
                <div class="info info-error">{errorMsg()}</div>
            </Show>

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
                       <li><button onclick={_ev => renameFiles(true)}><span class='icon i-pajamas-play'>▶</span><span>rename</span></button></li>
                    </Show>
                </ul>
            </div>

            <div class="mt-8">
                <For each={renameTargets()} fallback={<div class="file-item-none">No items.<br />Drop some files to rename.</div>}>
                    {(target, index) =>
                        <div data-index={index()} class="file-item">
                            <RenameTargetView renameTarget={target} />
                        </div>
                    }
                </For>
            </div>
        </>
    );
}