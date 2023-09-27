import { path } from "@tauri-apps/api";

export interface PathItem {
    /** path part without filename. */
    dir: string;
    /** filename part without extension. */ 
    stem: string;
    /** extension without dot. */ 
    ext: string;
}

export async function pathItemFromString(full_path: string): Promise<PathItem> {
    let dir = await path.dirname(full_path);
    
    let filename = await path.basename(full_path);
    let dot_pos = filename.lastIndexOf('.');
    let ext = (dot_pos === -1) ? '' : filename.slice(dot_pos + 1);
    let stem = (dot_pos === -1) ? filename : filename.slice(0, dot_pos);
    
    return {dir, stem, ext};
}

export function joinStemAndExt(stem: string, ext: string): string {
    return ext !== '' ? `${stem}.${ext}` : stem;
}

export async function asFullPath(pathItem: PathItem): Promise<string> {
    let joined = await path.join(
        pathItem.dir,
        joinStemAndExt(pathItem.stem, pathItem.ext)
    );
    let resolved = await path.resolve(joined);
    return resolved;
}
