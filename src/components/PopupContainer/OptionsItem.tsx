import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import './OptionsItem.scss';

/** An option of a options item */
interface Option {
    /** This option's i18n name key */
    name: string;
    /** This option's storage value */
    value: any;
}

/** An options item of this extension */
export interface OptionsItem {
    /** This item's i18n name key */
    name: string;
    /** This item's storage key */
    storage: string;
    /** This item's type */
    type: 'radio' | 'checkbox';
    /** This item's options */
    options: Option[];
}

interface OptionsItemProps extends OptionsItem { }

export default function OptionsItem({ name: itemName, storage, type, options }: OptionsItemProps) {
    const [value, setValue] = useState(options[0].value);
    const name = itemName.replace('_', '-');

    const saveValue = (val: any) => {
        chrome.storage.local.set({ [storage]: val }, () => {
            setValue(val);
        });
        if (itemName === 'root_folder') {
            chrome.storage.local.set({ startup: [val, 18] });
        }
    };

    const onRadioClickHandler = (e: MouseEvent) => {
        if (e.currentTarget instanceof HTMLInputElement) {
            saveValue(e.currentTarget.value);
        }
    };

    const onCheckboxClickHandler = (e: MouseEvent) => {
        if (e.currentTarget instanceof HTMLInputElement) {
            saveValue(e.currentTarget.checked);
        }
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
                        <input type="radio" name={name} id={id} value={option.value} checked={value === option.value} onClick={onRadioClickHandler} />
                        <label for={id}>{
                            itemName === 'root_folder' ? option.name :
                                chrome.i18n.getMessage(option.name)
                        }</label>
                    </div>)
                })
            }
            {
                type === 'checkbox' &&
                <input type="checkbox" name={name} id={name} checked={value} onClick={onCheckboxClickHandler} />
            }
        </div>
    );
}