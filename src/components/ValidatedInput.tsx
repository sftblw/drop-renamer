import { JSX, createEffect, createMemo, createSignal, mergeProps, splitProps } from "solid-js";

interface PatternProps {
    value?: string,
    onInput: (value: string) => void,
    validator?: (value: string) => boolean,
    validClass?: string,
    invalidClass?: string,
}

interface OptionalPatternProps extends PatternProps {
    [key: string]: any,
}

export default function ValidatedInput(props: OptionalPatternProps): JSX.Element {
    const defaultProps = {
        value: "",
        validator: () => true,
        validClass: "",
        invalidClass: "bg-red-100"
    };
    
    let mergedProps = mergeProps(defaultProps, props);
    let [internalProps, externalProps] = splitProps(mergedProps, ["value", "onInput", "output", "validator", "validClass", "invalidClass"]);

    let [value, setValue] = createSignal('');

    // initial property set, property reaction
    createMemo(() => setValue(internalProps.value));

    // validation
    const isValidProp = createMemo(() => internalProps.validator(value()));

    // return signal
    createEffect(() => internalProps.onInput(value()));
    
    const classList = () => {
        const native_class_list = isValidProp() ? internalProps.validClass : internalProps.invalidClass;
        return [native_class_list, externalProps.class ?? ""].join(" ").trim();
    }

    return (
        <input
            id={props.id}
            value={value()}
            onInput={ev => setValue(ev.target.value)}
            class={classList()}
        />
    );
}
