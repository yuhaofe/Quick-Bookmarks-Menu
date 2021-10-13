import { h, createContext, ComponentChildren } from 'preact';
import { StateUpdater } from 'preact/hooks';

export interface Page {
    type: 'folder' | 'search' | 'hidden' | 'options';
    key: string;
}

export interface Configuration {
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

export interface Message {
    target: string;
    action: string;
}

interface ContextWrapperProps {
    nav: (type: Page["type"], key: Page["key"]) => void;
    config: [Configuration, StateUpdater<Configuration>];
    notify: (msg: Message) => void;
    hide: (key: string) => void;
    children: ComponentChildren;
};

const NavContext = createContext<ContextWrapperProps["nav"]>(() => { });
const ConfigContext = createContext<ContextWrapperProps["config"]>([{} as Configuration, () => { }]);
const NotifyContext = createContext<ContextWrapperProps["notify"]>(() => { });
const HideContext = createContext<ContextWrapperProps["hide"]>(() => { });

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