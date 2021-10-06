import { h } from 'preact';
import BookmarkItem from './BookmarkItem';
import './BookmarkList.scss';

export default function BookmarkList(props) {

    return (
        <div className={`bookmark-list bookmark-list-${props.horiz ? 'horiz' : 'vert'} ${props.active ? 'show-grid' : 'hide'}`}>
            {props.list.map(item =>
                <BookmarkItem key={item.id} id={item.id} type={item.url ? "link" : "folder"}
                    title={item.title} url={item.url} active={!props.hidden.includes(item.id)} />
            )}
        </div>
    );
}