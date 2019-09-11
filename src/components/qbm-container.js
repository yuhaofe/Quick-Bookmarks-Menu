import { html } from '/web_modules/htm/preact.js';
import { styled } from '/web_modules/goober.js';
import { useState, useEffect, useContext, useRef } from '/web_modules/preact/hooks.js';

import { ConfigContext } from '/src/qbm.js'
import { QbmList } from '/src/components/qbm-list.js';

//#region css
const Container = styled('div')`
    flex: 1 1 auto;
    
    position: relative;
    overflow-y: ${props => props.horiz ? "hidden" : "auto"};
    overflow-x: ${props => props.horiz ? "auto" : "hidden"};
    max-width: ${props => props.horiz ? "none" : "300px"};

    &::-webkit-scrollbar-thumb {
        border-radius: 3px;
        background: var(--active-color);
    }

    &::-webkit-scrollbar {
        display: ${props=> props.scroll ? "initial!important" : "none" };
        width: 6px;
        height: 6px;
    }
`;
//#endregion

const useBookmarks = (initialPage, callback) => {
    const [lists, setLists] = useState([]);
    const [page, setPage] = useState(initialPage);

    const hideLists = () => {
        lists.filter(list => list.active).forEach(list => list.active = false);
    };

    useEffect(()=>{
        if(page.type === 'folder'){
            const existList = lists.find(list => list.key === page.key);
        
            if (existList){
                hideLists();
                existList.active = true;
                setLists([...lists]);
            }else{
                chrome.bookmarks.getChildren(page.key, results => {
                    const newList = {
                        type: 'folder',
                        key: page.key,
                        active: true,
                        items: results
                    }
                    hideLists();
                    setLists([...lists, newList]);
                })
            }
        }else if (page.type === 'search'){
            let searchList = lists.find(list => list.type === 'search');
            if (!searchList) {
                searchList = {
                    type: 'search',
                    key: page.key,
                    items: [],
                    active: false
                }
                lists.push(searchList);
            }
            chrome.bookmarks.search(page.key, results => {
                searchList.items = results;
                hideLists();
                searchList.active = true;
                setLists([...lists]);
            });
        }
        callback();
    }, [page]);

    return [lists, setPage];
};

export function QbmContainer(props) {
    const containerRef = useRef(null);
    const [lists, loadBookmarks] = useBookmarks(props.page, ()=>{
        containerRef.current && (containerRef.current.base.scrollTo(0, 0));
    });
    const [scroll, setScroll] = useState(false);
    const config = useContext(ConfigContext);
    const horiz = config.scroll === 'x';

    const onWheel = e => {
        if(horiz){
            e.preventDefault();
            containerRef.current && (containerRef.current.base.scrollLeft += e.deltaY);
        }
    };

    const onScroll = () => {
        setScroll(true);
        if (this._hideScroll) {
            clearTimeout(this._hideScroll);
        }
        this._hideScroll = setTimeout(() => {
            setScroll(false);
        }, 400);
    };

    useEffect(() => {
        if (lists.length === 1){
            document.body.classList.remove('startup');
        }
    }, [lists]);

    loadBookmarks(props.page);
    return html`
        <${Container} scroll=${scroll} horiz=${horiz} onScroll=${onScroll} onWheel=${onWheel} ref=${containerRef}>
            ${lists.map(list => html`
                <${QbmList} key=${list.type === 'search' ? 'search' : list.key} active=${list.active} horiz=${horiz} list=${list.items}/>
            `)}
        <//>
    `;
}