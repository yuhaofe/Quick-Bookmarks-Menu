import { html } from 'htm/preact';
import { styled } from 'goober';
import { useState, useEffect, useContext, useRef } from 'preact/hooks';

import { NavContext, ConfigContext } from '../qbm.js';
import { QbmItem } from '../components/qbm-item.js';

//#region css
const Footer = styled('div')`
    display: flex;

    & > *:first-child {
        flex: auto;
    }
`;

const HiddenBtn = styled('button')`
    flex: none;

    display: ${props => props.active ? "inline" : "none"};
    height: 30px;
    width: 30px;
    border: none;
    border-left: 1px solid var(--line-color);
    background-color: var(--bg-color);
    background-image: var(--eye-icon);
    background-size: 18px 18px;
    background-position: center;
    background-repeat: no-repeat;

    &:hover {
        background-color: var(--hover-color);
    }

    &:focus {
        outline: none;
        background-color: var(--hover-color);
    }

    &:active {
        background-color: var(--active-color);
    }
`;
//#endregion

const manageProps = {
    id: '',
    type: 'manage',
    title: chrome.i18n.getMessage('manage'),
    url: 'chrome://bookmarks'
};

export function QbmFooter(props) {
    const [lastId, setLastId] = useState('0');
    const navigate = useContext(NavContext);
    const config = useContext(ConfigContext);

    const onHiddenClick = () => {
        if (props.page.type != 'hidden'){
            if(props.page.type === 'folder'){
                setLastId(props.page.key);
            }
            navigate('hidden', '');
        }else{
            navigate('folder', lastId);
        }
    };

    return html`
        <${Footer} >
            <${QbmItem} ...${manageProps} active=${!(props.hidden && props.hidden.includes('manage'))}/>
            <${HiddenBtn} active=${config.showHidden} onClick=${onHiddenClick} title="${chrome.i18n.getMessage("hidden_list")}"/>
        <//>
    `;
}  