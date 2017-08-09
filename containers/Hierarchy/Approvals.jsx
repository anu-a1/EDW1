import React, {Component} from 'react';
import {Button} from "react-bootstrap";
import {connect} from 'react-redux';
import _ from 'lodash';
import cx from 'classnames';

import Loading from '../../components/Loading';
import Tooltip from '../../components/utils/Tooltip';

import ActionFooter from '../../components/ActionFooter';
import Pendings from '../../components/Hierarchy/Approvals/Pendings';
import Changes from '../../components/Hierarchy/Approvals/Changes';

import {getPendingApprovals, acceptPending, bouncePending, cancelPending, removePending} from '../../actions/approval';
import notify from '../../actions/notifier';

class Approvals extends Component {

    static defaultProps = {
        messages: {
            onRejectSuccess: 'Approval rejected',
            onApproveSuccess: 'Approval approve send',
            onReviseSuccess: 'Approval sent to revise'
        }
    };

    get defaultState() {
        return {
            dimensionMembers: [],
            isLoading: false,
            comments: [],
            dimensionName: null,
            isValidComment: true,
            selectedApprovalId: null,
            showFooter: false,
            groupId: null,
            isReviseEnabled: false,
            dimensionMemberChangeList: []
        };
    };

    state = this.defaultState;

    componentDidMount() {
        this.toggleLoader(true);
        this.props.getPendingApprovals().then(res => this.toggleLoader(false));
    };

    toggleLoader = (show) => this.setState({isLoading: show});


    /**
     * Determines wheter merged item presented on chagedList
     * merged is true when action property equals to 2
     * @param changedList
     */
    isSendToReviseEnabled = (changedList) => !_.find(changedList, item => parseInt(item.action, 10) === 2);

    loadChanges = (selected) => {
        if (!selected) {
            return this.setState(this.defaultState);
        }

        const {comments, dimension, groupId, dimensionMemberChangeList, dimensionMembers} = selected;

        this.setState({
            comments: [...comments].reverse(),
            groupId,
            selectedApprovalId: selected.id,
            dimensionMemberChangeList,
            dimensionMembers,
            dimensionName: dimension,
            isValidComment: true,
            showFooter: true,
            isReviseEnabled: this.isSendToReviseEnabled(dimensionMemberChangeList)
        });
    };

    getCommentState = () => {
        const comment = this.changesRef.getCommentAreaValue();

        this.setState({isValidComment: !!comment});

        return comment;
    };

    onReject = () => {
        const comment = this.getCommentState();
        if (!comment) { return; }

        const {messages, notify, cancelPending} = this.props;
        this.setState({isLoading: true});

        cancelPending(
            this.state.selectedApprovalId,
            comment
            )
            .then(() => {
                notify({type: 'success', content: messages.onRejectSuccess});
                this.onAnyActionSuccess();
            })
            .catch(err => {
                this.setState({isLoading: false});
                notify({type: 'server-error', content: err.message})
            });
    };

    onApprove = () => {
        const comment = this.getCommentState();
        if (!comment) { return; }

        const {messages, notify, acceptPending} = this.props;
        this.setState({isLoading: true});

        acceptPending(
            this.state.selectedApprovalId,
            comment
        )
            .then(() => {
                notify({type: 'success', content: messages.onApproveSuccess});
                this.onAnyActionSuccess();
            })
            .catch(err => {
                this.setState({isLoading: false});
                notify({type: 'server-error', content: err.message})
            });
    };

    onRevise = () => {
        const comment = this.getCommentState();
        if (!comment) { return; }

        const {messages, notify, bouncePending} = this.props;
        this.setState({isLoading: true});

        bouncePending(
            this.state.selectedApprovalId,
            comment
        )
            .then(() => {
                notify({type: 'success', content: messages.onReviseSuccess});
                this.onAnyActionSuccess();
            })
            .catch(err => {
                this.setState({isLoading: false});
                notify({type: 'server-error', content: err.message})
            });
    };

    onAnyActionSuccess = () => {
        const {selectedApprovalId} = this.state;
        this.pendingsRef.resetPendingsGrid();
        this.changesRef.resetCommentAreaValue();
        this.loadChanges(null);
        this.props.removePending(selectedApprovalId);
    };

    render() {
        const {
            dimensionMemberChangeList, dimensionMembers, comments,
            isValidComment, isReviseEnabled, isLoading, showFooter
        } = this.state;
        const {pendingApproval, userInfo} = this.props;
        return (
            <div className="hierarchy-approvals">
                <Loading show={isLoading}/>
                <div className={cx("hierarchy-approvals-wrapper", {
                    "has-footer": showFooter
                })}>
                    <Pendings pendingApproval={pendingApproval}
                              ref={pendingsRef => this.pendingsRef = pendingsRef}
                              onSelectPending={this.loadChanges}/>

                    <Changes members={dimensionMembers}
                             comments={comments}
                             ref={changesRef => this.changesRef = changesRef}
                             isValidComment={isValidComment}
                             userInfo={userInfo}
                             dimensionChangeList={dimensionMemberChangeList}/>
                </div>

                <ActionFooter show={showFooter}>
                    <Button onClick={this.onReject}>Reject</Button>
                    <Tooltip placement="top" text="Send back to the user to edit hierarchy changes">
                        <Button
                            disabled={!isReviseEnabled}
                            onClick={this.onRevise}>Send to Revise</Button>
                    </Tooltip>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <Button bsStyle="primary" onClick={this.onApprove}>Approve</Button>
                </ActionFooter>
            </div>
        );
    };
}

const mapStateToProps = ({approval, auth}) => ({
    pendingApproval: approval.pending,
    userInfo: auth.userInfo
});

const mapDispatchToProps = {
    getPendingApprovals,
    acceptPending,
    bouncePending,
    cancelPending,
    removePending,
    notify
};

export default connect(mapStateToProps, mapDispatchToProps)(Approvals);
