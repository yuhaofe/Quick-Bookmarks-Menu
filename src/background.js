function colorThemeChanged(theme){
    switch (theme) {
        case 'light':
            chrome.browserAction.setIcon({
                path: {
                    "16": "../icons/qbm16.png",
                    "32": "../icons/qbm32.png"
                }
            });
            break;
        case 'dark':
            chrome.browserAction.setIcon({
                path: {
                    "16": "../icons/qbm16-dark.png",
                    "32": "../icons/qbm32-dark.png"
                }
            });
            break;
        case 'auto':
        default:
            const mql = window.matchMedia('(prefers-color-scheme: dark)');
            if (mql.matches) {
                colorThemeChanged('dark');
            }else{
                colorThemeChanged('light');
            }
            chrome.runtime.onMessage.addListener(({ theme }) => {
                colorThemeChanged(theme);
            });
            break;
    }
}

chrome.storage.local.get(['openIn', 'hoverEnter', 'startup', 'root', 'theme', 'scroll', 'hidden', 'showHidden'], ({ openIn, hoverEnter, startup, root, theme, scroll, hidden, showHidden}) => {
    const qbm = {
        startup: ['1', 18],
        openIn: 'new',
        hoverEnter: 'medium',
        root: 'root',
        theme: 'auto',
        scroll: 'y',
        hidden: [],
        showHidden: false
    };

    if (!startup) {
        chrome.storage.local.set({ startup } = qbm);
    } else if (!startup[1]) {
        chrome.storage.local.set({ startup: [startup, 18]});
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

    if (!theme) {
        chrome.storage.local.set({ theme } = qbm);
    } else {
        qbm.theme = theme;
    }
    colorThemeChanged(qbm.theme);

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

    //#region open in menus
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
    //#endregion

    //#region hover enter menus
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
    //#endregion

    //#region root folder menus
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
    //#endregion

    //#region color theme menus
    const colorThemeChecked = {
        auto: [true, false, false],
        light: [false, true, false],
        dark: [false, false, true]
    };
    chrome.contextMenus.create({
        id: 'color_theme',
        title: chrome.i18n.getMessage("color_theme"),
        type: 'normal',
        contexts: ['browser_action']
    });
    chrome.contextMenus.create({
        id: 'color_theme_auto',
        title: chrome.i18n.getMessage("auto"),
        type: 'radio',
        checked: colorThemeChecked[qbm.theme][0],
        parentId: 'color_theme',
        contexts: ['browser_action']
    });
    chrome.contextMenus.create({
        id: 'color_theme_light',
        title: chrome.i18n.getMessage("light"),
        type: 'radio',
        checked: colorThemeChecked[qbm.theme][1],
        parentId: 'color_theme',
        contexts: ['browser_action']
    });
    chrome.contextMenus.create({
        id: 'color_theme_dark',
        title: chrome.i18n.getMessage("dark"),
        type: 'radio',
        checked: colorThemeChecked[qbm.theme][2],
        parentId: 'color_theme',
        contexts: ['browser_action']
    });
    //#endregion

    //#region scroll layout menus
    const scrollLayoutChecked = {
        y: [true, false],
        x: [false, true]
    };
    chrome.contextMenus.create({
        id: 'scroll_layout',
        title: chrome.i18n.getMessage("scroll_layout"),
        type: 'normal',
        contexts: ['browser_action']
    });
    chrome.contextMenus.create({
        id: 'scroll_layout_y',
        title: chrome.i18n.getMessage("scroll_layout_y"),
        type: 'radio',
        checked: scrollLayoutChecked[qbm.scroll][0],
        parentId: 'scroll_layout',
        contexts: ['browser_action']
    });
    chrome.contextMenus.create({
        id: 'scroll_layout_x',
        title: chrome.i18n.getMessage("scroll_layout_x"),
        type: 'radio',
        checked: scrollLayoutChecked[qbm.scroll][1],
        parentId: 'scroll_layout',
        contexts: ['browser_action']
    });
    //#endregion

    //#region show hidden menus
    chrome.contextMenus.create({
        id: 'show_hidden',
        title: chrome.i18n.getMessage("show_hidden"),
        type: 'checkbox',
        checked: qbm.showHidden,
        contexts: ['browser_action']
    });
    //#endregion
});

chrome.contextMenus.onClicked.addListener(({ menuItemId, parentMenuItemId, wasChecked}) => {
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
    const color_theme = {
        key: 'theme',
        color_theme_auto: 'auto',
        color_theme_light: 'light',
        color_theme_dark: 'dark'
    };
    const scroll_layout = {
        key: 'scroll',
        scroll_layout_y: 'y',
        scroll_layout_x: 'x'
    };
    const menus = {
        open_in,
        hover_enter,
        root_folder,
        color_theme,
        scroll_layout
    };
    const checkboxMenusKey = {
        show_hidden: 'showHidden'
    };
    if (parentMenuItemId){
        const parentMenu = menus[parentMenuItemId];
        chrome.storage.local.set({ [parentMenu.key]: parentMenu[menuItemId] });
        
        if (parentMenu.key === 'root'){
            const rootId = {
                root: '0',
                bar: '1',
                other: '2'
            }
            chrome.storage.local.set({ startup: [rootId[parentMenu[menuItemId]], 18] });
        }
        if (parentMenu.key === 'theme'){
            colorThemeChanged(parentMenu[menuItemId]);
        }
    }else{
        chrome.storage.local.set({ [checkboxMenusKey[menuItemId]]: !wasChecked });
    }
});
