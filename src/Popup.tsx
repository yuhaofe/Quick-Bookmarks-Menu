import { h, render } from 'preact';
import { useState } from 'preact/hooks';
import ContextWrapper, { Configuration, Message, Page } from './components/ContextWrapper';
import PopupHeader from './components/PopupHeader';
import PopupContainer from './components/PopupContainer';
import PopupFooter from './components/PopupFooter';
import ContextMenu from './components/ContextMenu';
import { applyTheme } from './utils/theme';
import './Popup.scss';


interface PopupProps {
    config: Configuration
}

function Popup(props: PopupProps) {
    const [config, setConfig] = useState(props.config);
    const [page, setPage] = useState<Page>({ type: 'folder', key: config.startup[0] });
    const [msgs, setMsgs] = useState<Message[]>([]);
    const [hidden, setHidden] = useState(config.hidden);

    const navigate = (type: Page["type"], key: Page["key"]) => {
        setPage({ type, key });
    };

    const notify = (msg: Message) => {
        setMsgs([...msgs, msg]);
    };

    const clearMsg = () => {
        setMsgs([]);
    };

    const setItemHide = (key: string) => {
        let newHidden: string[];
        if (hidden.includes(key)) {
            newHidden = hidden.filter(e => e != key);
        } else {
            newHidden = hidden.concat([key]);
        }
        chrome.storage.local.set({ hidden: newHidden }).then(() => {
            setHidden(newHidden);
        });
    };

    return (
        <ContextWrapper nav={navigate} config={[config, setConfig]} notify={notify} hide={setItemHide}>
            <PopupHeader page={page} msgs={msgs} clearMsg={clearMsg} horiz={config.scroll === 'x'} />
            <PopupContainer page={page} hidden={hidden} />
            <PopupFooter page={page} hidden={hidden} />
            <ContextMenu />
        </ContextWrapper>
    );
}

// load config and render popup
chrome.storage.local.get(['openIn', 'openInMiddle', 'doNotClose', 'hoverEnter', 'startup', 'root', 'theme', 'scroll', 'hidden', 'showHidden']).then((result: Partial<Configuration>) => {
    adjustHeight((result as Configuration).startup[1]);
    applyTheme((result as Configuration).theme);
    render(<Popup config={result as Configuration} />, document.body);
});

function adjustHeight(length: number) {
    const rootStyle = document.documentElement.style;
    const height = (length + 2) * 30;
    rootStyle.setProperty('--startup-height', (height > 600) ? '600px' : height + 'px');
}