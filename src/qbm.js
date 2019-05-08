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
    chrome.browserAction.setIcon({
        path: {
            "16": "../icons/qbm16-dark.png",
            "32": "../icons/qbm32-dark.png"
        }
    });
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
    chrome.browserAction.setIcon({
        path: {
            "16": "../icons/qbm16.png",
            "32": "../icons/qbm32.png"
        }
    });
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
            const onDark = e => {
                if (e.matches) {
                    applyDarkTheme(rootStyle);
                } else {
                    applyLightTheme(rootStyle);
                }
            };
            mql.onchange = onDark;
            onDark(mql);
            break;
    }
}

function bmShow(item) {
    item.classList.remove('bm-hide');
    item.classList.add('bm-show');
}

function bmHide(item) {
    item.classList.remove('bm-show');
    item.classList.add('bm-hide');
}

function bmNotify(msg) {
    const bmMsg = document.getElementById('bm-msg');
    if (bmMsg.msgTimeout) {
        clearTimeout(bmMsg.msgTimeout);
        bmHide(bmMsg);
    }
    bmMsg.firstElementChild.innerText = msg;
    bmShow(bmMsg);
    bmMsg.msgTimeout = setTimeout(() => bmHide(bmMsg), 1000);
}

function addHoverEnter(item, id) {
    const speed = {
        slow: 800,
        medium: 500,
        fast: 200
    }
    const hoverEnter = window.qbm.hoverEnter;
    if (hoverEnter === 'off'){
        item.onmouseover = null;
        item.onmouseout = null;
        return;
    }
    item.onmouseover = function () {
        if (item.clickTimeout) {
            clearTimeout(item.clickTimeout);
        }
        item.clickTimeout = setTimeout(() => loadFolder(id), speed[hoverEnter]);
    };
    item.onmouseout = function () {
        if (item.clickTimeout) {
            clearTimeout(item.clickTimeout);
        }
    };
}

function removeHoverEnter(item) {
    item.onmouseover = null;
    item.onmouseout = null;
}

function createBmItems(bmNodes){
    const fragment = document.createDocumentFragment();
    bmNodes.forEach(({title, url, id}) => {
        const bmItem = document.createElement('div');
        bmItem.classList.add('bm-item');
        const bmLink = document.createElement('span');
        bmLink.innerText = title;
        bmLink.classList.add('bm-text');
        let bmIcon;
        if (!url) {
            bmIcon = document.createElement('span');
            bmIcon.classList.add('bm-icon');
            bmItem.onclick = () => loadFolder(id);
            addHoverEnter(bmItem, id);
        } else {
            bmIcon = document.createElement('img');
            bmIcon.src = 'chrome://favicon/' + url;
            bmItem.onclick = () => { 
                let active = false;
                switch (window.qbm.openIn) {
                    case 'new':
                        active = true;
                    case 'background':
                        chrome.tabs.create({ url, active });
                        break;
                    case 'current':
                    default:
                        chrome.tabs.update({ url });
                        break;
                }
            };
        }
        bmItem.appendChild(bmIcon);
        bmItem.appendChild(bmLink);
        fragment.appendChild(bmItem);
    });
    return fragment;
}

function createPath(folderId) {
    const rootId = {
        root: '0',
        bar: '1',
        other: '2'
    }
    const bmPath = document.getElementById('bm-path');
    const fragment = document.createDocumentFragment();

    // insert items
    (function insertItem(id) {
        const bmPathItem = document.createElement('li');
        bmPathItem.dataset.id = id;
        bmPathItem.onclick = () => loadFolder(id);
        addHoverEnter(bmPathItem, id);

        const bmPathItemLink = document.createElement('a');
        bmPathItemLink.href = '#';
        
        chrome.bookmarks.get(id, results => {
            bmPathItemLink.innerText = results[0].title;
            if (id === '0') bmPathItemLink.innerText = chrome.i18n.getMessage("home");
            bmPathItem.appendChild(bmPathItemLink);
            fragment.insertBefore(bmPathItem, fragment.firstElementChild);

            if (id === rootId[window.qbm.root]) {
                // remove all items
                while (bmPath.firstChild) {
                    bmPath.removeChild(bmPath.firstChild);
                }
                // append new items
                bmPath.appendChild(fragment);

                const lastItem = bmPath.lastElementChild;
                lastItem.title = chrome.i18n.getMessage("set_startup");
                lastItem.onclick = () => {
                    chrome.storage.local.set({ startup: lastItem.dataset.id });
                    bmNotify(`"${lastItem.firstElementChild.innerText}" ${chrome.i18n.getMessage("set_startup_done")}`);
                };
                removeHoverEnter(lastItem);
                return;
            }
            insertItem(results[0].parentId);
        });
    })(folderId);
}

function loadFolder(id) {
    if (!id) {
        return;
    }
    createPath(id);

    let currentTree = document.querySelector(`.bm-tree.bm-show`);
    let bmTree = document.querySelector(`.bm-tree[data-id="${id}"]`);

    if (bmTree) {
        bmShow(bmTree);
        if (currentTree) {
            bmHide(currentTree);
        }
    } else {
        bmTree = document.createElement('div');
        bmTree.classList.add('bm-tree');
        bmTree.dataset.id = id;

        const bmLists = document.getElementById('bm-lists');
        bmLists.appendChild(bmTree);

        chrome.bookmarks.getChildren(id, results => {
            const fragment = createBmItems(results);
            bmTree.appendChild(fragment);
            bmShow(bmTree);
            if (currentTree) {
                bmHide(currentTree);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const bmSearchBtn = document.getElementById('bm-search-btn');
    const bmPath = document.getElementById('bm-path');
    const bmSearchBox = document.getElementById('bm-search-box');
    const bmSearchList = document.getElementById('bm-search-list');
    const onsearch = () => {
        document.removeEventListener('keydown', onsearch);
        if (bmPath.classList.contains('bm-show')) {
            const bmTreeShow = document.querySelector('.bm-tree.bm-show');
            bmHide(bmPath);
            bmHide(bmTreeShow);
            bmShow(bmSearchBox);
            bmShow(bmSearchList);
            bmSearchBox.firstElementChild.focus();
        } else if (bmPath.classList.contains('bm-hide')) {
            bmHide(bmSearchBox);
            bmShow(bmPath);
            loadFolder(bmPath.lastElementChild.dataset.id);
            document.addEventListener('keydown', onsearch, { once: true });
        }
    };
    bmSearchBtn.onclick = onsearch;
    document.addEventListener('keydown', onsearch, { once: true });

    bmSearchBox.oninput = ev => {
        const box = ev.target;
        if (box.inputTimeout) {
            clearTimeout(box.inputTimeout);
        }
        box.inputTimeout = setTimeout(() => {
            while (bmSearchList.firstChild) {
                bmSearchList.removeChild(bmSearchList.firstChild);
            }
            chrome.bookmarks.search(box.value, result => {
                const fragment = createBmItems(result);
                bmSearchList.appendChild(fragment);
            });
        }, 400);
    };

    const bmManage = document.getElementById('bm-manage');
    bmManage.lastElementChild.innerText = chrome.i18n.getMessage("manage");
    bmManage.onclick = () => chrome.tabs.create({ 'url': 'chrome://bookmarks' });

    const bmLists = document.getElementById('bm-lists');
    bmLists.onscroll = () => {
        bmLists.classList.remove('scrollbar-hide');
        bmLists.classList.add('scrollbar-show');
        if (bmLists.hideScroll) {
            clearTimeout(bmLists.hideScroll);
        }
        bmLists.hideScroll = setTimeout(() => {
            bmLists.classList.remove('scrollbar-show');
            bmLists.classList.add('scrollbar-hide');
        }, 400);
    };

    chrome.storage.local.get(['openIn', 'hoverEnter', 'startup', 'root', 'theme'], ({openIn, hoverEnter, startup, root, theme}) => {
        window.qbm = {openIn, hoverEnter, root};
        applyTheme(theme);
        loadFolder(startup);
    });
});



