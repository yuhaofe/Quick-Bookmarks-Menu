import { BookmarkItem } from './bookmark-item.js';

// folder or search list
export class BookmarksList extends HTMLElement {
    constructor() {
        super();

        const t = document.querySelector('#bookmarks-list-template');
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(t.content.cloneNode(true));
        this._keyword = '';
    }

    connectedCallback(){
        const scroll = this.ownerDocument.defaultView.qbm.scroll;
        if (scroll === 'x'){
            this.horiz = true;
        }
    }

    disconnectedCallback(){

    }

    get listId(){
        return this._listId;
    }
    set listId(value){
        this._listId = value;
        if (value != '-1'){
            this._loadChildren()
        }
    }

    get keyword(){
        return this._keyword;
    }
    set keyword(value){
        this._keyword = value;
    }

    get active(){
        return this.hasAttribute('active');
    }
    set active(value){
        if (value) {
            if (this._listId === '-1') {
                this._search();
            }
            this.setAttribute('active', '');
        } else {
            this.removeAttribute('active');
        }
    }

    get horiz(){
        return this.hasAttribute('horiz');
    }
    set horiz(value){
        if (value) {
            this.setAttribute('horiz', '');
        } else {
            this.removeAttribute('horiz');
        }
    }

    _loadChildren(){
        chrome.bookmarks.getChildren(this._listId, results => {
            const fragment = this._createItems(results);
            // remove all children
            while (this.firstChild) {
                this.removeChild(this.firstChild);
            }
            this.appendChild(fragment);
        });
    }

    _search(){
        chrome.bookmarks.search(this._keyword, result => {
            const fragment = this._createItems(result);
            // remove all children
            while (this.firstChild) {
                this.removeChild(this.firstChild);
            }
            this.appendChild(fragment);
        });
    }

    _createItems(results){
        const fragment = document.createDocumentFragment();
        results.forEach(({title, url, id}) => {
            const bmItem = new BookmarkItem();
            bmItem.text = title;
            bmItem.url = url;
            bmItem.itemId = id;
            fragment.appendChild(bmItem);
        });
        return fragment;
    }
}