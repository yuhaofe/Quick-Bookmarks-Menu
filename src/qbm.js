import { BookmarkItem } from './components/bookmark-item.js';
import { BookmarksList } from './components/bookmarks-list.js';
import { BookmarksContainer } from './components/bookmarks-container.js';
import { BookmarksPathItem } from './components/bookmarks-path-item.js';
import { BookmarksPath } from './components/bookmarks-path.js';
import { BookmarksSearch } from './components/bookmarks-search.js';
import { BookmarksHeader } from './components/bookmarks-header.js';
import { BookmarksManage } from './components/bookmarks-manage.js';

window.customElements.define('bookmark-item', BookmarkItem);
window.customElements.define('bookmarks-list', BookmarksList);
window.customElements.define('bookmarks-container', BookmarksContainer);
window.customElements.define('bookmarks-path-item', BookmarksPathItem);
window.customElements.define('bookmarks-path', BookmarksPath);
window.customElements.define('bookmarks-search', BookmarksSearch);
window.customElements.define('bookmarks-header', BookmarksHeader);
window.customElements.define('bookmarks-manage', BookmarksManage);

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

document.addEventListener('DOMContentLoaded', function () {
    window.oncontextmenu = function () {
        return false;
    };
    chrome.storage.local.get(['openIn', 'hoverEnter', 'startup', 'root', 'theme', 'scroll'], ({openIn, hoverEnter, startup, root, theme, scroll}) => {
        window.qbm = {openIn, hoverEnter, root, scroll};
        applyTheme(theme);

        const container = new BookmarksContainer();
        const header = new BookmarksHeader();
        const manage = new BookmarksManage();

        window.qbm.loadFolder = (id) => {
            header.$path.createPath(id);
            container.showList(id);
        };
        window.qbm.searchBookmarks = (keyword) => {
            container.showList('-1', keyword);
        }

        const body = document.querySelector('body');
        body.appendChild(header);
        body.appendChild(container);
        body.appendChild(manage);

        window.qbm.loadFolder(startup);
    });
});



