export class BookmarkItem extends HTMLElement {
    constructor() {
        super();

        const t = document.querySelector('#bookmark-item-template');
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(t.content.cloneNode(true));
        this.$icon = this._shadowRoot.querySelector('img');
        this.$text = this._shadowRoot.querySelector('span');
    }

    connectedCallback(){
        if(!this._url){
            this.addEventListener('click', this._openFolder);
            this._addHoverEnter();
        }else{
            // tooltip title
            this.title = this._text + '\n' + this._url;
            this.addEventListener('click', this._openUrl);
        }
    }

    disconnectedCallback(){
        this._removeHoverEnter();
        this.removeEventListener('click', this._openUrl);
        this.removeEventListener('click', this._openFolder);
    }

    //#region properties
    get text(){
        return this._text;
    }
    set text(value){
        this._text = value;
        this.$text.innerText = value;
    }

    get url(){
        return this._url;
    }
    set url(value){
        this._url = value;
        if (!value){
            // folder item
            // fully transparent 1x1 GIF
            this.$icon.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
            this.folder = true;
        }else{
            // url item
            this.$icon.src = 'chrome://favicon/' + value;
            this.folder = false;
        }
    }

    get folder(){
        return this.hasAttribute('folder');
    }
    set folder(value){
        if (value) {
            this.setAttribute('folder', '');
        } else {
            this.removeAttribute('folder');
        }
    }

    get itemId(){
        return this._itemId;
    }
    set itemId(value){
        this._itemId = value;
    }
    //#endregion

    _openUrl(){
        const openIn = this.ownerDocument.defaultView.qbm.openIn;
        let active = false;
        switch (openIn) {
            case 'new':
                active = true;
            case 'background':
                chrome.tabs.create({ url: this._url, active });
                window.close();
                break;
            case 'current':
            default:
                chrome.tabs.update({ url: this._url });
                window.close();
                break;
        }
    }

    _openFolder(){
        const qbm = this.ownerDocument.defaultView.qbm;
        qbm.loadFolder(this._itemId);
    }

    _addHoverEnter() {
        this._hoverEnter = this.ownerDocument.defaultView.qbm.hoverEnter;
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
        this.addEventListener('wheel', this._onMouseOut);
    }

    _removeHoverEnter() {
        this.removeEventListener('mouseover', this._onMouseOver);
        this.removeEventListener('mouseout', this._onMouseOut);
        this.removeEventListener('wheel', this._onMouseOut);
    }

    _onMouseOver() {
        this._onMouseOut();
        this._clickTimeout = setTimeout(() => this._openFolder(), this._hoverEnterSpeed[this._hoverEnter]);
    }

    _onMouseOut() {
        if (this._clickTimeout) {
            clearTimeout(this._clickTimeout);
        }
    }
}