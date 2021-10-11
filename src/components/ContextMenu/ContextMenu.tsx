import { h } from 'preact';
import { useEffect } from 'preact/hooks';

export default function ContextMenu() {

    useEffect(() => {

        const onContextMenuHandler = (e: MouseEvent) => {
            e.preventDefault();


        };

        document.addEventListener('contextmenu', onContextMenuHandler);

        return () => {
            document.removeEventListener('contextmenu', onContextMenuHandler);
        };
    }, []);

    return (
        <div>

        </div>
    );
}