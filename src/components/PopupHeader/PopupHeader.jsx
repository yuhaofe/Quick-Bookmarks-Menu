import { h } from 'preact';
import { useState, useEffect, useContext, useRef } from 'preact/hooks';
import { NavContext, ConfigContext } from '../ContextWrapper';
import BookmarkPath from './BookmarkPath';
import './PopupHeader.scss';

function PopupMessage(props) {
    this._closeTimer = setTimeout(()=>{
        clearTimeout(this._closeTimer);
        props.onClose();
    }, 1000);
    return (
        <div className="msg-banner">
            {props.msg.target && 
                <span className="msg-target">{props.msg.target}</span>
            }<span> {props.msg.action}</span>
        </div>
    );
}

export default function PopupHeader(props) {
    const [paths, setPaths] = useState([]);
    const [empty, setEmpty] = useState(true);
    const [lastId, setLastId] = useState('0');
    const searchInput = useRef(null);
    const navigate = useContext(NavContext);
    const [config, setConfig] = useContext(ConfigContext);
    const insertItem = (id, newPaths) => {
        const path = {
            id: id,
            title: ''
        };

        chrome.bookmarks.get(id, results => {
            path.title = results[0].title;
            if (id === '0') path.title = chrome.i18n.getMessage("home");
            newPaths.unshift(path);//insert before first
            if (id === config.root) {
                newPaths[newPaths.length - 1].last = true;
                setPaths(newPaths);
                if (empty) setEmpty(false);
                return;
            }
            insertItem(results[0].parentId, newPaths);
        });
    };

    const toggleSearch = () => {
        if(props.page.type === 'folder'){
            setLastId(props.page.key);
        }
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
                searchInput.current.focus();
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
    };

    const switchView = () => {
        if(props.page.type != 'search') {
            toggleSearch();
        }else{
            navigate('folder', lastId);
        }
    };

    return (
        <div className={ `popup-header popup-header-${ props.horiz ? 'horiz' : 'vert' }` }>
            <div className={ `popup-header-path${ empty ? ' popup-header-path-empty' : ''} ${ props.page.type === 'folder' ? 'show-flex' : 'hide' }` }>
                { paths.map( path => 
                    <BookmarkPath {...path} />
                )}
            </div>
            <input className={ `popup-header-search ${ props.page.type === 'search' ? 'show-flex' : 'hide' }` } 
                type="text" onInput={onInput} value={props.page.key} ref={searchInput}/>
            <div className={ `popup-header-hidden ${ props.page.type === 'hidden' ? 'show-inline' : 'hide' }` }>
                {chrome.i18n.getMessage("hidden_list")}
            </div>
            <div className={ `popup-header-hidden ${ props.page.type === 'options' ? 'show-inline' : 'hide' }` }>
                {chrome.i18n.getMessage("options")}
            </div>
            <button className="search-button" onClick={switchView} aria-label="toggle search" />
            {props.msgs.map(msg => 
                <PopupMessage msg={msg} onClose={props.clearMsg} />
            )}
        </div>
    );
}