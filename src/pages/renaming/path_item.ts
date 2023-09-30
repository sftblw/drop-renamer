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

    get filename(): string {
        return this.ext !== '' ? `${this.stem}.${this.ext}` : this.stem;
    }

    static async fromString(full_path: string): Promise<PathItem> {
        let dir = await path.dirname(full_path);
    
        let filename = await path.basename(full_path);
        let dot_pos = filename.lastIndexOf('.');
        let ext = (dot_pos === -1) ? '' : filename.slice(dot_pos + 1);
        let stem = (dot_pos === -1) ? filename : filename.slice(0, dot_pos);
        
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
}