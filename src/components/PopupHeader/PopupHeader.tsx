import { h } from 'preact';
import { useState, useEffect, useContext, useRef } from 'preact/hooks';
import { NavContext, ConfigContext, Page, Message } from '../ContextWrapper';
import BookmarkPath, { BookmarkPathProps } from './BookmarkPath';
import './PopupHeader.scss';

interface PopupMessageProps {
    msg: Message;
    onClose: Function;
}

function PopupMessage(props: PopupMessageProps) {
    let closeTimer = setTimeout(() => {
        clearTimeout(closeTimer);
        props.onClose();
    }, 1000);

    return (
        <div className="msg-banner">
            {props.msg.target &&
                <span className="msg-target">{props.msg.target}</span>
            }<span>{props.msg.action}</span>
        </div>
    );
}

interface PopupHeaderProps {
    page: Page;
    horiz: boolean;
    msgs: any[];
    clearMsg: Function;
}

export default function PopupHeader(props: PopupHeaderProps) {
    const [paths, setPaths] = useState<BookmarkPathProps[]>([]);
    const [empty, setEmpty] = useState(true);
    const [lastId, setLastId] = useState('0');
    const searchInput = useRef<HTMLInputElement>(null);
    const navigate = useContext(NavContext);
    const [config, setConfig] = useContext(ConfigContext);
    if (isNaN(config.root as any)) {
        config.root = '0';
    }

    const insertItem = async (id: string, newPaths: BookmarkPathProps[]) => {
        const path: BookmarkPathProps = {
            id: id,
            title: ''
        };

        const results = await chrome.bookmarks.get(id);
        path.title = results[0].title;
        if (id === '0') path.title = chrome.i18n.getMessage("home");
        newPaths.unshift(path);//insert before first
        if (id === config.root || !results[0].parentId) {
            newPaths[newPaths.length - 1].last = true;
            setPaths(newPaths);
            if (empty) setEmpty(false);
            return;
        }
        insertItem(results[0].parentId, newPaths);
    };

    const toggleSearch = () => {
        if (props.page.type === 'folder') {
            setLastId(props.page.key);
        }
        navigate('search', '');
        document.removeEventListener('keydown', toggleSearch);
    };

    useEffect(() => {
        const currentId = paths.length > 0 ? paths[paths.length - 1].id : '-1';
        if (props.page.type === 'folder') {
            if (props.page.key != currentId) {
                const newPaths: BookmarkPathProps[] = [];
                insertItem(props.page.key, newPaths);
            }

        }
        if (props.page.type === 'search') {
            if (searchInput.current) {
                searchInput.current.focus();
            }

        }
    }, [props.page]);

    useEffect(() => {
        if (props.page.type === 'folder') {
            document.addEventListener('keydown', toggleSearch);
        }
    });

    let inputTimeout: number | null = null;
    const onInput = (e: Event) => {
        if (inputTimeout) {
            clearTimeout(inputTimeout);
        }
        inputTimeout = setTimeout(() => {
            if (e.target instanceof HTMLInputElement) {
                const keyword = e.target.value;
                if (keyword && keyword.length > 1) {
                    navigate('search', keyword);
                }
            }
        }, 400);
    };

    const switchView = () => {
        if (props.page.type != 'search') {
            toggleSearch();
        } else {
            navigate('folder', lastId);
        }
    };

    return (
        <div className={`popup-header popup-header-${props.horiz ? 'horiz' : 'vert'}`}>
            <div className={`popup-header-path${empty ? ' popup-header-path-empty' : ''} ${props.page.type === 'folder' ? 'show-flex' : 'hide'}`}>
                {paths.map(path =>
                    <BookmarkPath {...path} />
                )}
            </div>
            <input className={`popup-header-search ${props.page.type === 'search' ? 'show-flex' : 'hide'}`}
                type="text" onInput={onInput} value={props.page.key} ref={searchInput} />
            <div className={`popup-header-hidden ${props.page.type === 'hidden' ? 'show-inline' : 'hide'}`}>
                {chrome.i18n.getMessage("hidden_list")}
            </div>
            <div className={`popup-header-hidden ${props.page.type === 'options' ? 'show-inline' : 'hide'}`}>
                {chrome.i18n.getMessage("options")}
            </div>
            <button className="search-button" onClick={switchView} aria-label="toggle search" />
            {props.msgs.map(msg =>
                <PopupMessage msg={msg} onClose={props.clearMsg} />
            )}
        </div>
    );
}