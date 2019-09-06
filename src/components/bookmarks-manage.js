export class BookmarksManage extends HTMLElement {
    constructor() {
        super();

        const t = document.querySelector('#bookmark-item-template');
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(t.content.cloneNode(true));
        this.$text = this._shadowRoot.querySelector('span');
        this.$img = this._shadowRoot.querySelector('img');
    }

    connectedCallback(){
        this.$text.innerText = chrome.i18n.getMessage("manage");
        this.$img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
        this.setAttribute('manage', '');
        this.addEventListener('click', this._openManage);
    }

    disconnectedCallback(){
        this.removeEventListener('click', this._openManage);
    }

    _openManage(){
        chrome.tabs.create({ 'url': 'chrome://bookmarks' });
    }
}