import QBM from '../global.js';

export class BookmarksPathItem extends HTMLElement {
    constructor() {
        super();

        const t = document.querySelector('#bookmarks-path-item-template');
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(t.content.cloneNode(true));
        this.$link = this._shadowRoot.querySelector('a');
    }

    connectedCallback(){
        this.addEventListener('click', this.navigate);
        this._addHoverEnter();
    }

    disconnectedCallback(){
        this._removeHoverEnter();
        this.removeEventListener('click', this.navigate);
        this.removeEventListener('click', this._setStartup);
    }

    setLast(){
        this._removeHoverEnter();
        this.removeEventListener('click', this.navigate);
        
        this.title = chrome.i18n.getMessage("set_startup");
        this.addEventListener('click', this._setStartup);
    }

    get text(){
        return this.$link.innerText;
    }
    set text(value){
        this.$link.innerText = value;
    }

    get itemId(){
        return this._itemId;
    }
    set itemId(value){
        this._itemId = value;
    }

    navigate(){
        if (this._itemId){
            QBM.loadFolder(this._itemId);
        }
    }

    _setStartup(){
        chrome.storage.local.set({ startup: this._itemId });
        QBM.$header.showMsg(`"${this.text}" ${chrome.i18n.getMessage("set_startup_done")}`);
    }

    _addHoverEnter() {
        this._hoverEnter = QBM.hoverEnter;
        this._hoverEnterSpeed = {
            slow: 800,
            medium: 500,
            fast: 200
        }
        if (this._hoverEnter === 'off'){
            this._removeHoverEnter();
            return;
        }
        this.addEventListener('mouseover', this._onMouseOver);
        this.addEventListener('mouseout', this._onMouseOut);
    }

    _removeHoverEnter() {
        this.removeEventListener('mouseover', this._onMouseOver);
        this.removeEventListener('mouseout', this._onMouseOut);
    }

    _onMouseOver() {
        this._onMouseOut();
        this._clickTimeout = setTimeout(() => this.navigate(), this._hoverEnterSpeed[this._hoverEnter]);
    }

    _onMouseOut() {
        if (this._clickTimeout) {
            clearTimeout(this._clickTimeout);
        }
    }
}