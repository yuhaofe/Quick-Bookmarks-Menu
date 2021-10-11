import { h } from 'preact';
import { useState, useContext } from 'preact/hooks';
import { NavContext, ConfigContext } from '../ContextWrapper';
import './BookmarkItem.scss';

/**
 * 
 * @param {{id: string,
 *  type: string,
 *  title: string,
 *  url: string | undefined}} props 
 */
export default function BookmarkItem(props) {
    const navigate = useContext(NavContext);
    const [config, setConfig] = useContext(ConfigContext);

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

    return (
        <div className={`bookmark-item${!props.active ? ' bookmark-item-hide' : ''} ${props.active || config.showHidden ? 'show-flex' : 'hide'}`}
            data-id={props.id}>
            <button className="bookmark-item-button" role="link" tabIndex="0" title={props.type === 'link' ? props.title + "\n" + props.url : ""}
                type={props.type} onClick={onClick} onMouseOver={onMouseOver} onMouseOut={onMouseOut} onWheel={onMouseOut}>
                <img className={`bookmark-item-icon bookmark-item-icon-${props.type}`} src={props.type === 'link' ? "chrome://favicon/" + props.url
                    : "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="} />
                <span className="bookmark-item-text">
                    {props.title}
                </span>
            </button>
        </div>
    );
}