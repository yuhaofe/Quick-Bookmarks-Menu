import { h, createContext } from 'preact';

const NavContext = createContext('navigate');
const ConfigContext = createContext('config');
const NotifyContext = createContext('notify');
const HideContext = createContext('hide');

export default function ContextWrapper({ nav, config, notify, hide, children }) {
    return (
        <NavContext.Provider value={ nav }>
            <ConfigContext.Provider value={ config }>
                <NotifyContext.Provider value={ notify }>
                    <HideContext.Provider value={ hide }>
                        { children }
                    </HideContext.Provider>
                </NotifyContext.Provider >
            </ConfigContext.Provider>
        </NavContext.Provider>
    );
}

export { NavContext, ConfigContext, NotifyContext, HideContext };