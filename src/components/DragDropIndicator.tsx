import { JSX, createEffect, createMemo, createSignal, mergeProps, splitProps } from "solid-js";
import './DragDropIndicator.scss';

interface DragDropIndicatorProps {
    hover: boolean,
    [key: string]: any,
}


export default function DragDropIndicator(props: DragDropIndicatorProps): JSX.Element {
    return (
        <div class={'drag-drop-indicator ' + (props.class ?? "") + (props.hover ? "hover" : "")}
        />
    );
}