import { createSignal, Setter } from "solid-js";

interface RenamePattern {
    setRegex: Setter<string>,
    setRenamePattern: Setter<string>
}

function RenamePatternInput(props: RenamePattern) {
    return (
        <div>
            <input type="text" onInput={(ev) => props.setRegex(ev.target.value)} />
            <input type="text" onInput={(ev) => props.setRenamePattern(ev.target.value)} />
        </div>
    );
}

export default RenamePatternInput;
