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
    var bmIcon = document.createElement('img');
    bmIcon.src = icon;
    var bmLink = document.createElement('a');
    bmLink.innerText = title;
    bmLink.href = href;

    if (id){
        bmItem.onclick = function(){
            loadFolder(id, parentId);
        };
    }else{
        bmLink.target = '_blank';
    }

    bmItem.appendChild(bmIcon);
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
                    bmItem = createBmItem(child.title, '#', '../res/font-awesome/folder-regular.svg', child.id, id);
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
    var rootPath = document.querySelector('#bm-path li[data-id="0"]');
    rootPath.querySelector('a').innerText = chrome.i18n.getMessage("home");
    var bmManageLink = document.querySelector('#bm-manage a');
    bmManageLink.innerText = chrome.i18n.getMessage("manage");

    rootPath.onclick = function(){
        loadFolder('0');
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

    var bmManage = document.getElementById('bm-manage');
    bmManage.onclick = function(){
        chrome.tabs.create({'url': 'chrome://bookmarks'});
    }
    
    loadFolder('1');
});



