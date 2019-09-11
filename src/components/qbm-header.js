import { html } from '/web_modules/htm/preact.js';
import { styled } from '/web_modules/goober.js';
import { useState, useEffect, useContext, useRef } from '/web_modules/preact/hooks.js';

import { NavContext, ConfigContext } from '/src/qbm.js'
import { QbmPathItem } from '/src/components/qbm-path-item.js';

//#region css
const Header = styled('div')`
    height: 30px;
    line-height: 30px;
    border-bottom: 1px solid var(--line-color);

    display: flex;
    flex-direction: row;
`;
const Path = styled('div')`
    flex: 1 1 auto;
    display: ${props => props.active ? "flex":"none"};
    flex-direction: row;
    flex-wrap: nowrap;
    height: 30px;
    line-height: 30px;
    background-color: ${props => props.empty ? "inherit":"var(--line-color)"};
    padding: 0px;
    margin: 0px;

`;
const Search = styled('input')`
    flex: 1 1 auto;
    display: ${props => props.active ? "flex":"none"};
    padding-left: 10px;
    user-select: text;

    &:focus {
        outline: none;
        background-color: var(--hover-color);
    }
`;
const Button = styled('button')`
    flex: 0 0 auto;
    height: 100%;
    width: 30px;
    border: none;
    border-left: 1px solid var(--line-color);
    background-color: var(--bg-color);
    background-image: var(--search-icon);
    background-size: 16px 16px;
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
const MsgBanner = styled('div')`
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 30px;
    line-height: 30px;
    background-color: var(--msg-color);
    font-weight: bold;
    flex-direction: row;
    justify-content: center;
    z-index: 3;
`;
//#endregion

function QbmMsg(props) {
    this._closeTimer = setTimeout(()=>{
        clearTimeout(this._closeTimer);
        props.onClose();
    }, 1000);
    return html`
        <${MsgBanner}>
            <span>${props.msg}</span>
        <//>
    `;
}

export function QbmHeader(props) {
    const [paths, setPaths] = useState([]);
    const [empty, setEmpty] = useState(true);
    const [lastId, setLastId] = useState('0');
    const searchInput = useRef(null);
    const navigate = useContext(NavContext);
    const config = useContext(ConfigContext);
    const rootId = {
        root: '0',
        bar: '1',
        other: '2'
    };
    const insertItem = (id, newPaths) => {
        const path = {
            id: id,
            title: ''
        };

        chrome.bookmarks.get(id, results => {
            path.title = results[0].title;
            if (id === '0') path.title = chrome.i18n.getMessage("home");
            newPaths.unshift(path);//insert before first
            if (id === rootId[config.root]) {
                newPaths[newPaths.length - 1].last = true;
                setPaths(newPaths);
                if (empty) setEmpty(false);
                return;
            }
            insertItem(results[0].parentId, newPaths);
        });
    };

    const toggleSearch = () => {
        setLastId(props.page.key);
        navigate('search', '');
        document.removeEventListener('keydown', toggleSearch);
    };

    useEffect(() => {
        const currentId = paths.length > 0 ? paths[paths.length - 1].id : '-1';
        if(props.page.type === 'folder'){
            if(props.page.key != currentId){
                const newPaths = [];
                insertItem(props.page.key, newPaths);
            }
            
        } 
        if(props.page.type === 'search'){
            if(searchInput.current){
                searchInput.current.base.focus();
            }
            
        }
    }, [props.page]);

    useEffect(() => {
        if(props.page.type === 'folder'){
            document.addEventListener('keydown', toggleSearch);
        }
    });

    const onInput = e => {
        if (this._inputTimeout) {
            clearTimeout(this._inputTimeout);
        }
        this._inputTimeout = setTimeout(() => {
            const keyword = e.target.value;
            if (keyword && keyword.length > 1)
                navigate('search', keyword);
        }, 400);
    }

    const switchView = () => {
        if(props.page.type === 'folder') {
            toggleSearch();
        }
        if(props.page.type === 'search') {
            navigate('folder', lastId);
        }
    }
    return html`
        <${Header}>
            <${Path} empty=${empty} active=${props.page.type === 'folder'}>
                ${paths.map(path=> html`
                    <${QbmPathItem} ...${path} />
                `)}
            <//>
            <${Search} type="text" onInput=${onInput} value=${props.page.key} ref=${searchInput} active=${props.page.type === 'search'}/>
            <${Button} onClick=${switchView} aria-label="toggle search"/>
            ${props.msgs.map(msg => html`
                <${QbmMsg} msg=${msg} onClose=${props.clearMsg} />
            `)}
        <//>
    `;
}