
function listenToColorScheme() {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const colorSchemeTest = (e: MediaQueryListEvent | MediaQueryList) => {
    chrome.runtime.sendMessage({
      type: "COLOR_SCHEME_CHANGED",
      value: e.matches ? "dark" : "light"
    });
  };
  colorSchemeTest(mql);

  // not working in offscreen document
  mql.addEventListener("change", colorSchemeTest); 
  
  // bad polling but works
  setInterval(() => {
    colorSchemeTest(mql);
  }, 200);
}

listenToColorScheme();