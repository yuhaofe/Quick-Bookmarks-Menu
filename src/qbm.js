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
        const bmIcon = document.createElement('img');
        if (!url) {
            bmIcon.src = '../icons/folder.webp';
            bmItem.onclick = () => loadFolder(id);
            addHoverEnter(bmItem, id);
        } else {
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
    // remove all items except root
    const rootPath = document.getElementById('bm-path-0');
    rootPath.onclick = () => loadFolder('0');
    addHoverEnter(rootPath, '0');

    let current = rootPath;
    let nextSilbings = [];
    while (current = current.nextSibling) {
        nextSilbings.push(current);
    }
    nextSilbings.forEach(silbing => silbing.remove());

    // insert items
    (function insertItem(id) {
        if (id === '0') {
            const lastItem = rootPath.parentElement.lastElementChild;
            lastItem.title = chrome.i18n.getMessage("set_startup");
            lastItem.onclick = () => {
                chrome.storage.local.set({ startup: lastItem.dataset.id });
                bmNotify(`"${lastItem.firstElementChild.innerText}" ${chrome.i18n.getMessage("set_startup_done")}`);
            };
            removeHoverEnter(lastItem);
            return;
        }
        const bmPathItem = document.createElement('li');
        bmPathItem.dataset.id = id;
        bmPathItem.onclick = () => loadFolder(id);
        addHoverEnter(bmPathItem, id);

        const bmPathItemLink = document.createElement('a');
        bmPathItemLink.href = '#';
        
        chrome.bookmarks.get(id, results => {
            bmPathItemLink.innerText = results[0].title;
            bmPathItem.appendChild(bmPathItemLink);
            rootPath.parentElement.insertBefore(bmPathItem, rootPath.nextSibling);

            insertItem(results[0].parentId);
        });
    })(folderId);
}

function loadFolder(id) {
    if (!id) {
        return;
    }
    createPath(id);

    let bmTree;
    const bmTrees = document.querySelectorAll('.bm-tree');
    bmTrees.forEach(tree => {
        if (tree.dataset.id === id) {
            bmTree = tree;
        }
        bmHide(tree);
    });

    if (bmTree) {
        bmShow(bmTree);
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
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const rootPath = document.getElementById('bm-path-0');
    rootPath.lastElementChild.innerText = chrome.i18n.getMessage("home");

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

    chrome.storage.local.get(['openIn', 'hoverEnter', 'startup'], ({openIn, hoverEnter, startup}) => {
        window.qbm = {openIn, hoverEnter};
        loadFolder(startup);
    });
});



