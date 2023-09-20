import { JSX, Setter, createEffect, createMemo, createSignal } from "solid-js";
import ValidatedInput from "./ValidatedInput";
import settingsManager from "../settings_manager";
import { debounce } from "@solid-primitives/scheduled";

interface RenamePattern {
    onRegexChanged: Setter<string>,
    onRenamePatternChanged: Setter<string>,
    [key: string]: any
}

function RenamePatternInput(props: RenamePattern): JSX.Element {
    // // regex
    const [regex, setRegex] = createSignal('');

    createEffect(() => props.onRegexChanged(regex()));

    settingsManager.get('input.lastRegex').then((value) => {
        console.log("afff" + value)
        if (value != null) { setRegex(value); }
    });

    var i = 0;
    const regexSaveDebounce = debounce((regex_value: string) => {
        console.log(regex_value + (i++));
        settingsManager.set('input.lastRegex', regex_value);
        settingsManager.syncCache();
        
    }, 250);
    createMemo(() => {
        console.log("regex changed: " + regex());
        regexSaveDebounce(regex());
    });

    const input_classes = "font-size-7";

    return (
        <div class={("flex flex-col " + (props.class ?? "")).trim()}  >
            <label for="regex_pattern">regex</label>
            <ValidatedInput id="regex_pattern" class={input_classes}
                value={regex()}
                onInput={ (value) => setRegex(value) }
                validator={(value) => { try { new RegExp(value) } catch { return false; } return true; }}
            />
            {/* <input   type="text" onInput={(ev) => props.onRegexChanged(ev.target.value)} /> */}

            <label for="rename_pattern">rename pattern</label>
            <input id="rename_pattern" class={input_classes} type="text" onInput={(ev) => props.onRenamePatternChanged(ev.target.value)} />
        </div>
    );
}

export default RenamePatternInput;
