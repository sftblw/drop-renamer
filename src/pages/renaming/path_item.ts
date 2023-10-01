import { path } from "@tauri-apps/api";

export class PathItem {
    /** path part without filename. */
    dir: string;
    /** filename part without extension. */ 
    stem: string;
    /** extension without dot. */ 
    ext: string;

    constructor(dir: string, stem: string, ext: string) {
        this.dir = dir;
        this.stem = stem;
        this.ext = ext;
    }

    clone(): PathItem {
        return new PathItem(this.dir, this.stem, this.ext);
    }

    withStem(stem: string): PathItem {
        let clone = this.clone();
        clone.stem = stem;
        return clone;
    }

    private static splitFilename(filename: string): [string, string] {
        let dot_pos = filename.lastIndexOf('.');
        let ext = (dot_pos === -1) ? '' : filename.slice(dot_pos + 1);
        let stem = (dot_pos === -1) ? filename : filename.slice(0, dot_pos);
        return [stem, ext];
    }

    get filename(): string {
        return this.ext !== '' ? `${this.stem}.${this.ext}` : this.stem;
    }
    set filename(value: string) {
        let [stem, ext] = PathItem.splitFilename(value);
        this.stem = stem;
        this.ext = ext;
    }

    static async fromString(fullPath: string): Promise<PathItem> {
        let dir = await path.dirname(fullPath);
    
        let filename = await path.basename(fullPath);
        let [stem, ext] = PathItem.splitFilename(filename);
        
        return new PathItem(dir, stem, ext);
    }

    async asFullPath(): Promise<string> {
        let joined = await path.join(
            this.dir,
            this.filename
        );
        let resolved = await path.resolve(joined);
        return resolved;
    }

    async resolved(): Promise<PathItem> {
        let fullPath = await this.asFullPath();
        let resolved = await path.resolve(fullPath);
        let newPathItem = await PathItem.fromString(resolved);
        return newPathItem;
    }
}