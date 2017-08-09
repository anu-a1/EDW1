import React from 'react';
import Grid from '../utils/Grid';
import {Button} from 'react-bootstrap';
import _ from 'lodash';
import cx from 'classnames';

import Loading from '../Loading';
import ActionFooter from '../ActionFooter';

class ConfigureCase extends React.Component {

    state = {
        showFooter: false,
        data: []
    };

    gridRef = null;

    shouldComponentUpdate(nextProps, nextState) {
        let shouldUpdate = this.state !== nextState;
        _.each(['list', 'newCase'], name => {
            shouldUpdate = this.props[name] !== nextProps[name] || shouldUpdate;
        });
        return shouldUpdate;
    };

    componentWillReceiveProps(nextProps) {
        const isDataUpdated = nextProps.list && nextProps.list !== this.props.list;
        const isNewCreatedCase = nextProps.newCase && nextProps.newCase !== this.props.newCase;

        if (isDataUpdated) {

            if (isNewCreatedCase) {
                const updatedExistedData = this.gridRef.getTableData();
                return this.setState({
                    data: [nextProps.newCase.data, ...updatedExistedData]
                });
            }

            return this.setState({data: nextProps.list.data});
        }
    }

    toggleActionFooter = (showFooter) => {
        this.setState({showFooter});
    };

    onDataChange = () => {
        //data change logic
        this.toggleActionFooter(true);
    };

    saveHandler = () => {
        const tableData = this.gridRef.getTableData();
        this.props
            .updateCasesList(tableData)
            .then(res => {
                if (res instanceof Error) {
                    return;
                }
                this.props.notify({
                    content: 'Cases were saved successfully',
                    type: 'success'
                });
                this.toggleActionFooter(false);
            });
    };

    clearHandler = () => {
        this.gridRef.defineData(this.props.list.data);
        this.toggleActionFooter(false);
    };

    render() {
        return (
            <div className="configure-case-table">
                <Loading show={!this.props.list}/>
                <Grid
                    data={this.state.data}
                    sizesPerPage={[20, 50, 100]}
                    onDataChange={this.onDataChange}
                    justCreatedItemName="case"
                    wrapperClassName={cx("table-wrapper", {
                        "has-footer": this.state.showFooter
                    })}
                    pagination={true}
                    ref={node => this.gridRef = node}
                    bodyScheme={[{
                        key: 'name'
                    }, {
                        key: 'isLockedForGLFeed',
                        component: 'Checkbox'
                    }, {
                        key: 'isLockedForMLFeed',
                        component: 'Checkbox'
                    }, {
                        key: 'isLockedForImport',
                        component: 'Checkbox'
                    }, {
                        key: 'isLockedForCompFeed',
                        component: 'Checkbox'
                    }, {
                        key: 'isLockedForHRFeed',
                        component: 'Checkbox'
                    }, {
                        key: 'description'
                    }]}
                    headerScheme={[{
                        title: 'Case',
                        key: 'name',
                        sortable: true,
                        subHeader: {
                            component: 'Filter'
                        }
                    }, {
                        title: 'Locked for:',
                        columns: [{
                            title: 'GL Feeds',
                            key: 'isLockedForGLFeed',
                            subHeader: {
                                component: 'Checkbox'
                            }
                        }, {
                            title: 'ML Feeds',
                            key: 'isLockedForMLFeed',
                            subHeader: {
                                component: 'Checkbox'
                            }
                        }, {
                            title: 'Adjustments',
                            key: 'isLockedForImport',
                            subHeader: {
                                component: 'Checkbox'
                            }
                        }, {
                            title: 'COMP Feeds',
                            key: 'isLockedForCompFeed',
                            subHeader: {
                                component: 'Checkbox'
                            }
                        }, {
                            title: 'HR Feeds',
                            key: 'isLockedForHRFeed',
                            subHeader: {
                                component: 'Checkbox'
                            }
                        }]
                    }, {
                        title: 'Description',
                        key: 'description',
                        sortable: true,
                        subHeader: {
                            component: 'Filter'
                        }
                    }]}
                />

                <ActionFooter show={this.state.showFooter}>
                    <Button onClick={this.clearHandler}>Cancel</Button>
                    <Button bsStyle="primary" onClick={this.saveHandler}>Save</Button>
                </ActionFooter>

            </div>
        );
    };
}

export default ConfigureCase;
