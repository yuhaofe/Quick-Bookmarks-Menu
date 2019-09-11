import { html } from '/web_modules/htm/preact.js';
import { styled, css } from '/web_modules/goober.js';
import { useState, useContext } from '/web_modules/preact/hooks.js';
import { NavContext, ConfigContext } from '/src/qbm.js';

//#region css
const icons = {
    "link": "none",
    "folder": "var(--folder-icon)",
    "manage": "var(--manage-icon)"
}

const Icon = styled('img')`
    flex: 0 0 auto;
    height: 16px;
    width: 16px;
    filter: var(--icon-filter);

    background-color: inherit;
    background-image: ${ props => icons[props.type] };
    background-size: 16px 16px;
    background-position: center;
    background-repeat: no-repeat;
`;

const Text = styled('span')`
    flex: 1 1 auto;
    color: var(--text-color);
    width: 100%;
    margin-left: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left !important;
`;

const Item = styled('button')`
    border: none;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    cursor: pointer;
    height: 30px;
    line-height: 30px;
    padding-left: 10px;
    background-color: inherit;

    &:hover {
        border: none;
        background-color: var(--hover-color);
    }

    &:focus {
        border: none;
        outline: none;
        background-color: var(--hover-color);
    } 

    &:active {
        border: none;
        background-color: var(--active-color);
    }
`;
//#endregion

/**
 * 
 * @param {{id: string,
 *  type: string,
 *  title: string,
 *  url: string | undefined}} props 
 */
export function QbmItem(props) {
    const navigate = useContext(NavContext);
    const config = useContext(ConfigContext);
    const hoverEnterSpeed = {
        slow: 800,
        medium: 500,
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

    return html`
        <${Item} role="link" tabIndex="0" title=${props.type==='link' ? props.title + "\n" + props.url : ""}
            type=${props.type} onClick=${onClick} onMouseOver=${onMouseOver} onMouseOut=${onMouseOut} onWheel=${onMouseOut}>
            <${Icon} src=${props.type==='link'? "chrome://favicon/" + props.url 
                : "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="} type=${props.type}><//>
            <${Text}>${props.title}<//>
        <//>
    `;
}