import { debounce } from "@solid-primitives/scheduled";
import { createSignal, createMemo, Accessor, Setter } from "solid-js";
import { Path, PathValue } from "tauri-settings/dist/types/dot-notation";
import settingsManager, { DropRenamerSettingsSchema, settingsDefault } from "./settings_manager";
import { getDotNotation } from "./dot_notation";

export function createSettingsSignal<
    TKey extends Path<DropRenamerSettingsSchema>
>(
    key: TKey,
    debounce_ms: number = 250
): [
    Accessor<PathValue<DropRenamerSettingsSchema, TKey>>,
    Setter<PathValue<DropRenamerSettingsSchema, TKey>>
] {
    type TValue = PathValue<DropRenamerSettingsSchema, TKey>;

    let initialDefaultValue = getDotNotation<DropRenamerSettingsSchema>(settingsDefault, key) as TValue;
    // // regex
    const [value, setValue]: [Accessor<TValue>, Setter<TValue>] = createSignal(initialDefaultValue);

    settingsManager.get(key).then((settings_value: TValue) => {
        if (settings_value != null) { setValue((_prev_settings_value) => settings_value); }
    });

    if (debounce_ms > 0) {
        const debounceValue = debounce(async (debounced_value: TValue) => {
            await settingsManager.set(key, debounced_value);
            settingsManager.syncCache();
        }, 250);
        createMemo(() => { debounceValue(value()); });
    }

    return [value, setValue];
}