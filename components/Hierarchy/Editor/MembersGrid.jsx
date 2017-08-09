import React from 'react';
import {Button} from 'react-bootstrap';
import cx from 'classnames';

import Grid from '../../../components/utils/Grid';
import NewMember from './popup/NewMember';

class MembersGrid extends React.Component {
    state = {
        isDeselectDisabled: true
    };

    render() {
        const {refLink, data, title, onSelect, draggable, enableDragPreview, ...props} = this.props;
        return (
            <div className="hierarchy-edit-table">
                <div className="btns-block">
                    <a href="#"
                       onClick={(e) => {
                           e.preventDefault();
                           this.gridRef.clearSelected(props.onDeselect);
                           this.setState({isDeselectDisabled: true});
                       }}
                       className={cx("deselect-link", "dashed-link", {
                           'is-disabled': this.state.isDeselectDisabled
                       })}>
                        Deselect All
                    </a>
                    <NewMember
                        disabled={props.disabled}
                        dimensionName={props.dimensionName}
                        notify={props.notify}
                        onSave={props.onSave}
                        onConfirm={props.onConfirm}
                        isLocked={props.isLocked}
                    />
                    <Button className="btn-dark"
                            disabled={props.disabled}
                            onClick={props.toggleMembersGrid}
                    >{props.enablePushedMembers ? "Show Unmapped" : "Hide Unmapped"}</Button>
                </div>

                <h3>{title}</h3>
                <Grid
                    sizesPerPage={[10, 20, 50]}
                    data={data}
                    onSelect={(items) => {
                        this.setState({isDeselectDisabled: !items.length});
                        onSelect(items);
                    }}
                    enableDragPreview={enableDragPreview}
                    draggable={draggable}
                    sourceName="members"
                    ref={node => {
                        this.gridRef = node;
                        refLink(node);
                    }}
                    justCreatedItemName="member"
                    isSelectable={true}
                    bodyScheme={[{
                        key: 'code'
                    }, {
                        key: 'name'
                    }, {
                        key: 'dateCreated',
                        component: 'Date'
                    }]}
                    headerScheme={[{
                        title: 'Code',
                        key: 'code',
                        sortable: true,
                        subHeader: {
                            component: 'Filter'
                        }
                    }, {
                        title: 'Name',
                        key: 'name',
                        sortable: true,
                        subHeader: {
                            component: 'Filter'
                        }
                    }, {
                        title: 'Date Created',
                        key: 'dateCreated',
                        sortable: true,
                        subHeader: {
                            component: 'Filter',
                            type: 'date'
                        }
                    }]}
                />
            </div>
        );
    };
}

export default MembersGrid;