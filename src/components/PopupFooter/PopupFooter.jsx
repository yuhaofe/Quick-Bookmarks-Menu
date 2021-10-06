import { h } from 'preact';
import { useState, useEffect, useContext, useRef } from 'preact/hooks';
import { NavContext, ConfigContext } from '../../Popup';
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
    const config = useContext(ConfigContext);

    const onHiddenClick = () => {
        if (props.page.type != 'hidden'){
            if(props.page.type === 'folder'){
                setLastId(props.page.key);
            }
            navigate('hidden', '');
        }else{
            navigate('folder', lastId);
        }
    };

    return (
        <div className="popup-footer">
            <BookmarkItem { ...manageProps } active={ !(props.hidden && props.hidden.includes('manage')) } />
            <button className={ `hidden-button hidden-button-${ config.showHidden ? 'show' : 'hide' }` } 
                onClick={ onHiddenClick } title={ chrome.i18n.getMessage('hidden_list') } />
        </div>
    );
}  