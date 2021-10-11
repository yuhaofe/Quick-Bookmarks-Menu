import { h } from 'preact';
import { useState, useEffect, useContext, useRef } from 'preact/hooks';
import { NavContext, ConfigContext } from '../ContextWrapper';
import BookmarkItem from '../PopupContainer/BookmarkItem';
import './PopupFooter.scss';

const manageProps = {
    id: '',
    type: 'manage',
    title: chrome.i18n.getMessage('manage'),
    url: 'chrome://bookmarks'
};

export default function PopupFooter(props) {
    const [lastId, setLastId] = useState('0');
    const navigate = useContext(NavContext);
    const [config, setConfig] = useContext(ConfigContext);

    const onHiddenClick = e => {
        e.currentTarget.blur();
        if (props.page.type != 'hidden'){
            if(props.page.type === 'folder'){
                setLastId(props.page.key);
            }
            navigate('hidden', '');
        }else{
            navigate('folder', lastId);
        }
    };

    const onOptionsClick = e => {
        e.currentTarget.blur();
        if (props.page.type != 'options'){
            if(props.page.type === 'folder'){
                setLastId(props.page.key);
            }
            navigate('options', '');
        }else{
            chrome.storage.local.get(['openIn', 'openInMiddle', 'doNotClose', 'hoverEnter', 'startup', 'root', 'theme', 'scroll', 'hidden', 'showHidden'], result => {
                setConfig(result);
                navigate('folder', result.startup[0]);
            });
        }
    };

    return (
        <div className="popup-footer">
            <BookmarkItem { ...manageProps } active={ !(props.hidden && props.hidden.includes('manage')) } />
            <button className={ `hidden-button hidden-button-${ config.showHidden ? 'show' : 'hide' }` } 
                onClick={ onHiddenClick } title={ chrome.i18n.getMessage('hidden_list') } />
            <button className={ `options-button options-button-show` } 
                onClick={ onOptionsClick } title={ chrome.i18n.getMessage('options') } />
        </div>
    );
}  