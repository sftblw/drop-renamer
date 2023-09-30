import { JSX, Setter, createEffect } from "solid-js";
import ValidatedInput from "../../components/ValidatedInput";
import { createSettingsSignal } from "../../settings/settings_signal";
import './RenamePatternInput.scss';

interface RenamePattern {
    onRegexChanged: Setter<string>,
    onRenamePatternChanged: Setter<string>,
    [key: string]: any
}


function RenamePatternInput(props: RenamePattern): JSX.Element {
    // // regex
    const [regex, setRegex] = createSettingsSignal('input.lastRegex', 250, '');
    createEffect(() => props.onRegexChanged(regex()));

    const [pattern, setPattern] = createSettingsSignal('input.lastRenamePattern', 250, '');
    createEffect(() => props.onRenamePatternChanged(pattern()));

    const input_classes = "font-size-7";

    return (
        <ul class={("flex flex-col rename-pattern-input " + (props.class ?? "")).trim()}  >
            <li>
                <label for="regex_pattern">regex</label>
                <ValidatedInput id="regex_pattern" class={input_classes}
                    value={regex()}
                    onInput={ (value) => setRegex(value) }
                    validator={(value) => { try { new RegExp(value) } catch { return false; } return true; }}
                />
            </li>
            
            <li>
                <label for="rename_pattern" class=" mt-2">rename pattern</label>
                <ValidatedInput id="rename_pattern" class={input_classes}
                    value={pattern()}
                    onInput={ (value) => setPattern(value) }
                    validator={(value) => { return true }}
                />
            </li>
        </ul>
    );
}

export default RenamePatternInput;
