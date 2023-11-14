import { JSX, createResource, lazy } from "solid-js";

import { getName, getTauriVersion, getVersion } from '@tauri-apps/api/app';
import './AppInfo.scss';

interface AppInfoProps {
    [key: string]: any
}

export default function AppInfo(props: AppInfoProps): JSX.Element {
    const [appName] = createResource(getName);
    const [tauriVersion] = createResource(getTauriVersion);
    const [appVersion] = createResource(getVersion);
    return (
        <div class={("content bordered_content app_info " + (props.class ?? "")).trim()}>
            <h1>{appName()}</h1>
            <ul class="info_list">
                <li>app <span class="version">v{appVersion()}</span></li>
                <li>tauri <span class="version">v{tauriVersion()}</span></li>
                <li><a href="https://github.com/sftblw/drop-renamer" target="_blank">Source Code (Github)</a></li>
            </ul>
        </div>
    );
}