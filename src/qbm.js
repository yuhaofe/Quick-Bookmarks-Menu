function bmShow(item){
    item.classList.remove('bm-hide');
    item.classList.add('bm-show');
}

function bmHide(item){
    item.classList.remove('bm-show');
    item.classList.add('bm-hide');
}

function createBmItem(title, href, icon, id, parentId){
    var bmItem = document.createElement('div');
    bmItem.classList.add('bm-item');

    var bmLink = document.createElement('a');
    bmLink.innerText = title;
    bmLink.href = href;

    if (id){
        // var bmIcon = document.createElement('span');
        // bmIcon.innerText = '&#x1F4C1;';
        var bmIcon = document.createElement('img');
        bmIcon.src = '../icons/folder.webp';
        bmItem.onclick = function(){
            loadFolder(id, parentId);
        };
        bmItem.appendChild(bmIcon);
    }else{
        var bmIcon = document.createElement('img');
        bmIcon.src = icon;
        bmLink.target = '_blank';
        bmItem.appendChild(bmIcon);
    }

    bmItem.appendChild(bmLink);
    return bmItem;
}

function createPath(id){
    var bmPathCurrent = document.querySelector('#bm-path li[data-id="' + id + '"]');
    if (bmPathCurrent){
        var current = bmPathCurrent;
        var silbings = [];
        while (current = current.nextSibling){
            silbings.push(current);
        }
        silbings.forEach(function (silbing) {
            silbing.remove();
        });
    }else{
        var bmPath = document.getElementById('bm-path');
    
        var bmPathItem = document.createElement('li');
        bmPathItem.dataset.id = id;
        bmPathItem.onclick = function (ev) {
            var item = ev.currentTarget;
            loadFolder(item.dataset.id);
        };
        var bmPathItemLink = document.createElement('a');
        bmPathItemLink.href = '#';
        chrome.bookmarks.get(id, function (nodes) {
            bmPathItemLink.innerText = nodes[0].title;
        })
        bmPathItem.appendChild(bmPathItemLink);
        bmPath.appendChild(bmPathItem);
    }
}

function loadFolder(id){
    if (!id){
        return;
    }  
    createPath(id);

    var bmTree;
    var bmTrees = document.querySelectorAll('.bm-tree');
    bmTrees.forEach(function(tree){
        if (tree.dataset.id === id){
            bmTree = tree;
        }
        bmHide(tree);
    });

    if (bmTree){
        bmShow(bmTree);
    }else{
        bmTree = document.createElement('div');
        bmTree.classList.add('bm-tree');
        bmTree.dataset.id = id;

        var bmLists = document.getElementById('bm-lists');
        bmLists.appendChild(bmTree);

        var fragment = document.createDocumentFragment();
        chrome.bookmarks.getChildren(id, function(children){
            children.forEach(function(child) {
                var bmItem;
                if (!child.url){
                    bmItem = createBmItem(child.title, '#', '../res/font-awesome/folder-solid.svg', child.id, id);
                }else{
                    bmItem = createBmItem(child.title, child.url, 'chrome://favicon/' + child.url);
                }
                if (bmItem){
                    fragment.appendChild(bmItem);
                }
            });
            bmTree.appendChild(fragment);
            bmShow(bmTree);
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var rootPath = document.getElementById('bm-path-0');
    rootPath.lastElementChild.innerText = chrome.i18n.getMessage("home");
    rootPath.onclick = function(){
        loadFolder('0');
    };

    var bmManage = document.getElementById('bm-manage');
    bmManage.lastElementChild.innerText = chrome.i18n.getMessage("manage");
    bmManage.onclick = function(){
        chrome.tabs.create({'url': 'chrome://bookmarks'});
    };
    
    var bmLists = document.getElementById('bm-lists');
    bmLists.onscroll = function(ev){
        var lists = ev.currentTarget;
        lists.classList.remove('scrollbar-hide');
        lists.classList.add('scrollbar-show');
        if (lists.hideScroll) {
            clearTimeout(lists.hideScroll);
        }
        lists.hideScroll = setTimeout(function() {
            lists.classList.remove('scrollbar-show');
            lists.classList.add('scrollbar-hide');
        }, 500);
    };

    chrome.storage.local.get(['startup'], function(result) {
        var startup = '1';
        if (result.startup){
            startup = result.startup;
        }else{
            chrome.storage.local.set({ startup: startup });
        }
        loadFolder(startup);
    });
});



