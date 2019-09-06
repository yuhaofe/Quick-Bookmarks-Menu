import { BookmarksPathItem } from './bookmarks-path-item.js';
import QBM from '../global.js';

export class BookmarksPath extends HTMLElement {
    constructor() {
        super();

        const t = document.querySelector('#bookmarks-path-template');
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(t.content.cloneNode(true));
        this._rootId = {
            root: '0',
            bar: '1',
            other: '2'
        };
        this.setAttribute('empty', '');
    }

    connectedCallback(){

    }

    disconnectedCallback(){

    }

    createPath(id){
        this._pathFragment = document.createDocumentFragment();
        this._insertItem(id, ()=>{
            // remove all items
            while (this.firstChild) {
                this.removeChild(this.firstChild);
            }
            // append new items
            this.appendChild(this._pathFragment);
            this.removeAttribute('empty');
            
            const lastItem = this.lastElementChild;
            lastItem.setLast();
        });
    }

    _insertItem(id, callback){
        const bmPathItem = new BookmarksPathItem();
        bmPathItem.itemId = id;
        chrome.bookmarks.get(id, results => {
            bmPathItem.text = results[0].title;
            if (id === '0') bmPathItem.text = chrome.i18n.getMessage("home");
            this._pathFragment.insertBefore(bmPathItem, this._pathFragment.firstElementChild);
            if (id === this._rootId[QBM.root]) {
                callback();
                return;
            }
            this._insertItem(results[0].parentId, callback);
        });
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