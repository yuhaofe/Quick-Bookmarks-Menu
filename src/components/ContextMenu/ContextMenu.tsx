import { createRef, h, Fragment } from 'preact';
import { useEffect, useState, useContext } from 'preact/hooks';
import { HideContext, NotifyContext } from '../ContextWrapper';
import './ContextMenu.scss';

interface ContextMenuProps {
    a: string;
};

interface Bookmark {
    id: string;
    title: string;
    url?: string;
    active: boolean;
};

type Position = [x: number, y: number];

export default function ContextMenu(props: ContextMenuProps) {
    const notify = useContext(NotifyContext);
    const setItemHide = useContext(HideContext);
    const [bookmark, setBookmark] = useState<Bookmark>({ id: '0', title: '', active: true });
    const [pos, setPos] = useState<Position>([0, 0]);
    const [show, setShow] = useState(false);
    const menuRef = createRef<HTMLUListElement>();

    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        let point: Position = [e.clientX, e.clientY];

        // get bookmark of the pos
        const elm = document.elementFromPoint(...point);
        if (!elm) {
            return;
        }
        const bmItem = elm.closest('.bookmark-item');
        if (!bmItem) {
            return;
        }
        const id = (bmItem as HTMLDivElement).dataset.id;
        if (!id) {
            return;
        }
        const active = !bmItem.matches('.bookmark-item-hide');
        chrome.bookmarks.get(id, results => {
            if (results.length === 0) {
                return;
            }
            let { id, title, url } = results[0];
            setBookmark({ id, title, url, active});
        })

        // make sure menu is not out of viewport
        let menu: any = menuRef.current;
        if (!menu || !menu.clientWidth || !menu.clientHeight) {
            menu = {  clientWidth: 140, clientHeight: 120 };
        }
        const deltaX = window.innerWidth - menu.clientWidth - point[0];
        const deltaY = window.innerHeight - menu.clientHeight - point[1];
        if (deltaX <= 5) {
            point[0] = window.innerWidth - 5 - menu.clientWidth;
        }
        if (deltaY <= 5) {
            point[1] = window.innerHeight - 5 - menu.clientHeight;
        }
        setPos(point);

        if (!show) {
            setShow(true);
        }
    };

    const handleBlur = (e: Event) => {
        if (show) {
            setShow(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleBlur);
        document.addEventListener('wheel', handleBlur);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('click', handleBlur);
            document.removeEventListener('wheel', handleBlur);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
        // re register event listener when active is modified
    }, [show, menuRef]);

    const handleHideClick = () => {
        setItemHide(bookmark.id);
        notify({
            target: bookmark.title,
            action: bookmark.active ?
                chrome.i18n.getMessage("set_hidden") :
                chrome.i18n.getMessage("set_hidden_off")
        });
    };

    const handleOpenURL = (openIn: 'new' | 'background' | 'current') => {
        let active = false;
        switch (openIn) {
            case 'new':
                active = true;
            case 'background':
                chrome.tabs.create({ url: bookmark.url, active });
                window.close();
                break;
            case 'current':
            default:
                chrome.tabs.update({ url: bookmark.url });
                window.close();
                break;
        }
    };

    return (
        <ul className={`context-menu ${show ? 'show' : 'hide'}`} style={{ top: pos[1], left: pos[0] }} ref={menuRef}>
            {
                // if url is undefined, the bookmark is a folder
                bookmark.url && 
                <>
                    <li onClick={() => handleOpenURL('new')}>{chrome.i18n.getMessage('menu_open_in_new')}</li>
                    <li onClick={() => handleOpenURL('current')}>{chrome.i18n.getMessage('menu_open_in_current')}</li>
                    <li onClick={() => handleOpenURL('background')}>{chrome.i18n.getMessage('menu_open_in_background')}</li>
                    <li className="divider"></li>
                </>
            }
            <li onClick={handleHideClick}>{bookmark.active ? chrome.i18n.getMessage('menu_hide') : chrome.i18n.getMessage('menu_show')}</li>
        </ul>
    );
}