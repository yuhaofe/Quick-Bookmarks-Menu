import { h } from 'preact';
import BookmarkItem from './BookmarkItem';
import './BookmarkList.scss';

export interface BookmarkListProps {
    list: {
        id: string;
        title: string;
        url: string | undefined;
    }[];
    hidden: string[];
    horiz: boolean;
    active: boolean;
}

export default function BookmarkList(props: BookmarkListProps) {

    return (
        <div className={`bookmark-list bookmark-list-${props.horiz ? 'horiz' : 'vert'} ${props.active ? 'show-grid' : 'hide'}`}>
            {props.list.map(item =>
                <BookmarkItem {...item} key={item.id} type={item.url ? "link" : "folder"} active={!props.hidden.includes(item.id)} />
            )}
        </div>
    );
}