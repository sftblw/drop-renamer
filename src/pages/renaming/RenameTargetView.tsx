import { JSX, Show, createEffect, createMemo, } from "solid-js";
import RenameTarget, { PathRegexError, RenameResult } from "./rename_target";
import { PathItem } from "./path_item";

import './RenameTargetView.scss';

interface RenameTargetViewProps {
    renameTarget: RenameTarget
}

export default function RenameTargetView(props: RenameTargetViewProps): JSX.Element {
    let renameTarget = props.renameTarget;
    let errorMsg = props.renameTarget.errorMsg;
    
    return (
        <div class="rename-target-view">
            <Show when={errorMsg() != null}>
                <div class="info info-error">{errorMsg()}</div>
            </Show>
            <div class="dir">
                <div class="dir-item from"><span class='i-pajamas-folder-open'>folder</span><span>{renameTarget.from.dir}</span></div>
                <Show when={renameTarget.to() instanceof PathItem && renameTarget.from.dir != (renameTarget.to() as PathItem).dir}>
                    <div class="dir-item to"><span class='icon arrow i-pajamas-arrow-right'>→</span><span class='i-pajamas-folder-open'>folder</span><span>{(renameTarget.to() as PathItem).dir}</span></div>
                </Show>
            </div>
            
            <div class="rename">
                <div class='from'>{renameTarget.from.filename}</div>
                <div class='icon arrow i-pajamas-arrow-right'>→</div>
                
                <div class="to">
                    <Show when={renameTarget.to() instanceof PathItem}
                    fallback={
                        
                            <span class='span-error'>{PathRegexError[(renameTarget.to() as PathRegexError)]}</span>
                        
                    }
                >
                        {(renameTarget.to() as PathItem).filename}
                    </Show>          
                </div>      
            </div>
        </div>
    )
}