import { h } from 'preact';
import { styled } from 'goober';
import { QbmItem } from './qbm-item.jsx'

//#region css
const List = styled('div')`
    display: ${props => props.active ? "grid" : "none"};
    grid-auto-flow: ${props => props.horiz ? "column" : "row"};
    grid-template-rows: repeat(auto-fit, 30px);
    grid-template-columns: ${props => props.horiz ? "repeat(auto-fit, minmax(200px, 1fr))!important" : "300px"};
    grid-auto-columns: ${props => props.horiz ? "minmax(200px, 1fr)!important" : "300px"};
    grid-auto-rows: 30px;
    max-height: ${props => props.horiz ? "540px" : "none"};
    min-width: 300px;
`;
//#endregion

export function QbmList(props) {

    return (
        <List active={props.active} horiz={props.horiz}>
            {props.list.map(item => 
                <QbmItem key={item.id} id={item.id} type={item.url ? "link" : "folder"} 
                    title={item.title} url={item.url} active={!props.hidden.includes(item.id)} />
            )}
        </List>
    );
}