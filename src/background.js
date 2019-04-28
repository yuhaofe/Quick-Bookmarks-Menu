chrome.storage.local.get(['openIn', 'hoverEnter', 'startup', 'root'], ({ openIn, hoverEnter, startup, root}) => {
    const qbm = {
        startup: '1',
        openIn: 'new',
        hoverEnter: 'medium',
        root: 'root'
    };

    if (!startup) {
        chrome.storage.local.set({ startup } = qbm);
    } else {
        qbm.startup = startup;
    }

    if (!openIn) {
        chrome.storage.local.set({ openIn } = qbm);
    } else {
        qbm.openIn = openIn;
    }

    if (!hoverEnter) {
        chrome.storage.local.set({ hoverEnter } = qbm);
    } else {
        qbm.hoverEnter = hoverEnter;
    }

    if (!root) {
        chrome.storage.local.set({ root } = qbm);
    } else {
        qbm.root = root;
    }

    // open in menus
    const openInChecked = {
        new: [true, false, false],
        current: [false, true, false],
        background: [false, false, true]
    }
    chrome.contextMenus.create({
        id: 'open_in',
        title: chrome.i18n.getMessage("open_in"),
        type: 'normal',
        contexts: ['browser_action']
    });
    chrome.contextMenus.create({
        id: 'open_in_new',
        title: chrome.i18n.getMessage("open_in_new"),
        type: 'radio',
        checked: openInChecked[qbm.openIn][0],
        parentId: 'open_in',
        contexts: ['browser_action']
    });
    chrome.contextMenus.create({
        id: 'open_in_current',
        title: chrome.i18n.getMessage("open_in_current"),
        type: 'radio',
        checked: openInChecked[qbm.openIn][1],
        parentId: 'open_in',
        contexts: ['browser_action']
    });
    chrome.contextMenus.create({
        id: 'open_in_background',
        title: chrome.i18n.getMessage("open_in_background"),
        type: 'radio',
        checked: openInChecked[qbm.openIn][2],
        parentId: 'open_in',
        contexts: ['browser_action']
    });

    // hover enter menus
    const hoverEnterChecked = {
        off: [true, false, false, false],
        slow: [false, true, false, false],
        medium: [false, false, true, false],
        fast: [false, false, false, true]
    }
    chrome.contextMenus.create({
        id: 'hover_enter',
        title: chrome.i18n.getMessage("hover_enter"),
        type: 'normal',
        contexts: ['browser_action']
    });
    chrome.contextMenus.create({
        id: 'hover_enter_off',
        title: chrome.i18n.getMessage("hover_enter_off"),
        type: 'radio',
        checked: hoverEnterChecked[qbm.hoverEnter][0],
        parentId: 'hover_enter',
        contexts: ['browser_action']
    });
    chrome.contextMenus.create({
        id: 'hover_enter_slow',
        title: chrome.i18n.getMessage("hover_enter_slow"),
        type: 'radio',
        checked: hoverEnterChecked[qbm.hoverEnter][1],
        parentId: 'hover_enter',
        contexts: ['browser_action']
    });
    chrome.contextMenus.create({
        id: 'hover_enter_medium',
        title: chrome.i18n.getMessage("hover_enter_medium"),
        type: 'radio',
        checked: hoverEnterChecked[qbm.hoverEnter][2],
        parentId: 'hover_enter',
        contexts: ['browser_action']
    });
    chrome.contextMenus.create({
        id: 'hover_enter_fast',
        title: chrome.i18n.getMessage("hover_enter_fast"),
        type: 'radio',
        checked: hoverEnterChecked[qbm.hoverEnter][3],
        parentId: 'hover_enter',
        contexts: ['browser_action']
    });

    // root folder menus
    const rootFolderChecked = {
        root: [true, false, false],
        bar: [false, true, false],
        other: [false, false, true]
    }
    chrome.contextMenus.create({
        id: 'root_folder',
        title: chrome.i18n.getMessage("root_folder"),
        type: 'normal',
        contexts: ['browser_action']
    });
    chrome.contextMenus.create({
        id: 'root_folder_root',
        title: chrome.i18n.getMessage("home"),
        type: 'radio',
        checked: rootFolderChecked[qbm.root][0],
        parentId: 'root_folder',
        contexts: ['browser_action']
    });
    chrome.bookmarks.get('1', results => {
        chrome.contextMenus.create({
            id: 'root_folder_bar',
            title: results[0].title,
            type: 'radio',
            checked: rootFolderChecked[qbm.root][1],
            parentId: 'root_folder',
            contexts: ['browser_action']
        });
    });
    chrome.bookmarks.get('2', results => {
        chrome.contextMenus.create({
            id: 'root_folder_other',
            title: results[0].title,
            type: 'radio',
            checked: rootFolderChecked[qbm.root][2],
            parentId: 'root_folder',
            contexts: ['browser_action']
        });
    });
});

chrome.contextMenus.onClicked.addListener(({ menuItemId, parentMenuItemId }) => {
    const open_in = {
        key: 'openIn',
        open_in_new: 'new',
        open_in_current: 'current',
        open_in_background: 'background'
    };
    const hover_enter = {
        key: 'hoverEnter',
        hover_enter_off: 'off',
        hover_enter_slow: 'slow',
        hover_enter_medium: 'medium',
        hover_enter_fast: 'fast'
    };
    const root_folder = {
        key: 'root',
        root_folder_root: 'root',
        root_folder_bar: 'bar',
        root_folder_other: 'other'
    };

    const menus = {
        open_in,
        hover_enter,
        root_folder
    };
    const parentMenu = menus[parentMenuItemId];
    chrome.storage.local.set({ [parentMenu.key]: parentMenu[menuItemId] });
    
    if (parentMenu.key === 'root'){
        const rootId = {
            root: '0',
            bar: '1',
            other: '2'
        }
        chrome.storage.local.set({ startup: rootId[parentMenu[menuItemId]] });
    }
});
