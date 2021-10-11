import { h, createContext } from 'preact';

interface ContextWrapperProps {
    nav: any;
    config: any;
    notify: (msg: object) => {};
    hide: (key: string) => {};
    children: any;
};

const NavContext = createContext('navigate');
const ConfigContext = createContext('config');
const NotifyContext = createContext((_msg: object) => {});
const HideContext = createContext((_key: string) => {});

export default function ContextWrapper({ nav, config, notify, hide, children } : ContextWrapperProps) {
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