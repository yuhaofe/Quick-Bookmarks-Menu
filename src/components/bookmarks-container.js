import { BookmarksList } from './bookmarks-list.js';
import QBM from '../global.js';

export class BookmarksContainer extends HTMLElement {
    constructor() {
        super();

        const t = document.querySelector('#bookmarks-container-template');
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(t.content.cloneNode(true));
    }

    connectedCallback(){
        const scroll = QBM.scroll;
        if (scroll === 'x'){
            this.horiz = true;
            this.onwheel = e =>{
                e.preventDefault();
                this.scrollLeft += e.deltaY;
            };
        }
        this.onscroll = () => {
            this.scroll = true;
            if (this._hideScroll) {
                clearTimeout(this._hideScroll);
            }
            this._hideScroll = setTimeout(() => {
                this.scroll = false;
            }, 400);
        };
    }

    disconnectedCallback(){
        
    }

    // set id as '-1' to search keyword
    showList(id, keyword = ''){
        let hasList = false;
        for (let child of this.children){
            child.active = false;
            if (child.listId === id){
                child.keyword = keyword;
                child.active = true;
                hasList = true;
            }
        }
        if (!hasList){
            const list = new BookmarksList();
            list.keyword = keyword;
            list.listId = id;
            list.active = true;
            this.appendChild(list);
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

    get scroll(){
        return this.hasAttribute('scroll');
    }
    set scroll(value){
        if (value) {
            this.setAttribute('scroll', '');
        } else {
            this.removeAttribute('scroll');
        }
    }
}