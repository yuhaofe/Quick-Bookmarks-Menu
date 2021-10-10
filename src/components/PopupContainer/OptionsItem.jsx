import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import './OptionsItem.scss';

/**
 * 
 * @param {import('./OptionsPage').OptionsItem} props
 */
export default function OptionsItem({ name: itemName, storage, type, options }) {
    const [value, setValue] = useState(options[0].value);
    const name = itemName.replace('_', '-');

    const saveValue = (val) => {
        chrome.storage.local.set({ [storage]: val }, () => {
            setValue(val);
        });
        if (itemName === 'root_folder') {
            chrome.storage.local.set({ startup: [val, 18] });
        }
    };

    const onRadioClickHandler = e => {
        saveValue(e.currentTarget.value);
    };

    const onCheckboxClickHandler = e => {
        saveValue(e.currentTarget.checked);
    };

    useEffect(() => {
        chrome.storage.local.get(storage, keys => {
            setValue(keys[storage]);
        })
    }, []);

    return (
        <div className="options-item">
            <span>{chrome.i18n.getMessage(itemName)}</span>
            {
                type === 'radio' && options.map(option => {
                    const id = `${name}-${option.value.replace('_', '-')}`;
                    return (<div className="options-item-option">
                        <input type="radio" name={name} id={id} value={option.value} checked={value === option.value} onClick={onRadioClickHandler}/>
                        <label for={id}>{
                            itemName === 'root_folder' ? option.name :
                            chrome.i18n.getMessage(option.name)
                        }</label>
                    </div>)
                })
            }
            {
                type === 'checkbox' && 
                <input type="checkbox" name={name} id={name} checked={value} onClick={onCheckboxClickHandler}/>
            }
        </div>
    );
}