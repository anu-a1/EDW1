import React from 'react';
import cx from "classnames";
import {Button, Panel} from "react-bootstrap";
import _ from 'lodash';
import isEmpty from 'lodash/isEmpty';

import Grid from '../../../components/utils/Grid';
import Tree from '../../../components/utils/Tree';
import Comments from '../../../components/Hierarchy/Editor/Comments';

class Changes extends React.Component {

    state = {
        showDeleted: true,
        showInserted: true,
        showRenamed: true,
        showMoved: true,
        showMerged: true,

        changes: {}

    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.dimensionChangeList !== this.props.dimensionChangeList) {
            this.getChangeListMappings(nextProps.dimensionChangeList);
        }
    };

    getCommentAreaValue = () => this.commentsRef.getNewComments();

    resetCommentAreaValue = () => this.commentsRef.resetCommentArea();

    getChangeListMappings = changes => {
        const transformChanges = _.groupBy(changes, item => {
            return {
                "0": "deleted",
                "1": "inserted",
                "2": "merged",
                "3": "moved",
                "4": "renamed"
            }[item.action];
        });

        this.setState({changes: transformChanges});
    };

    highlightAndScroll = (item, type, gridInstance) => {
        if (!item) {
            return;
        }

        this.clearGridSelections(gridInstance);

        const highlightBy = {
            'merged': 'destinationId',
            'deleted': 'oldParentId'
        }[type] || null;

        const itemScrollId = highlightBy || 'id';

        this.treeRef.highlightBy([item], type, highlightBy);
        this.treeRef.scrollToHighlightedLeaf(`${item[itemScrollId]}-leaf`);
    };

    clearGridSelections = (activeGrid) => {
        this.deleteGridRef && activeGrid !== this.deleteGridRef && this.deleteGridRef.clearSelected();
        this.insertedGridRef && activeGrid !== this.insertedGridRef && this.insertedGridRef.clearSelected();
        this.renamedGridRef && activeGrid !== this.renamedGridRef && this.renamedGridRef.clearSelected();
        this.movedGridRef && activeGrid !== this.movedGridRef && this.movedGridRef.clearSelected();
        this.mergedGridRef && activeGrid !== this.mergedGridRef && this.mergedGridRef.clearSelected();
    };

    render() {
        const {members, comments, userInfo, isValidComment} = this.props;
        const {showDeleted, showInserted, showRenamed, showMoved, showMerged, changes} = this.state;

        return (
            <div className="container-flex">

                <div className="container-flex-item container-flex-column-left container-approvals">
                    <h3>Approval Changes</h3>
                    <div className="approvals-tables-content">

                        {
                            !isEmpty(changes.deleted) &&
                            <div className="block-collapsible">
                                <Button className={cx("block-collapsible-nav", {"is-open": showDeleted})}
                                        onClick={() => this.setState({showDeleted: !showDeleted})}>
                                    <span className="caret"/>
                                    Deleted Dimension Members
                                </Button>
                                <Panel className="block-collapsible-content table-4-cols"
                                       collapsible
                                       expanded={showDeleted}>
                                    <Grid
                                        wrapperClassName="table-simple"
                                        pagination={false}
                                        ref={deleteGrid => this.deleteGridRef = deleteGrid}
                                        onSelect={item => this.highlightAndScroll(item, 'deleted', this.deleteGridRef)}
                                        isSingleSelect={true}
                                        isSelectable={true}
                                        data={changes.deleted}
                                        emptyGridHeight="34px"
                                        bodyScheme={[{
                                            key: 'name'
                                        }, {
                                            key: 'code'
                                        }, {
                                            key: 'oldParentName'
                                        }, {
                                            key: 'oldParentCode'
                                        }]}
                                        headerScheme={[{
                                            title: 'Name',
                                            key: 'name',
                                            sortable: true
                                        }, {
                                            title: 'Code',
                                            key: 'code',
                                            sortable: true
                                        }, {
                                            title: 'Old Parent Name',
                                            key: 'oldParentName',
                                            sortable: true
                                        }, {
                                            title: 'Old Parent Code',
                                            key: 'oldParentCode',
                                            sortable: true
                                        }]}
                                    />
                                </Panel>
                            </div>
                        }

                        {
                            !isEmpty(changes.inserted) &&
                            <div className="block-collapsible">
                                <Button className={cx("block-collapsible-nav", {"is-open": showInserted})}
                                        onClick={() => this.setState({showInserted: !showInserted})}>
                                    <span className="caret"/>
                                    Inserted Dimension Members
                                </Button>
                                <Panel className="block-collapsible-content table-4-cols"
                                       collapsible
                                       expanded={showInserted}>
                                    <Grid
                                        wrapperClassName="table-simple"
                                        pagination={false}
                                        ref={insertedGrid => this.insertedGridRef = insertedGrid}
                                        onSelect={item => this.highlightAndScroll(item, 'inserted', this.insertedGridRef)}
                                        isSingleSelect={true}
                                        isSelectable={true}
                                        data={changes.inserted}
                                        emptyGridHeight="34px"
                                        bodyScheme={[{
                                            key: 'name'
                                        }, {
                                            key: 'code'
                                        }, {
                                            key: 'parentName'
                                        }, {
                                            key: 'parentCode'
                                        }]}
                                        headerScheme={[{
                                            title: 'Name',
                                            key: 'name',
                                            sortable: true
                                        }, {
                                            title: 'Code',
                                            key: 'code',
                                            sortable: true
                                        }, {
                                            title: 'Parent Name',
                                            key: 'parentName',
                                            sortable: true
                                        }, {
                                            title: 'Parent Code',
                                            key: 'parentCode',
                                            sortable: true
                                        }]}
                                    />
                                </Panel>
                            </div>
                        }

                        {
                            !isEmpty(changes.renamed) &&
                            <div className="block-collapsible">
                                <Button className={cx("block-collapsible-nav", {"is-open": showRenamed})}
                                        onClick={()=> this.setState({showRenamed: !showRenamed})}>
                                    <span className="caret"/>
                                    Renamed Dimension Members
                                </Button>
                                <Panel className="block-collapsible-content table-4-cols"
                                       collapsible
                                       expanded={showRenamed}>
                                    <Grid
                                        wrapperClassName="table-simple"
                                        pagination={false}
                                        ref={renamedGrid => this.renamedGridRef = renamedGrid}
                                        onSelect={item => this.highlightAndScroll(item, 'renamed', this.renamedGridRef)}
                                        isSingleSelect={true}
                                        isSelectable={true}
                                        data={changes.renamed}
                                        emptyGridHeight="34px"
                                        bodyScheme={[{
                                            key: 'newName'
                                        }, {
                                            key: 'newCode'
                                        }, {
                                            key: 'name'
                                        }, {
                                            key: 'code'
                                        }]}
                                        headerScheme={[{
                                            title: 'New Name',
                                            key: 'newName',
                                            sortable: true
                                        }, {
                                            title: 'New Code',
                                            key: 'newCode',
                                            sortable: true
                                        }, {
                                            title: 'Old Name',
                                            key: 'name',
                                            sortable: true
                                        }, {
                                            title: 'Old Code',
                                            key: 'code',
                                            sortable: true
                                        }]}
                                    />
                                </Panel>
                            </div>
                        }

                        {
                            !isEmpty(changes.moved) &&
                            <div className="block-collapsible">
                                <Button className={cx("block-collapsible-nav", {"is-open": showMoved})}
                                        onClick={()=> this.setState({showMoved: !showMoved})}>
                                    <span className="caret"/>
                                    Moved Dimension Members
                                </Button>
                                <Panel className="block-collapsible-content table-6-cols"
                                       collapsible
                                       expanded={showMoved}>
                                    <Grid
                                        wrapperClassName="table-simple"
                                        pagination={false}
                                        emptyGridHeight="34px"
                                        ref={movedGrid => this.movedGridRef = movedGrid}
                                        onSelect={item => this.highlightAndScroll(item, 'moved', this.movedGridRef)}
                                        isSingleSelect={true}
                                        isSelectable={true}
                                        data={changes.moved}
                                        bodyScheme={[{
                                            key: 'name'
                                        }, {
                                            key: 'code'
                                        }, {
                                            key: 'parentName'
                                        }, {
                                            key: 'parentCode'
                                        }, {
                                            key: 'oldParentName'
                                        }, {
                                            key: 'oldParentCode'
                                        }]}
                                        headerScheme={[{
                                            title: 'Name',
                                            key: 'name',
                                            sortable: true
                                        }, {
                                            title: 'Code',
                                            key: 'code',
                                            sortable: true
                                        }, {
                                            title: 'New Parent Name',
                                            key: 'parentName',
                                            sortable: true
                                        }, {
                                            title: 'New Parent Code',
                                            key: 'parentCode',
                                            sortable: true
                                        }, {
                                            title: 'Old Parent Name',
                                            key: 'oldParentName',
                                            sortable: true
                                        }, {
                                            title: 'Old Parent Code',
                                            key: 'oldParentCode',
                                            sortable: true
                                        }]}
                                    />
                                </Panel>
                            </div>
                        }

                        {
                            !isEmpty(changes.merged) &&
                            <div className="block-collapsible">
                                <Button className={cx("block-collapsible-nav", {"is-open": showMerged})}
                                        onClick={()=> this.setState({showMerged: !showMerged})}>
                                    <span className="caret"/>
                                    Merged Dimension Members
                                </Button>
                                <Panel className="block-collapsible-content table-4-cols"
                                       collapsible
                                       expanded={showMerged}>
                                    <Grid
                                        wrapperClassName="table-simple"
                                        pagination={false}
                                        ref={mergedGrid => this.mergedGridRef = mergedGrid}
                                        data={changes.merged}
                                        onSelect={item => this.highlightAndScroll(item, 'merged', this.mergedGridRef)}
                                        isSingleSelect={true}
                                        isSelectable={true}
                                        emptyGridHeight="34px"
                                        bodyScheme={[{
                                            key: 'name'
                                        }, {
                                            key: 'code'
                                        }, {
                                            key: 'destinationName'
                                        }, {
                                            key: 'destinationCode'
                                        }]}
                                        headerScheme={[{
                                            title: 'Name',
                                            key: 'name',
                                            sortable: true
                                        }, {
                                            title: 'Code',
                                            key: 'code',
                                            sortable: true
                                        }, {
                                            title: 'Destination Name',
                                            key: 'destinationName',
                                            sortable: true
                                        }, {
                                            title: 'Destination Code',
                                            key: 'destinationCode',
                                            sortable: true
                                        }]}
                                    />
                                </Panel>
                            </div>
                        }
                    </div>
                </div>

                <div className="container-flex-item container-flex-column-right">
                    <h3>Dimension Members Tree</h3>
                    <div className="container-flex-tree">

                        {/* Members */}
                        <Tree dataTitleKey={(leaf) => `${leaf.name} [${leaf.code}]`}
                              data={members}
                              ref={tree => this.treeRef = tree}
                              componentDomId="approvals-dimension-tree"
                              sourceName="regular"
                              searchType="compact"/>
                    </div>
                </div>

                <div className="container-flex-item container-flex-column-comments">
                    <h3>Comments</h3>
                    <Comments messages={comments}
                              isValidComment={isValidComment}
                              enableAutoScroll={false}
                              ref={comments => this.commentsRef = comments}
                              scheme={{
                                  from: "from",
                                  time: "date",
                                  text: "content"
                              }}
                              userInfo={userInfo}/>
                </div>
            </div>
        );
    }
}

export default Changes;