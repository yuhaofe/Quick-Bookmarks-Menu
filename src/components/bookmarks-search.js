export class BookmarksSearch extends HTMLElement {
    constructor(){
        super();

        const t = document.querySelector('#bookmarks-search-template');
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(t.content.cloneNode(true));
        this.$input = this._shadowRoot.querySelector('input');
    }

    connectedCallback(){
        this.addEventListener('input', this._onInput);
    }

    disconnectedCallback(){
        this.removeEventListener('input', this._onInput);
    }

    _onInput() {
        if (this._inputTimeout) {
            clearTimeout(this._inputTimeout);
        }
        this._inputTimeout = setTimeout(() => {
            this.ownerDocument.defaultView.qbm.searchBookmarks(this.$input.value);
        }, 400);
    }

    get hidden(){
        return this.hasAttribute('hidden');
    }
    set hidden(value){
        if (value) {
            this.setAttribute('hidden', '');
        } else {
            this.removeAttribute('hidden');
        }
    }
}