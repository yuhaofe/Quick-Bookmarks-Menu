import { h, createContext, ComponentChildren } from 'preact';
import { StateUpdater } from 'preact/hooks';

interface Configuration {
    startup: [string, number];
    openIn: 'new' | 'current' | 'background';
    openInMiddle: 'new' | 'current' | 'background';
    doNotClose: 'none' | 'current' | 'background' | 'both';
    hoverEnter: 'off' | 'slow' | 'medium' | 'fast';
    root: string;
    theme: 'auto' | 'light' | 'dark';
    scroll: 'x' | 'y';
    hidden: Array<string>;
    showHidden: boolean;
};
interface ContextWrapperProps {
    nav: (type: string, key: string) => {};
    config: [Configuration, StateUpdater<Configuration>];
    notify: (msg: object) => {};
    hide: (key: string) => {};
    children: ComponentChildren;
};

const NavContext = createContext((_type: string, _key: string) => { });
const ConfigContext = createContext<[Configuration, StateUpdater<Configuration>]>([{} as Configuration, () => {}]);
const NotifyContext = createContext((_msg: object) => { });
const HideContext = createContext((_key: string) => { });

export default function ContextWrapper({ nav, config, notify, hide, children }: ContextWrapperProps) {
    return (
        <NavContext.Provider value={nav}>
            <ConfigContext.Provider value={config}>
                <NotifyContext.Provider value={notify}>
                    <HideContext.Provider value={hide}>
                        {children}
                    </HideContext.Provider>
                </NotifyContext.Provider >
            </ConfigContext.Provider>
        </NavContext.Provider>
    );
}

export { NavContext, ConfigContext, NotifyContext, HideContext };