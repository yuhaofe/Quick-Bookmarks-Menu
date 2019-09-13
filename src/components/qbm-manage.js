import { html } from '/web_modules/htm/preact.js';
import { styled } from '/web_modules/goober.js';

import { QbmItem } from '/src/components/qbm-item.js';

const itemProps = {
    id: "",
    type: 'manage',
    title: chrome.i18n.getMessage("manage"),
    url: 'chrome://bookmarks'
};

export function QbmManage() {
    return html`
        <${QbmItem} ...${itemProps}/>
    `;
}