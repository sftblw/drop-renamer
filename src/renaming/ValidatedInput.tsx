import { JSX, Setter, createEffect, createSignal, mergeProps, splitProps } from "solid-js";

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
        invalidClass: "bg-red-100",
    }
    let mergedProps = mergeProps(defaultProps, props);
    let [internalProps, externalProps] = splitProps(mergedProps, ["value", "output", "validator", "validClass", "invalidClass"]);

    let [value, setValue] = createSignal(mergedProps.value);

    const isValidProp = () => internalProps.validator(value());
    const classList = () => {
        const native_class_list = isValidProp() ? internalProps.validClass : internalProps.invalidClass;
        return [native_class_list, externalProps.class ?? ""].join(" ").trim();
    }

    return (
        <input
            onInput={ev => setValue(ev.target.value)}
            class={classList()}
        />
    );
}
