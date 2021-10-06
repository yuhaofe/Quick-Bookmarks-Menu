import { h, render, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import ContextWrapper from './components/ContextWrapper';
import PopupHeader from './components/PopupHeader';
import PopupContainer from './components/PopupContainer';
import PopupFooter from './components/PopupFooter';
import './Popup.scss';

function Popup(props) {
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
        } else {
            newHidden = hidden.concat([key]);
        }
        chrome.storage.local.set({ hidden: newHidden }, () => {
            setHidden(newHidden);
        });
    };
    return (
        <ContextWrapper nav={navigate} config={props.config} notify={notify} hide={setItemHide}>
            <>
                <PopupHeader page={page} msgs={msgs} clearMsg={clearMsg} horiz={props.config.scroll === 'x'} />
                <PopupContainer page={page} hidden={hidden} />
                <PopupFooter page={page} hidden={hidden} />
            </>
        </ContextWrapper>
    );
}

// disable context menu
window.oncontextmenu = function () {
    return false;
};

// {openIn, hoverEnter, startup, root, theme, scroll}
chrome.storage.local.get(['openIn', 'hoverEnter', 'startup', 'root', 'theme', 'scroll', 'hidden', 'showHidden'], result => {
    applyTheme(result.theme);
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
    }

    const applyLightTheme = () => {
        rootElm.classList.add('theme-light');
        rootElm.classList.remove('theme-dark');
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
                    chrome.runtime.sendMessage({ theme: "dark" });
                } else {
                    applyLightTheme();
                    chrome.runtime.sendMessage({ theme: "light" });
                }
            };
            mql.onchange = colorSchemeTest;
            colorSchemeTest(mql);
            break;
    }
}