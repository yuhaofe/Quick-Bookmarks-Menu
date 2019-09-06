import { BookmarkItem } from './components/bookmark-item.js';
import { BookmarksList } from './components/bookmarks-list.js';
import { BookmarksContainer } from './components/bookmarks-container.js';
import { BookmarksPathItem } from './components/bookmarks-path-item.js';
import { BookmarksPath } from './components/bookmarks-path.js';
import { BookmarksSearch } from './components/bookmarks-search.js';
import { BookmarksHeader } from './components/bookmarks-header.js';
import { BookmarksManage } from './components/bookmarks-manage.js';
import QBM from './global.js';

window.customElements.define('bookmark-item', BookmarkItem);
window.customElements.define('bookmarks-list', BookmarksList);
window.customElements.define('bookmarks-container', BookmarksContainer);
window.customElements.define('bookmarks-path-item', BookmarksPathItem);
window.customElements.define('bookmarks-path', BookmarksPath);
window.customElements.define('bookmarks-search', BookmarksSearch);
window.customElements.define('bookmarks-header', BookmarksHeader);
window.customElements.define('bookmarks-manage', BookmarksManage);

window.oncontextmenu = function () {
    return false;
};

chrome.storage.local.get(['openIn', 'hoverEnter', 'startup', 'root', 'theme', 'scroll'], ({openIn, hoverEnter, startup, root, theme, scroll}) => {
    QBM.openIn = openIn;
    QBM.hoverEnter = hoverEnter;
    QBM.root = root;
    QBM.scroll = scroll;

    applyTheme(theme);

    QBM.$header = new BookmarksHeader();
    QBM.$container = new BookmarksContainer();
    QBM.$manage = new BookmarksManage();

    QBM.loadFolder = (id) => {
        QBM.$header.$path.createPath(id);
        QBM.$container.showList(id);
    };
    QBM.searchBookmarks = (keyword) => {
        QBM.$container.showList('-1', keyword);
    }

    QBM.loadFolder(startup);

    const fragment = document.createDocumentFragment();
    fragment.appendChild(QBM.$header);
    fragment.appendChild(QBM.$container);
    fragment.appendChild(QBM.$manage);

    const body = document.querySelector('body');
    body.appendChild(fragment);
});

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
    style.setProperty('--icon-filter', 'contrast(1)');
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


