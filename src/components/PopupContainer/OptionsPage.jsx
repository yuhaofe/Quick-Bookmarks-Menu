import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import OptionsItem from './OptionsItem';
import "./OptionsPage.scss";

/**
 * An option of a options item
 * @typedef {Object} Option
 * @property {string} name - This option's i18n name
 * @property {string} value - This option's storage value
 */

/**
 * An options item of this extension
 * @typedef {Object} OptionsItem
 * @property {string} name - This item's i18n name
 * @property {string} storage - This item's storage key
 * @property {'radio'|'checkbox'} type - This item's type
 * @property {Option[]} options - This item's options
 */

/**
 * @type {OptionsItem[]}
 */
const optionsItems = [
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
        options: [{ value: '0' }]       
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
        options: [{ value: false }]   
    }
];

export default function OptionsPage() {
    const [items, setItems] = useState(optionsItems);

    useEffect(() => {
        const index = items.findIndex(item => item.name === 'root_folder');
        if (index >= 0) {
            chrome.bookmarks.get('0', root => {
                items[index].options = [];
                items[index].options.push({ name: chrome.i18n.getMessage("home"), value: root[0].id });
                chrome.bookmarks.getChildren('0', results => {
                    items[index].options.push(...results.map(result => ({ name: result.title, value: result.id }))) ;
                    setItems([...items]);
                });
            });
        }
    }, []);

    return (
        <div className="options-page">
        {
            items.map(item => <OptionsItem {...item}></OptionsItem>)
        }
        </div>
    );
}