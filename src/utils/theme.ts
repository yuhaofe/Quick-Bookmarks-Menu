let mql: MediaQueryList | null = null;

export function applyTheme(theme: 'auto' | 'light' | 'dark') {
  const rootElm = document.documentElement;

  const applyDarkTheme = () => {
    rootElm.classList.add('theme-dark');
    rootElm.classList.remove('theme-light');
    chrome.action.setIcon({
      path: {
        "16": "/icons/qbm16-dark.png",
        "32": "/icons/qbm32-dark.png"
      }
    });
  }

  const applyLightTheme = () => {
    rootElm.classList.add('theme-light');
    rootElm.classList.remove('theme-dark');
    chrome.action.setIcon({
      path: {
        "16": "/icons/qbm16.png",
        "32": "/icons/qbm32.png"
      }
    });
  }

  switch (theme) {
    case 'light':
      applyLightTheme();
      break;
    case 'dark':
      applyDarkTheme();
      break;
    case 'auto':
    default:
      const colorSchemeTest = (e: MediaQueryListEvent | MediaQueryList) => {
        if (e.matches) {
          applyDarkTheme();
        } else {
          applyLightTheme();
        }
      };
      if(!mql) {
        mql = window.matchMedia('(prefers-color-scheme: dark)');
        mql.addEventListener("change", colorSchemeTest);
      }
      colorSchemeTest(mql);
      break;
  }
}