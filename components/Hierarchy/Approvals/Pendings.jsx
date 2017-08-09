import React from 'react';
import Grid from '../../../components/utils/Grid';

class Pendings extends React.Component {

    static defaultProps = {
        statusAliases: {
            "0": "Pending Approval",
            "1": "Approved",
            "2": "Rejected",
            "3": "Approval Bounced"
        },
        typeAliases: {
            "0": "Report",
            "1": "Book Template",
            "2": "Hierarchy"
        }
    };

    resetPendingsGrid = () => this.gridRef && this.gridRef.clearSelected();

    render() {
        const {pendingApproval, onSelectPending, statusAliases, typeAliases} = this.props;
        return (
            <div className="block-pending-table">
                <h3>Pending Approvals</h3>

                <Grid
                    wrapperClassName="table-simple table-6-cols"
                    data={pendingApproval ? pendingApproval.data : []}
                    ref={gridRef => this.gridRef = gridRef}
                    isSingleSelect={true}
                    isSelectable={true}
                    useDropUpSelect={false}
                    onSelect={onSelectPending}
                    sizesPerPage={[5, 15, 25]}
                    emptyGridHeight="34px"
                    bodyScheme={[{
                        key: 'dimension'
                    }, {
                        key: 'groupName'
                    }, {
                        key: 'requestDate',
                        component: 'Date'
                    }, {
                        key: 'requestBy'
                    }, {
                        key: 'status',
                        aliases: statusAliases
                    }, {
                        key: 'type',
                        aliases: typeAliases
                    }]}
                    headerScheme={[{
                        title: 'Dimension',
                        key: 'dimension',
                        sortable: true
                    }, {
                        title: 'Group',
                        key: 'groupName',
                        sortable: true
                    },{
                        title: 'Date',
                        key: 'requestDate',
                        sortable: true
                    }, {
                        title: 'Request From',
                        key: 'requestBy',
                        sortable: true
                    }, {
                        title: 'Status',
                        key: 'status',
                        sortable: true
                    }, {
                        title: 'Approval Type',
                        key: 'type',
                        sortable: true
                    }]}
                />
            </div>
        );
    }
}

export default Pendings;