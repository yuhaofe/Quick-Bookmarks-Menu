import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import OptionsItemComponent, { OptionsItem } from './OptionsItem';
import "./OptionsPage.scss";

const optionsItems: OptionsItem[] = [
    {
        name: 'open_in',
        storage: 'openIn',
        type: 'radio',
        options: [
            {
                name: 'open_in_new',
                value: 'new'
            },
            {
                name: 'open_in_current',
                value: 'current',
            },
            {
                name: 'open_in_background',
                value: 'background',
            }
        ]
    },
    {
        name: 'open_in_middle',
        storage: 'openInMiddle',
        type: 'radio',
        options: [
            {
                name: 'open_in_new',
                value: 'new'
            },
            {
                name: 'open_in_current',
                value: 'current',
            },
            {
                name: 'open_in_background',
                value: 'background',
            }
        ]
    },
    {
        name: 'do_not_close',
        storage: 'doNotClose',
        type: 'radio',
        options: [
            {
                name: 'do_not_close_none',
                value: 'none'
            },
            {
                name: 'do_not_close_current',
                value: 'current',
            },
            {
                name: 'do_not_close_background',
                value: 'background',
            },
            {
                name: 'do_not_close_both',
                value: 'both',
            }
        ]
    },
    {
        name: 'hover_enter',
        storage: 'hoverEnter',
        type: 'radio',
        options: [
            {
                name: 'hover_enter_off',
                value: 'off'
            },
            {
                name: 'hover_enter_slow',
                value: 'slow',
            },
            {
                name: 'hover_enter_medium',
                value: 'medium',
            },
            {
                name: 'hover_enter_fast',
                value: 'fast',
            }
        ]
    },
    {
        name: 'root_folder',
        storage: 'root',
        type: 'radio',
        options: [{ name: '', value: '0' }]
    },
    {
        name: 'color_theme',
        storage: 'theme',
        type: 'radio',
        options: [
            {
                name: 'auto',
                value: 'auto'
            },
            {
                name: 'light',
                value: 'light',
            },
            {
                name: 'dark',
                value: 'dark',
            }
        ]
    },
    {
        name: 'scroll_layout',
        storage: 'scroll',
        type: 'radio',
        options: [
            {
                name: 'scroll_layout_y',
                value: 'y'
            },
            {
                name: 'scroll_layout_x',
                value: 'x',
            }
        ]
    },
    {
        name: 'show_hidden',
        storage: 'showHidden',
        type: 'checkbox',
        options: [{ name: '', value: false }]
    }
];

export default function OptionsPage() {
    const [items, setItems] = useState(optionsItems);

    useEffect(() => {
        const index = items.findIndex(item => item.name === 'root_folder');
        if (index >= 0) {
            (async () => {
                const root = await chrome.bookmarks.get('0');
                items[index].options = [];
                items[index].options.push({ name: chrome.i18n.getMessage("home"), value: root[0].id });
                const results = await chrome.bookmarks.getChildren('0');
                items[index].options.push(...results.map(result => ({ name: result.title, value: result.id })));
                setItems([...items]);
            })();
        }
    }, []);

    return (
        <div className="options-page">
            {
                items.map(item => <OptionsItemComponent {...item}></OptionsItemComponent>)
            }
        </div>
    );
}