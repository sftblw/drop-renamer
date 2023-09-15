import { Setter } from "solid-js";

interface RenamePattern {
    onRegexChanged: Setter<string>,
    onRenamePatternChanged: Setter<string>
}

function RenamePatternInput(props: RenamePattern) {
    return (
        <div>
            <input type="text" onInput={(ev) => props.onRegexChanged(ev.target.value)} />
            <input type="text" onInput={(ev) => props.onRenamePatternChanged(ev.target.value)} />
        </div>
    );
}

export default RenamePatternInput;
