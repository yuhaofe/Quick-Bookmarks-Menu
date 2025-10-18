import { h } from 'preact';
import { useState, useContext } from 'preact/hooks';
import { NavContext, ConfigContext, Configuration, Page } from '../ContextWrapper';
import BookmarkItem, { BookmarkItemProps } from '../PopupContainer/BookmarkItem';
import './PopupFooter.scss';

interface PopupFooterProps {
    page: Page;
    hidden: string[];
}

export default function PopupFooter(props: PopupFooterProps) {
    const [lastId, setLastId] = useState('0');
    const navigate = useContext(NavContext);
    const [config, setConfig] = useContext(ConfigContext);

    const onHiddenClick = (e: MouseEvent) => {
        if (e.currentTarget instanceof HTMLButtonElement) {
            e.currentTarget.blur();
        }
        if (props.page.type != 'hidden') {
            if (props.page.type === 'folder') {
                setLastId(props.page.key);
            }
            navigate('hidden', '');
        } else {
            navigate('folder', lastId);
        }
    };

    const onOptionsClick = async (e: MouseEvent) => {
        if (e.currentTarget instanceof HTMLButtonElement) {
            e.currentTarget.blur();
        }
        if (props.page.type != 'options') {
            if (props.page.type === 'folder') {
                setLastId(props.page.key);
            }
            navigate('options', '');
        } else {
            const result = await chrome.storage.local.get(['openIn', 'openInMiddle', 'doNotClose', 'hoverEnter', 'startup', 'root', 'theme', 'scroll', 'hidden', 'showHidden']);
            setConfig(result as Configuration);
            navigate('folder', (result as Configuration).startup[0]);
        }
    };

    const manageProps: BookmarkItemProps = {
        id: '',
        type: 'manage',
        title: chrome.i18n.getMessage('manage'),
        url: 'chrome://bookmarks',
        active: !(props.hidden && props.hidden.includes('manage'))
    };

    return (
        <div className="popup-footer">
            <BookmarkItem {...manageProps} />
            <button className={`hidden-button hidden-button-${config.showHidden ? 'show' : 'hide'}`}
                onClick={onHiddenClick} title={chrome.i18n.getMessage('hidden_list')} />
            <button className={`options-button options-button-show`}
                onClick={onOptionsClick} title={chrome.i18n.getMessage('options')} />
        </div>
    );
}