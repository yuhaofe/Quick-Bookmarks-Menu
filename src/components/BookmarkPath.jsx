import { h } from 'preact';
import { styled } from 'goober';
import { useContext } from 'preact/hooks';

import { NavContext, ConfigContext, NotifyContext } from '../Popup';

//#region css
const PathItem = styled('button')`
    flex: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-width: 0;
    border: none;
    cursor: pointer;
    box-sizing: border-box;
    height: 30px;
    line-height: 30px;
    padding: 0px;

    &:not(:first-child) {
        margin-left: -9px;
    }

    &:hover * {
        background-color: var(--hover-color);
    }

    &:focus, &:focus * {
        outline: none;
        background-color: var(--hover-color);
    }

    &:active * {
        background-color: var(--active-color);
    }

    &:first-child::before {
        content: "";
        height: 30px;
        width: 26px;
        background-color: var(--bg-color);
        background-image: var(--folder-icon);
        background-size: 16px 16px;
        background-position: 10px center;
        background-repeat: no-repeat;
    }

    &:first-child:hover::before, &:first-child:focus::before {
        outline: none;
        background-color: var(--hover-color);
    }

    &:first-child:active::before {
        background-color: var(--active-color);
    }

    &:not(:first-child)::before {
        content: "";
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 15px 0 15px 10px;
        border-color: var(--bg-color) transparent var(--bg-color) transparent;
    }

    &:not(:first-child):hover::before, &:not(:first-child):focus::before {
        outline: none;
        border-color: var(--hover-color) transparent var(--hover-color) transparent;
    }

    &:not(:first-child):active::before {
        border-color: var(--active-color) transparent var(--active-color) transparent;
    }

    &:not(:last-child)::after {
        content: "";
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 15px 0 15px 10px;
        border-color: transparent transparent transparent var(--bg-color);
        z-index: 2;
    }

    &:not(:last-child):hover::after, &:not(:last-child):focus::after {
        outline: none;
        border-color: transparent transparent transparent var(--hover-color);
    }

    &:not(:last-child):active::after {
        border-color: transparent transparent transparent var(--active-color);
    }
`;
const Text = styled('a')`
    color: var(--text-color);
    background-color: var(--bg-color);
    text-decoration: none;
    flex: auto;
    padding-left: 5px;
    overflow: hidden; 
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: left !important;

    button:last-child & {
        font-weight: bold;
    }
`;
//#endregion

/**
 * 
 * @param {{
 *  id: string
 *  title: string
 * }} props 
 */
export function BookmarkPath(props) {
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
        <PathItem role="link" tabIndex="0" onClick={onClick} onMouseOver={onMouseOver}
            onMouseOut={onMouseOut} title={props.last ? chrome.i18n.getMessage("set_startup"):""}>
            <Text >{props.title}</Text>
        </PathItem>
    );
}