import { h } from 'preact';
import { useContext } from 'preact/hooks';
import { NavContext, ConfigContext } from '../ContextWrapper';
import { faviconURL } from '../../utils/url';
import './BookmarkItem.scss';

export interface BookmarkItemProps {
    id: string;
    type: string;
    title: string;
    url: string | undefined;
    active: boolean;
};

export default function BookmarkItem(props: BookmarkItemProps) {
    const navigate = useContext(NavContext);
    const [config] = useContext(ConfigContext);

    const hoverEnterSpeed = {
        slow: 750,
        medium: 450,
        fast: 200
    };

    const openFolder = () => navigate('folder', props.id);
    const openUrl = (button: 'left' | 'middle') => {
        let openIn = 'new';
        switch (button) {
            case 'middle':
                openIn = config.openInMiddle;
                break;
            case 'left':
                openIn = config.openIn;
                break;
            default:
                break;
        }

        let active = false;
        switch (openIn) {
            case 'new':
                active = true;
            case 'background':
                chrome.tabs.create({ url: props.url, active });
                if (config.doNotClose != 'background' && config.doNotClose != 'both') {
                    window.close();
                }
                break;
            case 'current':
            default:
                chrome.tabs.update({ url: props.url });
                if (config.doNotClose != 'current' && config.doNotClose != 'both') {
                    window.close();
                }
                break;
        }
    };

    const handleClick = () => {
        switch (props.type) {
            case "folder":
                openFolder();
                break;
            case "link":
            case "manage":
            default:
                openUrl('left');
                break;
        }
    };

    let clickTimeout: number | null = null;
    const handleMouseOver = () => {
        if (config.hoverEnter === 'off' || props.type != 'folder') return;
        clickTimeout = setTimeout(() => openFolder(), hoverEnterSpeed[config.hoverEnter]);
    };

    const handleMouseOut = () => {
        if (clickTimeout) {
            clearTimeout(clickTimeout);
        }
    };

    const handleMouseUp = (e: MouseEvent) => {
        if (e.button != 1) {    // check if it is middle button
            return;
        }
        e.preventDefault();
        openUrl('middle');
    };

    const handleMouseDown = (e: MouseEvent) => {
        if (e.button === 1) {
            e.preventDefault();
        }
    };

    return (
        <div className={`bookmark-item${!props.active ? ' bookmark-item-hide' : ''} ${props.active || config.showHidden ? 'show-flex' : 'hide'}`}
            data-id={props.id}>
            <button className="bookmark-item-button" role="link" tabIndex={0} title={props.type === 'link' ? props.title + "\n" + props.url : ""}
                onClick={handleClick} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} onWheel={handleMouseOut}
                onMouseUp={handleMouseUp} onMouseDown={handleMouseDown}>
                <img className={`bookmark-item-icon bookmark-item-icon-${props.type}`} src={props.type === 'link' && props.url ? faviconURL(props.url)
                    : "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="} />
                <span className="bookmark-item-text">
                    {props.title}
                </span>
            </button>
        </div>
    );
}