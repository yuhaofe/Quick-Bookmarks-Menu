import { h } from 'preact';
import { useState, useEffect, useContext, useRef } from 'preact/hooks';
import { ConfigContext, Page } from '../ContextWrapper';
import BookmarkListComponent from './BookmarkList';
import OptionsPage from './OptionsPage';
import './PopupContainer.scss';

interface BookmarkList {
    type: 'folder' | 'hidden' | 'search';
    key: string;
    items: any[];
    active: boolean;
}

const useBookmarks = (initialPage: Page, initialHidden: string[], callback: Function): [BookmarkList[], Function] => {
    const [lists, setLists] = useState<BookmarkList[]>([]);
    const [page, setPage] = useState(initialPage);
    const [hidden, setHidden] = useState(initialHidden);

    const hideLists = () => {
        lists.filter(list => list.active).forEach(list => list.active = false);
    };

    const loadHiddenList = () => {
        let hiddenList = lists.find(list => list.type === 'hidden');
        if (!hiddenList) {
            hiddenList = {
                type: 'hidden',
                key: '',
                items: [],
                active: false
            };
            lists.push(hiddenList);
        }
        const hiddenItems: any[] = [];
        const searchHidden = (parent: any) => {
            if (parent.children !== null && typeof parent.children == "object") {
                parent.children.forEach((item: any) => {
                    if (hidden.includes(item.id)) {
                        hiddenItems.push(item);
                    }
                    searchHidden(item);
                });
            } else {
                return;
            }
        };
        chrome.bookmarks.getTree(root => {
            searchHidden(root[0]);
            if (hiddenList) {
                hiddenList.items = hiddenItems;
                hideLists();
                hiddenList.active = true;
            }
            setLists([...lists]);
        });
    };

    useEffect(() => {
        switch (page.type) {
            case 'folder':
                const existList = lists.find(list => list.key === page.key);
                if (existList) {
                    hideLists();
                    existList.active = true;
                    setLists([...lists]);
                } else {
                    chrome.bookmarks.getChildren(page.key, results => {
                        const newList: BookmarkList = {
                            type: 'folder',
                            key: page.key,
                            active: true,
                            items: results
                        }
                        hideLists();
                        setLists([...lists, newList]);
                    })
                }
                break;

            case 'search':
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
                    if (searchList) {
                        searchList.items = results;
                        hideLists();
                        searchList.active = true;
                    }
                    setLists([...lists]);
                });
                break;

            case 'hidden':
                loadHiddenList();
                break;
            default:
                break;
        }

        callback();
    }, [page]);

    useEffect(() => {
        if (page.type != 'hidden') return;
        loadHiddenList();
    }, [hidden]);

    return [lists, (page: Page, hidden: string[]) => {
        setPage(page);
        setHidden(hidden);
    }];
};

interface PopupContainerProps {
    page: Page;
    hidden: string[];
}

export default function PopupContainer(props: PopupContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [lists, loadBookmarks] = useBookmarks(props.page, props.hidden, () => {
        containerRef.current && (containerRef.current.scrollTo(0, 0));
    });
    const [config, setConfig] = useContext(ConfigContext);
    const horiz = config.scroll === 'x';
    const calcWidth = () => {
        if (props.page.type === 'options') {
            return 300;
        } else {
            const activeList = lists.find(list => list.active);
            const count = activeList ? activeList.items.length : 0;
            return (Math.trunc((count - 1) / 18) + 1) * 200;
        }
    };

    const onWheel = (e: WheelEvent) => {
        if (horiz) {
            e.preventDefault();
            containerRef.current && (containerRef.current.scrollLeft += e.deltaY);
        }
    };

    let hideScroll: number | null = null;
    const onScroll = () => {
        containerRef.current && containerRef.current.setAttribute('scroll', '');
        if (hideScroll) {
            clearTimeout(hideScroll);
        }
        hideScroll = setTimeout(() => {
            containerRef.current && containerRef.current.removeAttribute('scroll');
        }, 400);
    };

    useEffect(() => {
        if (lists.length === 1) {
            document.body.classList.remove('startup');
        }
    }, [lists]);

    loadBookmarks(props.page, props.hidden);
    return (
        <div className={`popup-container popup-container-${horiz ? 'horiz' : 'vert'}`} style={horiz ? { width: calcWidth() + 'px' } : {}}
            onScroll={onScroll} onWheel={onWheel} ref={containerRef}>
            {props.page.type === 'options'
                ? <OptionsPage></OptionsPage>
                : lists.map(list =>
                    <BookmarkListComponent key={list.type === 'search' ? 'search' : list.key} active={list.active}
                        horiz={horiz} list={list.items} hidden={props.hidden} />
                )
            }
        </div>
    );
}