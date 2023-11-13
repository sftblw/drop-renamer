export interface RenameOptions extends RenameActionOptions, RenameTargetOptions {
    
}

export interface RenameActionOptions {
    renameWhenDropped: boolean;
}

export interface RenameTargetOptions {
    includeExt: boolean;
    includeFullPath: boolean;
    ignoreNameOverlap?: boolean;
}