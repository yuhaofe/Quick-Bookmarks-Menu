import { h, render, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import ContextWrapper from './components/ContextWrapper';
import PopupHeader from './components/PopupHeader';
import PopupContainer from './components/PopupContainer';
import PopupFooter from './components/PopupFooter';
import ContextMenu from './components/ContextMenu';
import './Popup.scss';

function Popup(props) {
    const [config, setConfig] = useState(props.config);
    const [page, setPage] = useState({
        type: 'folder',
        key: config.startup[0]
    });
    const [msgs, setMsgs] = useState([]);
    const [hidden, setHidden] = useState(config.hidden);

    applyTheme(config.theme);

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
        } else {
            newHidden = hidden.concat([key]);
        }
        chrome.storage.local.set({ hidden: newHidden }, () => {
            setHidden(newHidden);
        });
    };
    return (
        <ContextWrapper nav={navigate} config={[config, setConfig]} notify={notify} hide={setItemHide}>
            <>
                <PopupHeader page={page} msgs={msgs} clearMsg={clearMsg} horiz={config.scroll === 'x'} />
                <PopupContainer page={page} hidden={hidden} />
                <PopupFooter page={page} hidden={hidden} />
                <ContextMenu />
            </>
        </ContextWrapper>
    );
}

// load config and render popup
chrome.storage.local.get(['openIn', 'openInMiddle', 'hoverEnter', 'startup', 'root', 'theme', 'scroll', 'hidden', 'showHidden'], result => {
    adjustHeight(result.startup[1]);
    render(<Popup config={result} />, document.body);
});

function adjustHeight(length) {
    const rootStyle = document.documentElement.style;
    const height = (length + 2) * 30;
    rootStyle.setProperty('--startup-height', (height > 600) ? '600px' : height + 'px');
}

function applyTheme(theme) {
    const rootElm = document.documentElement;

    const applyDarkTheme = () => {
        rootElm.classList.add('theme-dark');
        rootElm.classList.remove('theme-light');
        chrome.browserAction.setIcon({
            path: {
                "16": "/icons/qbm16-dark.png",
                "32": "/icons/qbm32-dark.png"
            }
        });
    }

    const applyLightTheme = () => {
        rootElm.classList.add('theme-light');
        rootElm.classList.remove('theme-dark');
        chrome.browserAction.setIcon({
            path: {
                "16": "/icons/qbm16.png",
                "32": "/icons/qbm32.png"
            }
        });
    }

    switch (theme) {
        case 'light':
            applyLightTheme();
            break;
        case 'dark':
            applyDarkTheme();
            break;
        case 'auto':
        default:
            const mql = window.matchMedia('(prefers-color-scheme: dark)');
            const colorSchemeTest = e => {
                if (e.matches) {
                    applyDarkTheme();
                } else {
                    applyLightTheme();
                }
            };
            mql.onchange = colorSchemeTest;
            colorSchemeTest(mql);
            break;
    }
}