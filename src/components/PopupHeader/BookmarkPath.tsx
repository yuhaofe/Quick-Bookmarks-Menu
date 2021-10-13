import { h } from 'preact';
import { useContext } from 'preact/hooks';
import { NavContext, ConfigContext, NotifyContext } from '../ContextWrapper';
import './BookmarkPath.scss';

export interface BookmarkPathProps {
    id: string;
    title: string;
    last?: boolean;
}

export default function BookmarkPath(props: BookmarkPathProps) {
    const naviage = useContext(NavContext);
    const [config, setConfig] = useContext(ConfigContext);
    const notify = useContext(NotifyContext);

    const hoverEnterSpeed = {
        slow: 800,
        medium: 500,
        fast: 200
    };

    const openFolder = () => {
        naviage('folder', props.id);
    };

    let clickTimeout: number | null = null;
    const onMouseOver = () => {
        if (config.hoverEnter === 'off' || props.last) return;
        clickTimeout = setTimeout(() => openFolder(), hoverEnterSpeed[config.hoverEnter]);
    };

    const onMouseOut = () => {
        if (clickTimeout) {
            clearTimeout(clickTimeout);
        }
    };

    const onClick = () => {
        if (props.last) {
            chrome.bookmarks.getChildren(props.id, results => {
                chrome.storage.local.set({ startup: [props.id, results.length] });
                notify({ target: props.title, action: chrome.i18n.getMessage("set_startup_done") });
            });
        } else {
            openFolder();
        }
    };

    return (
        <button className="bookmark-path" role="link" tabIndex={0} onClick={onClick} onMouseOver={onMouseOver}
            onMouseOut={onMouseOut} title={props.last ? chrome.i18n.getMessage("set_startup") : ""}>
            <a className="bookmark-path-text">{props.title}</a>
        </button>
    );
}