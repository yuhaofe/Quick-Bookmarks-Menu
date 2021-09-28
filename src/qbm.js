import { h, render, Fragment, createContext } from 'preact';
import { html } from 'htm/preact';
import { setPragma } from 'goober';
import { useState, useEffect } from 'preact/hooks';

import { QbmHeader } from './components/qbm-header.js';
import { QbmContainer } from './components/qbm-container.js';
import { QbmFooter } from './components/qbm-footer.js';

setPragma(h);

const NavContext = createContext('navigate');
const ConfigContext = createContext('config');
const NotifyContext = createContext('notify');
const HideContext = createContext('hide');

function QBM(props) {
    const [page, setPage] = useState({
        type: 'folder',
        key: props.config.startup[0]
    });
    const [msgs, setMsgs] = useState([]);
    const [hidden, setHidden] = useState(props.config.hidden);

    const navigate = (type, key) => {
        setPage({ type, key });
    };
    const notify = (msg) => {
        setMsgs([...msgs, msg]);
    };
    const clearMsg = () => {
        setMsgs([]);
    };
    const setItemHide = (key) => {
        let newHidden;
        if (hidden.includes(key)) {
            newHidden = hidden.filter(e => e != key);
        }else{
            newHidden = hidden.concat([key]);
        }
        chrome.storage.local.set({ hidden: newHidden }, ()=>{
            setHidden(newHidden);
        });
    };
    return html`
        <${NavContext.Provider} value=${ navigate }>
            <${ConfigContext.Provider} value=${ props.config }>
                <${NotifyContext.Provider} value=${ notify }>
                    <${HideContext.Provider} value=${ setItemHide }>
                        <${Fragment}>
                            <${QbmHeader} page=${page} msgs=${msgs} clearMsg=${clearMsg} horiz=${props.config.scroll === 'x'}/>
                            <${QbmContainer} page=${page} hidden=${hidden}/>
                            <${QbmFooter} page=${page} hidden=${hidden}/>
                        <//>
                    <//>
                <//>
            <//>
        <//>
    `;
}

// disable context menu
window.oncontextmenu = function () {
    return false;
};

// {openIn, hoverEnter, startup, root, theme, scroll}
chrome.storage.local.get(['openIn', 'hoverEnter', 'startup', 'root', 'theme', 'scroll', 'hidden', 'showHidden'], result => {    
    applyTheme(result.theme);
    adjustHeight(result.startup[1]);
    render(html`<${QBM} config=${result}/>`, document.body);
});

function adjustHeight(length) {
    const rootStyle = document.documentElement.style;
    const height = (length + 2) * 30;
    rootStyle.setProperty('--startup-height',  (height > 600) ? '600px' : height + 'px');
}

function applyTheme(theme) {
    const rootStyle = document.documentElement.style;
    switch (theme) {
        case 'light':
            applyLightTheme(rootStyle);
            break;
        case 'dark':
            applyDarkTheme(rootStyle);
            break;
        case 'auto':
        default:
            const mql = window.matchMedia('(prefers-color-scheme: dark)');
            const colorSchemeTest = e => {
                if (e.matches) {
                    applyDarkTheme(rootStyle);
                    chrome.runtime.sendMessage({theme: "dark"});
                } else {
                    applyLightTheme(rootStyle);
                    chrome.runtime.sendMessage({theme: "light"});
                }
            };
            mql.onchange = colorSchemeTest;
            colorSchemeTest(mql);
            break;
    }
}

function applyDarkTheme(style) {
    style.setProperty('--text-color', '#eeeeee');
    style.setProperty('--bg-color', '#3a3a3a');
    style.setProperty('--hover-color', '#545454');
    style.setProperty('--active-color', '#6d6d6d');
    style.setProperty('--line-color', '#878787');
    style.setProperty('--msg-color', '#006375');
    style.setProperty('--folder-icon', 'url("../icons/folder-dark.webp")');
    style.setProperty('--search-icon', 'url("../icons/search-dark.webp")');
    style.setProperty('--manage-icon', 'url("../icons/manage-dark.webp")');
    style.setProperty('--eye-icon', 'url("../icons/eye-dark.webp")');
    style.setProperty('--eye-slash-icon', 'url("../icons/eye-slash-dark.webp")');
    style.setProperty('--icon-filter', 'contrast(0.8)');
}

function applyLightTheme(style) {
    style.setProperty('--text-color', '#000000');
    style.setProperty('--bg-color', '#ffffff');
    style.setProperty('--hover-color', '#efefef');
    style.setProperty('--active-color', '#e5e5e5');
    style.setProperty('--line-color', '#dbdbdb');
    style.setProperty('--msg-color', '#daf0ff');
    style.setProperty('--folder-icon', 'url("../icons/folder.webp")');
    style.setProperty('--search-icon', 'url("../icons/search.webp")');
    style.setProperty('--manage-icon', 'url("../icons/manage.webp")');
    style.setProperty('--eye-icon', 'url("../icons/eye.webp")');
    style.setProperty('--eye-slash-icon', 'url("../icons/eye-slash.webp")');
    style.setProperty('--icon-filter', 'contrast(1)');
}

export { NavContext, ConfigContext, NotifyContext, HideContext };