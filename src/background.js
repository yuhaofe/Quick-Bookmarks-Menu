chrome.storage.local.get(['startup'], function(result){
    var barChecked = true;
    if (result.startup && result.startup === '2'){
        barChecked = false;
    }

    chrome.bookmarks.get(['1'], function (nodes) {
        chrome.contextMenus.create({
            id: 'startup_bar',
            title: nodes[0].title,
            type: 'radio',
            checked: barChecked,
            contexts: ['browser_action']
        });
    });

    chrome.bookmarks.get(['2'], function (nodes) {   
        chrome.contextMenus.create({
            id: 'startup_other',
            title: nodes[0].title,
            type: 'radio',
            checked: !barChecked,
            contexts: ['browser_action']
        });
    });
});

chrome.contextMenus.onClicked.addListener(function (info){
    switch (info.menuItemId) {
        case 'startup_bar':
            chrome.storage.local.set({ startup: '1' });
            break;
        case 'startup_other':
            chrome.storage.local.set({ startup: '2' });
            break;
        default:
            break;
    }
});
