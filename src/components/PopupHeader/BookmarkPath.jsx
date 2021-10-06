import { h } from 'preact';
import { useContext } from 'preact/hooks';
import { NavContext, ConfigContext, NotifyContext } from '../../Popup';
import './BookmarkPath.scss';

/**
 * 
 * @param {{
 *  id: string
 *  title: string
 * }} props 
 */
export default function BookmarkPath(props) {
    const naviage = useContext(NavContext);
    const config = useContext(ConfigContext);
    const notify = useContext(NotifyContext);

    const hoverEnterSpeed = {
        slow: 800,
        medium: 500,
        fast: 200
    };

    const openFolder = () => {
        naviage('folder', props.id);
    };

    const onMouseOver = () => {
        if (config.hoverEnter === 'off' || props.last) return;
        this._clickTimeout = setTimeout(() => openFolder(), hoverEnterSpeed[config.hoverEnter]);
    };

    const onMouseOut = () => {
        if (this._clickTimeout) {
            clearTimeout(this._clickTimeout);
        }
    };

    const onClick = () => {
        if (props.last) {
            chrome.bookmarks.getChildren(props.id, results => {
                chrome.storage.local.set({ startup: [props.id, results.length] });
                notify({target: props.title, action: chrome.i18n.getMessage("set_startup_done")});
            });
        }else{
            openFolder();
        }
    };

    return (
        <button className="bookmark-path" role="link" tabIndex="0" onClick={ onClick } onMouseOver={ onMouseOver }
            onMouseOut={ onMouseOut } title={ props.last ? chrome.i18n.getMessage("set_startup") : "" }>
            <a className="bookmark-path-text">{ props.title }</a>
        </button>
    );
}