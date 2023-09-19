import { JSX, Setter } from "solid-js";
import ValidatedInput from "./ValidatedInput";

interface RenamePattern {
    onRegexChanged: Setter<string>,
    onRenamePatternChanged: Setter<string>,
    [key: string]: any
}

function RenamePatternInput(props: RenamePattern): JSX.Element {
    const input_classes = "font-size-7";
    return (
        <div class={("flex flex-col " + (props.class ?? "")).trim()}  >
            <label for="regex_pattern">regex</label>
            <ValidatedInput id="regex_pattern" class={input_classes}
                onInput={(value) => props.onRegexChanged(value)}
                validator={(value) => { try { new RegExp(value) } catch { return false; } return true; }}
            />
            {/* <input   type="text" onInput={(ev) => props.onRegexChanged(ev.target.value)} /> */}

            <label for="rename_pattern">rename pattern</label>
            <input id="rename_pattern" class={input_classes} type="text" onInput={(ev) => props.onRenamePatternChanged(ev.target.value)} />
        </div>
    );
}

export default RenamePatternInput;
