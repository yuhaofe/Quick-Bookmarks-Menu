chrome.storage.local.get(['openIn', 'openInMiddle', 'doNotClose', 'hoverEnter', 'startup', 'root', 'theme', 'scroll', 'hidden', 'showHidden'], ({ openIn, openInMiddle, doNotClose, hoverEnter, startup, root, theme, scroll, hidden, showHidden}) => {
    const qbm = {
        startup: ['1', 18],
        openIn: 'new',
        openInMiddle: 'background',
        doNotClose: 'none',
        hoverEnter: 'medium',
        root: '0',
        theme: 'auto',
        scroll: 'y',
        hidden: [],
        showHidden: false
    };

    if (!startup) {
        chrome.bookmarks.get('1', results => {  //check for mobile browser
            if (!Array.isArray(results) || !results.length) {
                qbm.startup = ['0', 18];
            }
            chrome.storage.local.set({ startup } = qbm);
        });
    } else if (!startup[1]) {   //check for old format
        chrome.storage.local.set({ startup: [startup, 18]});
    } else {
        qbm.startup = startup;
    }

    if (!openIn) {
        chrome.storage.local.set({ openIn } = qbm);
    } else {
        qbm.openIn = openIn;
    }

    if (!openInMiddle) {
        chrome.storage.local.set({ openInMiddle } = qbm);
    } else {
        qbm.openInMiddle = openInMiddle;
    }

    if (!doNotClose) {
        chrome.storage.local.set({ doNotClose } = qbm);
    } else {
        qbm.doNotClose = doNotClose;
    }

    if (!hoverEnter) {
        chrome.storage.local.set({ hoverEnter } = qbm);
    } else {
        qbm.hoverEnter = hoverEnter;
    }

    if (!root || isNaN(root)) { //check for old format
        chrome.storage.local.set({ root } = qbm);
    } else {
        qbm.root = root;
    }

    if (!theme) {
        chrome.storage.local.set({ theme } = qbm);
    } else {
        qbm.theme = theme;
    }

    if (!scroll) {
        chrome.storage.local.set({ scroll } = qbm);
    } else {
        qbm.scroll = scroll;
    }

    if (!hidden) {
        chrome.storage.local.set({ hidden } = qbm);
    } else {
        qbm.hidden = hidden;
    }

    if (!showHidden) {
        chrome.storage.local.set({ showHidden } = qbm);
    } else {
        qbm.showHidden = showHidden;
    }
});