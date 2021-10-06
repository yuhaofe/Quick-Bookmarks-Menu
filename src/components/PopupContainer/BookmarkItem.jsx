import { h } from 'preact';
import { styled, css } from 'goober';
import { useState, useContext } from 'preact/hooks';
import { NavContext, ConfigContext, HideContext, NotifyContext } from '../../Popup';

//#region css

const ItemContainer = styled('div')`
    display: ${props => (props.active || props.showHidden) ? "flex" : "none"};
    flex-direction: row;
    height: 30px;
    line-height: 30px;
    background-color: ${props => props.active ? "inherit" : "var(--active-color)"};
`;

const ItemBtn = styled('button')`
    flex: auto;

    border: none;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    cursor: pointer;
    height: 100%;
    line-height: 100%;
    padding-left: 10px;
    background-color: inherit;
    min-width: 0px;

    &:hover {
        border: none;
        background-color: var(--hover-color);
    }

    &:focus {
        border: none;
        outline: none;
        background-color: var(--hover-color);
    } 

    &:active {
        border: none;
        background-color: var(--active-color);
    }
`;

const icons = {
    "link": "none",
    "folder": "var(--folder-icon)",
    "manage": "var(--manage-icon)"
};

const Icon = styled('img')`
    flex: 0 0 auto;
    height: 16px;
    width: 16px;
    filter: var(--icon-filter);

    background-color: inherit;
    background-image: ${ props => icons[props.type] };
    background-size: 16px 16px;
    background-position: center;
    background-repeat: no-repeat;
`;

const Text = styled('span')`
    flex: 1 1 auto;
    color: var(--text-color);
    width: 100%;
    margin-left: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left !important;
`;

const Menu = styled('div')`
    flex: none;

    display: ${props => props.active ? "flex" : "none"};
    flex-direction: row;
    background-color: inherit;
    box-sizing: border-box;
    border: 1px inset;
    border-right-width: 0px;
    height: 100%;
    line-height: 100%;
`;

const HideBtn = styled('button')`
    flex: 0 0 auto;

    height: 30px;
    width: 30px;
    border: none;
    border-left: 1px solid var(--line-color);
    background-color: var(--bg-color);
    background-image: ${props => props.slash ? "var(--eye-slash-icon)":"var(--eye-icon)"};
    background-size: 18px 18px;
    background-position: center;
    background-repeat: no-repeat;

    &:hover {
        background-color: var(--hover-color);
    }

    &:focus {
        outline: none;
        background-color: var(--hover-color);
    } 

    &:active {
        background-color: var(--active-color);
    }
`;
//#endregion

/**
 * 
 * @param {{id: string,
 *  type: string,
 *  title: string,
 *  url: string | undefined}} props 
 */
export default function BookmarkItem(props) {
    const [menuActive, setMenuActive] = useState(false);
    const navigate = useContext(NavContext);
    const notify = useContext(NotifyContext);
    const config = useContext(ConfigContext);
    const setItemHide = useContext(HideContext);
    const hoverEnterSpeed = {
        slow: 750,
        medium: 450,
        fast: 200
    };

    const openFolder = () => navigate('folder', props.id);
    const openUrl = () => {
        const openIn = config.openIn;
        let active = false;
        switch (openIn) {
            case 'new':
                active = true;
            case 'background':
                chrome.tabs.create({ url: props.url, active });
                window.close();
                break;
            case 'current':
            default:
                chrome.tabs.update({ url: props.url });
                window.close();
                break;
        }
    };

    const onClick = () => {
        switch (props.type) {
            case "folder":
                openFolder();
                break;
            case "link":
            case "manage":       
            default:
                openUrl();
                break;
        }
    };

    const onMouseOver = () => {
        if (config.hoverEnter === 'off' || props.type != 'folder') return;
        this._clickTimeout = setTimeout(() => openFolder(), hoverEnterSpeed[config.hoverEnter]);
    };

    const onMouseOut = () => {
        if (this._clickTimeout) {
            clearTimeout(this._clickTimeout);
        }
    };

    const onContextMenu = () => {
        if (this._clickTimeout) {
            clearTimeout(this._clickTimeout);
        }
        setMenuActive(!menuActive);
    };

    const onHiddenClick = () => {
        setItemHide(props.type !='manage' ? props.id : 'manage');
        notify({
            target: props.title,
            action: props.active ?
                chrome.i18n.getMessage("set_hidden") :
                chrome.i18n.getMessage("set_hidden_off")
        });
    };

    return (
        <ItemContainer active={props.active} showHidden={config.showHidden} onMouseLeave={() => setMenuActive(false)}>
            <ItemBtn role="link" tabIndex="0" title={props.type==='link' ? props.title + "\n" + props.url : ""}
                type={props.type} onClick={onClick} onMouseOver={onMouseOver} onMouseOut={onMouseOut} onWheel={onMouseOut}
                onContextMenu={onContextMenu}>
                <Icon src={props.type==='link'? "chrome://favicon/" + props.url 
                    : "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="} type={props.type} />
                <Text>
                    {props.title}
                </Text>
            </ItemBtn>
            <Menu active={menuActive}> 
                <HideBtn onClick={onHiddenClick} slash={!props.active} />
            </Menu>
        </ItemContainer>
    );
}