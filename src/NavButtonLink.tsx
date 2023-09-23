import { useLocation, A } from "@solidjs/router";
import './NavButtonLink.scss';

interface NavLinkProps {
    target_path: string;
}

export function NavButtonLink(props: NavLinkProps) {
    const location = useLocation();
    const is_current_path = () => location.pathname === props.target_path;
    const href = () => !is_current_path() ? props.target_path : "/";

    return (
        <A href={href()} class={("nav-button " + (is_current_path() ? "nav-button-current" : "")).trim()}>
            <span class="i-pajamas-settings inline-block"></span>
            <span>settings</span>
        </A>
    );
}
