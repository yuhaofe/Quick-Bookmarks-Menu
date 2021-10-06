import { h } from 'preact';
import { useState, useContext } from 'preact/hooks';
import { NavContext, ConfigContext, HideContext, NotifyContext } from '../../Popup';
import './BookmarkItem.scss';

/**
 * 
 * @param {{id: string,
 *  type: string,
 *  title: string,
 *  url: string | undefined}} props 
 */
export default function BookmarkItem(props) {
    const [menuActive, setMenuActive] = useState(false);
    const navigate = useContext(NavContext);
    const notify = useContext(NotifyContext);
    const config = useContext(ConfigContext);
    const setItemHide = useContext(HideContext);
    const hoverEnterSpeed = {
        slow: 750,
        medium: 450,
        fast: 200
    };

    const openFolder = () => navigate('folder', props.id);
    const openUrl = () => {
        const openIn = config.openIn;
        let active = false;
        switch (openIn) {
            case 'new':
                active = true;
            case 'background':
                chrome.tabs.create({ url: props.url, active });
                window.close();
                break;
            case 'current':
            default:
                chrome.tabs.update({ url: props.url });
                window.close();
                break;
        }
    };

    const onClick = () => {
        switch (props.type) {
            case "folder":
                openFolder();
                break;
            case "link":
            case "manage":
            default:
                openUrl();
                break;
        }
    };

    const onMouseOver = () => {
        if (config.hoverEnter === 'off' || props.type != 'folder') return;
        this._clickTimeout = setTimeout(() => openFolder(), hoverEnterSpeed[config.hoverEnter]);
    };

    const onMouseOut = () => {
        if (this._clickTimeout) {
            clearTimeout(this._clickTimeout);
        }
    };

    const onContextMenu = () => {
        if (this._clickTimeout) {
            clearTimeout(this._clickTimeout);
        }
        setMenuActive(!menuActive);
    };

    const onHiddenClick = () => {
        setItemHide(props.type != 'manage' ? props.id : 'manage');
        notify({
            target: props.title,
            action: props.active ?
                chrome.i18n.getMessage("set_hidden") :
                chrome.i18n.getMessage("set_hidden_off")
        });
    };

    return (
        <div className={`bookmark-item${!props.active ? ' bookmark-item-hide' : ''} ${props.active || config.showHidden ? 'show-flex' : 'hide'}`} onMouseLeave={() => setMenuActive(false)}>
            <button className="bookmark-item-button" role="link" tabIndex="0" title={props.type === 'link' ? props.title + "\n" + props.url : ""}
                type={props.type} onClick={onClick} onMouseOver={onMouseOver} onMouseOut={onMouseOut} onWheel={onMouseOut}
                onContextMenu={onContextMenu}>
                <img className={`bookmark-item-icon bookmark-item-icon-${props.type}`} src={props.type === 'link' ? "chrome://favicon/" + props.url
                    : "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="} />
                <span className="bookmark-item-text">
                    {props.title}
                </span>
            </button>
            <div className={`bookmark-item-menu ${menuActive ? 'show-flex' : 'hide'}`}>
                <button className={`bookmark-item-hide-button${!props.active ? 'bookmark-item-hide-button-slash' : ''}`} onClick={onHiddenClick} />
            </div>
        </div>
    );
}