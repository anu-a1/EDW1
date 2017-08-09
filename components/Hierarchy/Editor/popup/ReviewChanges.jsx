import React from 'react';
import {Modal, Button, Panel} from "react-bootstrap";
import _ from "lodash";
import cx from "classnames";

import PopupButton from './_Button';
import Comments from '../Comments';
import Grid from '../../../../components/utils/Grid';
import Loading from '../../../../components/Loading';

class ReviewChanges extends React.Component {

    state = {
        changes: {},
        loading: true,
        showDeleted: true,
        showInserted: true,
        showRenamed: true,
        showMoved: true,
        showMerged: true,
        showComments: true,

        /*comment area validation*/
        isValidComment: true
    };

    componentWillMount() {
        this.props.getChanges().then(({err}) => {
            if (err) {
                this.setState({loading: false});
                this.props.onHide();
            }
        });
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.changes !== this.props.changes) {
            this.getChanges(nextProps.changes ? nextProps.changes.data : []);
        }
    };

    onSubmit = (event) => {
        event.preventDefault();
        const comment = this.commentsRef ? this.commentsRef.getNewComments() : null;

        if (this.props.approvalId && !comment) {
            return this.setState({isValidComment: false});
        }

        this.props.onConfirm && this.props.onConfirm(comment);
        this.props.onHide();

        return false;
    };

    getChanges = changes => {
        const transformChanges = _.groupBy(changes, item => {
            return {
                "0": "deleted",
                "1": "inserted",
                "2": "merged",
                "3": "moved",
                "4": "renamed"
            }[item.action];
        });
        this.setState({
            "changes": transformChanges,
            loading: false
        });
    };

    render() {
        const {deleted, inserted, renamed, moved, merged} = this.state.changes;
        const {showDeleted, showInserted, showRenamed, showMoved, showMerged, showComments, loading} = this.state;

        return (
            <Modal show={this.props.show} onHide={this.props.onHide} bsSize="large"
                   aria-labelledby="contained-modal-title-lg">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">Review Changes</Modal.Title>
                </Modal.Header>
                <Modal.Body className="review-changes-popup">

                    <Loading show={loading}/>

                    {!_.isEmpty(deleted) && <div className="block-collapsible">
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
                                data={deleted}
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
                                },{
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
                    </div>}

                    {!_.isEmpty(inserted) && <div className="block-collapsible">
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
                                emptyGridHeight="34px"
                                data={inserted}
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
                                },{
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
                    </div>}

                    {!_.isEmpty(renamed) && <div className="block-collapsible">
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
                                emptyGridHeight="34px"
                                data={renamed}
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
                                },{
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
                    </div>}

                    {!_.isEmpty(moved) && <div className="block-collapsible">
                        <Button className={cx("block-collapsible-nav", {"is-open": showMoved})}
                                onClick={()=> this.setState({showMoved: !showMoved})}>
                            <span className="caret"/>
                            Moved Dimension Members
                        </Button>
                        <Panel className="block-collapsible-content table-6-cols" collapsible expanded={showMoved}>
                            <Grid
                                wrapperClassName="table-simple"
                                emptyGridHeight="34px"
                                data={moved}
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
                    </div>}

                    {!_.isEmpty(merged) && <div className="block-collapsible">
                        <Button className={cx("block-collapsible-nav", {"is-open": showMerged})}
                                onClick={()=> this.setState({showMerged: !showMerged})}>
                            <span className="caret"/>
                            Merged Dimension Members
                        </Button>
                        <Panel className="block-collapsible-content table-4-cols" collapsible expanded={showMerged}>
                            <Grid
                                wrapperClassName="table-simple"
                                emptyGridHeight="34px"
                                data={merged}
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
                                },{
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
                    </div>}

                    <div className="block-collapsible block-collapsible-comments">
                        <Button className={cx("block-collapsible-nav", {"is-open": showComments})}
                                onClick={()=> this.setState({showComments: !showComments})}>
                            <span className="caret"/>
                            Comments
                        </Button>

                        <Panel className="block-collapsible-content"
                               collapsible
                               expanded={showComments}>
                            <Comments userInfo={this.props.userInfo}
                                      messages={this.props.approvalId ? this.props.approvalComments : []}
                                      isValidComment={this.props.approvalId ? this.state.isValidComment : true}
                                      ref={el => this.commentsRef = el}
                                      scheme={{
                                          from: "from",
                                          time: "date",
                                          text: "content"
                                      }}/>
                        </Panel>
                    </div>

                    <form onSubmit={this.onSubmit}>
                        <div className="modal-buttons">
                            <Button onClick={this.props.onHide}>Cancel</Button>
                            <Button bsStyle="primary" type="submit">Send</Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        );
    };
}

class ReviewChangesButton extends PopupButton {

    formComponent = ReviewChanges;

    getButton () {
        return (
            <Button
            onClick={this.onOpen}
            disabled={this.props.disabled}
            bsStyle="primary">
                Review Changes
            </Button>
        );
    };

}

export default ReviewChangesButton;
