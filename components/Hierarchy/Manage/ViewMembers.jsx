import React from 'react';
import {Button} from 'react-bootstrap';

import Tree from '../../../components/utils/Tree';
import Grid from '../../../components/utils/Grid';
import HierarchySelect from '../../../containers/Hierarchy/Manage/HierarchySelect';

class ViewMembers extends React.Component {
    
    state = {
        enableReload: false,
        dimensionName: null,
        groupId: null
    };

    getGroupsUpdates = () => this.gridRef.getTableData();
    
    reloadMembers = event => {
        event.preventDefault();
        const {dimensionName, groupId} = this.state;
        this.props.onLoadMembersPressed(dimensionName, groupId);
    };
    
    loadMembers = (dimensionName, groupId) => {
        this.setState({
            enableReload: true,
            dimensionName, groupId
        });
        this.props.onLoadMembersPressed(dimensionName, groupId);
    };

    render() {
        const {selectedViewGroups, members, onHierarchyAssignmentChanged} = this.props;
        return (
            <div className="container-flex">
                <div className="container-flex-item container-flex-column-left">
                    <h3>View</h3>
                    <Grid
                        ref={grid => this.gridRef = grid}
                        wrapperClassName="table-simple"
                        pagination={false}
                        data={selectedViewGroups ? selectedViewGroups : []}
                        bodyScheme={[{
                            key: 'dimensionName'
                        }, {
                            key: 'groupId',
                            component: HierarchySelect,
                            componentProps: {onHierarchyAssignmentChanged, onLoadMembersPressed: this.loadMembers}
                        }]}
                        headerScheme={[{
                            title: 'Dimension',
                            key: 'dimensionName',
                            sortable: true
                        }, {
                            title: 'Hierarchy Assignment'
                        }]}
                    />
                </div>
                <div className="container-flex-item container-flex-column-right">
                    <Button className="btn-dark btn-icon btn-round pull-right"
                            disabled={!this.state.enableReload}
                            onClick={this.reloadMembers}>
                        <span className="icon-round"/>
                    </Button>
                    <h3>Dimension Members Tree</h3>
                    <div className="container-flex-tree">

                        {/* Members */}
                        <Tree dataTitleKey={(leaf) => `${leaf.name} [${leaf.code}]`}
                              data={members ? members.data : []}
                              useCheckboxes={false}
                              includeSearch={false}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default ViewMembers;