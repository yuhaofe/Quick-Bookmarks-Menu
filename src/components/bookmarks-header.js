import { BookmarksSearch } from './bookmarks-search.js';
import { BookmarksPath } from './bookmarks-path.js';
import QBM from '../global.js';

export class BookmarksHeader extends HTMLElement {
    constructor(){
        super();

        const t = document.querySelector('#bookmarks-header-template');
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(t.content.cloneNode(true));
        this.$button = this._shadowRoot.querySelector('.button');
        this.$msg = this._shadowRoot.querySelector('.msg');
        this.$path = new BookmarksPath();
        this.$search = new BookmarksSearch();
        this.appendChild(this.$path);
        this.appendChild(this.$search);

        this._toggle = ev => {
            if (this.$path.hidden){
                this._showPath();
            }else{
                this._showSearch();
            }
        };
        this._showSearch = ev => {
            this.$path.hidden = true;
            this.$search.hidden = false;
            this.ownerDocument.removeEventListener('keydown', this._showSearch);
            QBM.searchBookmarks(this.$search.$input.value);
            this.$search.$input.focus();
        }
        this._showPath = ev => {
            this.$path.hidden = false;
            this.$search.hidden = true;
            if (this.$path.lastElementChild){
                this.$path.lastElementChild.navigate();
            }
            this.ownerDocument.addEventListener('keydown', this._showSearch);
        }
    }

    connectedCallback(){
        this._showPath();
        this.$button.addEventListener('click', this._toggle);
    }

    disconnectedCallback(){
        this.$button.removeEventListener('click', this._toggle);
    }

    showMsg(text){
        if (this._msgTimeout) {
            clearTimeout(this._msgTimeout);
            this.msg = false;
        }
        this.$msg.firstElementChild.innerText = text;
        this.msg = true;
        this._msgTimeout = setTimeout(() => this.msg = false, 1000);
    }

    get msg(){
        return this.hasAttribute('msg');
    }
    set msg(value){
        if (value) {
            this.setAttribute('msg', '');
        } else {
            this.removeAttribute('msg');
        }
    }
}