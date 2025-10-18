let creating: Promise<void> | null; // A global promise to avoid concurrency issues

chrome.runtime.onInstalled.addListener(init);
chrome.runtime.onStartup.addListener(init);

chrome.runtime.onMessage.addListener(async (message) => {
  if(message.type === 'COLOR_SCHEME_CHANGED') {
    const { theme } = await chrome.storage.local.get(['theme']);
    if (theme !== 'auto') {
      return;
    }
    switch(message.value) {
      case 'dark':
        chrome.action.setIcon({
            path: {
                "16": "/icons/qbm16-dark.png",
                "32": "/icons/qbm32-dark.png"
            }
        });
        break;
      case 'light':
        chrome.action.setIcon({
            path: {
                "16": "/icons/qbm16.png",
                "32": "/icons/qbm32.png"
            }
        });
        break;
      default:
        break;
    }
  }
});

async function init() {
  await initConfig();
  await setupOffscreenDocument("off_screen.html");
}

async function initConfig() {
  let { openIn, openInMiddle, doNotClose, hoverEnter, startup, root, theme, scroll, hidden, showHidden }
    = await chrome.storage.local.get(['openIn', 'openInMiddle', 'doNotClose', 'hoverEnter', 'startup', 'root', 'theme', 'scroll', 'hidden', 'showHidden']);

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
    const results = await chrome.bookmarks.get('1');  //check for mobile browser
    if (!Array.isArray(results) || !results.length) {
      qbm.startup = ['0', 18];
    }
    chrome.storage.local.set({ startup } = qbm);
  } else if (!startup[1]) {   //check for old format
    chrome.storage.local.set({ startup: [startup, 18] });
  } else {
    qbm.startup = startup;
  }

  const emptyOrSet = <K extends keyof typeof qbm>(name: K, value: typeof qbm[K]) => {
    let condition = !value;
    if (name === 'root') {
      condition = !value || isNaN(Number(value)); //check for old format
    }
    
    if (!value) {
      chrome.storage.local.set({ [name]: qbm[name] });
    } else {
      qbm[name] = value;
    }
  }

  emptyOrSet("openIn", openIn);
  emptyOrSet("openInMiddle", openInMiddle);
  emptyOrSet("doNotClose", doNotClose);
  emptyOrSet("hoverEnter", hoverEnter);
  emptyOrSet("root", root);
  emptyOrSet("theme", theme);
  emptyOrSet("scroll", scroll);
  emptyOrSet("hidden", hidden);
  emptyOrSet("showHidden", showHidden);

  return qbm;
}

async function setupOffscreenDocument(path: string) {
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    return;
  }

  // create offscreen document
  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: ['MATCH_MEDIA'],
      justification: 'listen to system light/dark mode change',
    });
    await creating;
    creating = null;
  }
}