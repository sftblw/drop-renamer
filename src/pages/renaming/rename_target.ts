import { Accessor, Setter, createSignal, untrack } from "solid-js";
import { PathItem } from "./path_item";
import { fs } from "@tauri-apps/api";
import { RenameOptions, RenameTargetOptions } from "../../settings/rename_options";

export enum PathRegexError {
    NotYet,
    Error,
    Success
}

export enum RenameResult {
    NotYet,
    Error,
    Success,
}

type PathRegexResult = PathItem | PathRegexError;

export default class RenameTarget {
    from: PathItem = PathItem.empty();
    lastRegex: RegExp | null = null;

    public to: Accessor<PathRegexResult>;
    private setTo: Setter<PathRegexResult>;

    public renameResult: Accessor<RenameResult>;
    private setRenameResult: Setter<RenameResult>;

    public errorMsg: Accessor<string | null>;
    private setErrorMsg: Setter<string | null>;

    constructor() {
        [this.to, this.setTo] = createSignal<PathRegexResult>(PathRegexError.NotYet);
        [this.renameResult, this.setRenameResult] = createSignal<RenameResult>(RenameResult.NotYet);
        [this.errorMsg, this.setErrorMsg] = createSignal<string | null>(null);
    }

    static async fromString(from: string): Promise<RenameTarget> {
        let target = new RenameTarget();
        target.from = await PathItem.fromString(from);
        return target;
    }

    async applyRegexPattern(regex: RegExp, renamePattern: string, options: RenameOptions): Promise<PathRegexResult> {
        this.setErrorMsg(null);

        let targetString: string;
        if (options.includeFullPath) {
            targetString = await this.from.asFullPath();
        } else if (options.includeExt) {
            targetString = this.from.filename;
        } else {
            targetString = this.from.stem;
        }

        let to: PathRegexResult = this.from.clone();

        if (targetString.match(regex) == null) {
            to = PathRegexError.Error;
            this.setErrorMsg("regex does not match!");
        } else {
            if (options.includeFullPath) {
                to = await PathItem.fromString(targetString.replace(regex, renamePattern));
            } else if (options.includeExt) {
                to.filename = targetString.replace(regex, renamePattern);
            } else {
                to.stem = targetString.replace(regex, renamePattern);
            }

            to = await to.resolved();
        }

        this.setTo(to);

        return to;
    }

    async renameActualFile(options: RenameTargetOptions) {
        let to = untrack(() => this.to());
        this.setErrorMsg(null);

        if (!(to instanceof PathItem)) {
            this.setRenameResult(RenameResult.Error);
            this.setErrorMsg(`rename destination already exists!`);
            return;
        }

        let fromFull = await this.from.asFullPath();
        let toFull = await to.asFullPath();
        

        if (!await fs.exists(to.dir)) {
            await fs.createDir(to.dir, {recursive: true});
        }

        if (await fs.exists(toFull) && !options.ignoreNameOverlap) {
            this.setRenameResult(RenameResult.Error);
            this.setErrorMsg(`rename destination already exists!`);
            return;
        }

        try {
            await fs.renameFile(fromFull, toFull);
        } catch (ex) {
            this.setRenameResult(RenameResult.Error);
            this.setErrorMsg(`error on renaming: ${ex}`);
        }
    }
}