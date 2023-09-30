import { debounce } from "@solid-primitives/scheduled";
import { createSignal, createMemo, Accessor, Setter } from "solid-js";
import { Path, PathValue } from "tauri-settings/dist/types/dot-notation";
import settingsManager, { DropRenamerSettingsSchema } from "./settings_manager";

export function createSettingsSignal<
    TKey extends Path<DropRenamerSettingsSchema>
>(
    key: TKey,
    debounce_ms: number = 250,
    initialValue: PathValue<DropRenamerSettingsSchema, TKey>
): [
    Accessor<PathValue<DropRenamerSettingsSchema, TKey>>,
    Setter<PathValue<DropRenamerSettingsSchema, TKey>>
] {
    type TValue = PathValue<DropRenamerSettingsSchema, TKey>;

    // // regex
    const [value, setValue]: [Accessor<TValue>, Setter<TValue>] = createSignal(initialValue);

    settingsManager.get(key).then((settings_value: TValue) => {
        if (settings_value != null) { setValue((_prev_settings_value) => settings_value); }
    });

    if (debounce_ms > 0) {
        const debounceValue = debounce((debounced_value: TValue) => {
            settingsManager.set(key, debounced_value);
            settingsManager.syncCache();
        }, 250);
        createMemo(() => { debounceValue(value()); });
    }    

    return [value, setValue];
}