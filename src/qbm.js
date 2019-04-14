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

function loadFolder(id, parentId){
    if (!id){
        return;
    }
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
        parentId = bmTree.dataset.parentid;
    }else{
        bmTree = document.createElement('div');
        bmTree.classList.add('bm-tree');
        bmTree.dataset.id = id;
        bmTree.dataset.parentid = parentId;
        
        chrome.bookmarks.getChildren(id, function(children){
            children.forEach(function(child) {
                var bmItem;
                if (!child.url){
                    bmItem = createBmItem(child.title, '#', '../res/font-awesome/folder-regular.svg', child.id, id);
                }else{
                    bmItem = createBmItem(child.title, child.url, 'chrome://favicon/' + child.url);
                }
                if (bmItem){
                    bmTree.appendChild(bmItem);
                }
            });
        });
        bmShow(bmTree);
        document.body.appendChild(bmTree);
    }

    var bmUpper = document.getElementById('bm-upper');
    if (parentId === '0'){
        bmHide(bmUpper);
    }else{
        bmUpper.dataset.id = parentId;
        bmShow(bmUpper);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var bmUpperLink = document.querySelector('#bm-upper a');
    bmUpperLink.innerText = chrome.i18n.getMessage("upper");
    var bmManageLink = document.querySelector('#bm-manage a');
    bmManageLink.innerText = chrome.i18n.getMessage("manage");

    // ref: https://www.w3schools.com/howto/howto_js_sticky_header.asp
    var bmUpper = document.getElementById('bm-upper');
    var sticky = bmUpper.offsetTop;
    window.onscroll = function() {
        if (window.pageYOffset > sticky) {
            if (!bmUpper.classList.contains('bm-hide')){
                bmUpper.classList.add("bm-sticky");
            }
        } else {
            bmUpper.classList.remove("bm-sticky");
        }
    };

    bmUpper.onclick = function(ev){
        var upper = ev.currentTarget;
        loadFolder(upper.dataset.id);
    };
    
    var bmManage = document.getElementById('bm-manage');
    bmManage.onclick = function(){
        chrome.tabs.create({'url': 'chrome://bookmarks'});
    }
    
    loadFolder('1', '0');
});



