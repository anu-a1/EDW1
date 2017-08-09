import React, {Component} from 'react';
import {Button, FormGroup, ControlLabel} from "react-bootstrap";
import _ from 'lodash';
import async from 'async';
import cx from 'classnames';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import DragLayer from './DragLayer';

import Tooltip from '../../../components/utils/Tooltip';
import Select from '../../../components/utils/Fields/Select';
import Tree from '../../utils/Tree';
import TagList from '../../../components/TagList';
import ActionFooter from '../../../components/ActionFooter';
import Loading from '../../../components/Loading';

import Edit from './Edit';
import Calculations from './Calculations';
import MembersGrid from './MembersGrid';
import SearchGrid from './SearchGrid';
import Comments from './Comments';

import ReviewChanges from './popup/ReviewChanges';
import ValidationErrorOccurred from './popup/ValidationErrorOccurred';
import ConfirmAndLock from './popup/ConfirmAndLock';
import ConfirmDiscardChanges from './popup/ConfirmDiscardChanges';
import NotificationPopup from './popup/Notification';

const bouncedBackStatus = 3;

class Editor extends Component {

    static defaultProps = {
        enableDragPreview: false,
        messages: {
            'hierarchyLocked': 'The hierarchy is locked by %user%',
            'sentForApproval': 'Hierarchy successfully has been sent for approval.',
            'unableToEditCalculations': 'Unable to edit Calculations.'
        }
    };

    state = {
        selectedDimension: "",
        selectedGroup: "",
        showFooter: false,
        displaySearchInput: true,
        isLoading: false,
        isLocked: false,
        lockedBy: null,
        isLockedByCurrentUser: false,
        isCommentsAvailable: false,
        hasEditPermissions: true,

        approvalId: null,
        approvalComments: [],
        notification: {
            show: false,
            message:  null
        }
    };

    get emptyState() {
        return {
            hasChanged: false,
            enableEdit: false,
            enableMembers: true,
            enablePushedMembers: false,
            enableCalculations: false,
            enableSearch: false,
            showConfirmAndLock: false,
            showValidationError: false,
            validationError: '',
            focusedOn: null, //"tree", "grid"

            hierarchyAttributes: [],
            filteredViews: [],
            members: [],
            unusedMembers: [],
            pushedMembers: [],
            searchMembers: [],
            /* movements */
            moveRightSingle: false,
            moveRightAll: false,
            moveLeftSingle: false,
            moveLeftAll: false,
            moveToCalculations: false,

            cut: false,
            cutted: [],
            pasteActionName: null,
            undoCut: false,
            paste: false,
            remove: false,
            rename: false,
            /* action logs */
            deleted: [],
            inserted: [],
            renamed: [],
            moved: [],
            merged: [],

            /*comment area validation */
            isValidComment: true
        };
    };

    componentWillMount() {
        this.setState(this.emptyState);
    };

    shouldComponentUpdate(nextProps, nextState) {
        let shouldUpdate = this.state !== nextState;
        _.each(['dimensionEditor', 'groups', 'hierarchyAttributes', 'changes', 'calculatedMembers', 'members'], name => {
            shouldUpdate = this.props[name] !== nextProps[name] || shouldUpdate;
        });
        return shouldUpdate;
    };

    componentWillReceiveProps(nextProps) {
        let nextState = {};

        if (nextProps.views !== this.props.views) {
            nextState.filteredViews = nextProps.views.data;
        }

        if (nextProps.hierarchyStatus !== this.props.hierarchyStatus) {
            const statusData = nextProps.hierarchyStatus.data;
            const approvalStatus = parseInt(statusData.approvalStatus, 10);
            nextState = {
                ...nextState,
                ...statusData,
                hasEditPermissions: isNaN(approvalStatus) || approvalStatus === bouncedBackStatus, // NaN - means wasn't sent for approve, bouncedBackStatus = 3 - means "bounced back"
                isCommentsAvailable: !!statusData.approvalId
            };
        }

        if (nextProps.members && nextProps.members.data && nextProps.members !== this.props.members) {
            nextState.members = [...nextProps.members.data];
        }

        if (nextProps.unusedMembers && nextProps.unusedMembers.data && nextProps.unusedMembers !== this.props.unusedMembers) {
            nextState.unusedMembers = [...nextProps.unusedMembers.data];
        }

        if (nextProps.hierarchyAttributes &&
            nextProps.hierarchyAttributes.data &&
            nextProps.hierarchyAttributes !== this.props.hierarchyAttributes) {
            nextState.hierarchyAttributes = [...nextProps.hierarchyAttributes.data];
        }

        if (!_.isEmpty(nextState)) {
            this.onFormChanged(nextState);
        }
    };

    componentWillUnmount() {
        this.props.notify({content: '', type: ''});
    }

    onFormChanged = (changedState, callback) => {
        const state = this.state;
        const nextState = {
            ...state,
            ...changedState
        };
        const {isLocked, lockedBy} = nextState;
        const isLockedByCurrentUser = isLocked && lockedBy === this.props.userInfo.domainUserName;
        const movementVisibility = this.getMovementVisibility(isLockedByCurrentUser, isLocked, nextState);
        const editVisibility = this.getEditVisibility(nextState);

        this.setState({
            ...changedState,
            ...movementVisibility,
            ...editVisibility,
            isLocked,
            isLockedByCurrentUser,
            showFooter: nextState.hasEditPermissions && isLockedByCurrentUser && !nextState.enableCalculations
        }, callback);
    };

    getMovementVisibility = (isLockedByCurrentUser, isLocked, nextState) => {
        const movable = nextState.hasEditPermissions && (!isLocked || isLockedByCurrentUser);

        let grid = this.unusedRef;

        if (nextState.enablePushedMembers) {
            grid = this.pushedRef;
        } else if (nextState.enableSearch) {
            grid = this.searchRef;
        }

        const gridMembers = grid && grid.getSelectedState();
        const treeMembers = this.memberRef && this.memberRef.getSelectedState();
        const isDistinctTreeMembers = !_.isEmpty(treeMembers) && _.size(treeMembers) === 1;

        return {
            moveRightAll: movable && !_.isEmpty(treeMembers),
            moveRightSingle: movable && !_.isEmpty(treeMembers),
            moveLeftSingle: movable && !_.isEmpty(gridMembers) && (isDistinctTreeMembers || nextState.enablePushedMembers),
            moveLeftAll: movable && !_.isEmpty(nextState.pushedMembers) && nextState.enablePushedMembers,
            moveToCalculations: movable && !_.isEmpty(treeMembers) && _.size(treeMembers) === 1
        };
    };

    getEditVisibility = (nextState) => {
        const {enablePushedMembers, enableSearch, hasEditPermissions} = nextState;
        let grid = this.unusedRef;

        if (enablePushedMembers) {
            grid = this.pushedRef;
        } else if (enableSearch) {
            grid = this.searchRef;
        }

        const gridMembers = grid && grid.getSelectedState();
        const treeMembers = this.memberRef && this.memberRef.getSelectedState();
        const notEmptyGrid = nextState.focusedOn === 'grid' && !_.isEmpty(gridMembers);
        const isFocusedOnSearchGrid = nextState.focusedOn === 'grid' && enableSearch;
        const notEmptyTree = nextState.focusedOn === 'tree' && !_.isEmpty(treeMembers);
        const isDistinctTreeMembers = notEmptyTree && _.size(treeMembers) === 1;
        const isDistinctGridMembers = notEmptyGrid && _.size(gridMembers) === 1;

        return hasEditPermissions ? {
            cut: _.isEmpty(nextState.cutted) && ((!isFocusedOnSearchGrid && notEmptyGrid) || notEmptyTree),
            undoCut: !_.isEmpty(nextState.cutted),
            paste: !_.isEmpty(treeMembers) && !_.isEmpty(nextState.cutted),
            remove: notEmptyTree || ((enablePushedMembers || enableSearch) && notEmptyGrid),
            rename: isDistinctTreeMembers || isDistinctGridMembers,
            mergeMembers: !_.isEmpty(treeMembers),
            editAttributes: !_.isEmpty(gridMembers) || !_.isEmpty(treeMembers)
        } : {
            cut: false,
            undoCut: false,
            paste: false,
            remove: false,
            rename: false,
            mergeMembers: false,
            editAttributes: false
        };
    };

    getFocusedSource = () => {
        const {enablePushedMembers, enableSearch, focusedOn} = this.state;

        let grid = this.unusedRef;
        let gridPropName = 'unusedMembers';

        if (enablePushedMembers) {
            grid = this.pushedRef;
            gridPropName = 'pushedMembers';
        } else if (enableSearch) {
            grid = this.searchRef;
            gridPropName = null;
        }

        const gridMembers = grid && grid.getSelectedState();
        const treeMembers = this.memberRef && _.values(this.memberRef.getSelectedState());

        const srcAffected = {
            "grid": grid,
            "tree": this.memberRef
        }[focusedOn];

        const srcItems = {
            "grid": gridMembers,
            "tree": treeMembers
        }[focusedOn];

        return {focusedOn, srcAffected, srcItems, gridMembers, treeMembers, gridPropName};
    };

    discardChanges = callback => {
        const {members, originMembersList, unusedMembers} = this.props;
        const {approvalStatus, filteredViews, hierarchyAttributes} = this.state;
        const membersList = approvalStatus === bouncedBackStatus && originMembersList && originMembersList.data ? originMembersList.data : members.data;
        this.setState({
            ...this.emptyState,
            members: [...membersList],
            unusedMembers: [...unusedMembers.data],
            filteredViews: [...filteredViews],
            hierarchyAttributes: [...hierarchyAttributes]
        }, () => {
            this.memberRef.resetAllSearchState();
            async.parallel([
                this.memberRef.discardChanges.bind(this.memberRef),
                this.unusedRef ? this.unusedRef.discardChanges.bind(this.unusedRef) : null
            ], callback);
        });
    };

    onDiscardConfirmHandler = () => {
        const {onDiscardConfirmHandler} = this.state;
        this.discardChanges(onDiscardConfirmHandler);
    };

    confirmToDiscardChanges = onConfirmed => {
        const {hasChanged} = this.state;
        return hasChanged ? this.onFormChanged({
            showDiscardChanges: true,
            onDiscardConfirmHandler: onConfirmed
        }) : onConfirmed();
    };

    onDimensionEditorNameChange = (selected) => {
        this.confirmToDiscardChanges(() => {
            this.memberRef.resetAllSearchState();
            this.props
                .getGroupsList({dimensionName: selected.label})
                .then(res => this.onFormChanged({isLoading: false}));
            this.onFormChanged({
                ...this.emptyState,
                selectedDimension: selected,
                isCommentsAvailable: false,
                selectedGroup: "",
                isLocked: false,
                isLoading: true,
                lockedBy: null,
                approvalId: null,
                approvalComments: [],
                isLockedByCurrentUser: false
            }, () => {
                this.defineLocked({
                    dimensionName: selected.label,
                    groupId: null
                });
            });
        });
    };

    defineLocked = ({groupId, dimensionName}) => {
        if (!groupId || !dimensionName) {
            this.onFormChanged({isLocked: false});
            return;
        }

        return this.props.getLock({groupId, dimensionName});
    };

    onGroupNameChange = (selected) => {
        this.confirmToDiscardChanges(() => {

            this.memberRef.resetAllSearchState();
            this.onFormChanged({
                ...this.emptyState,
                selectedGroup: selected,
                isLocked: false,
                lockedBy: null,
                isLoading: true,
                approvalId: null,
                approvalComments: [],
                isLockedByCurrentUser: false
            }, () => {
                this.loadHierarchy()
                    .then(this.onFormChanged.bind(this, {isLoading: false}, undefined));
            });

        });
    };

    loadHierarchy = () => {
        const reqData = {
            dimensionName: this.state.selectedDimension.label,
            groupId: this.state.selectedGroup.value,
            groupName: this.state.selectedGroup.label
        };
        return Promise
            .all([
                this.props.getLock(reqData)
                    .then(({data, err}) => this.loadMembers(data)),
                this.props.getViews(
                    reqData.dimensionName,
                    reqData.groupName
                ),
                this.props.getUnusedMembersList(reqData),
                this.props.getHierarchyAttributes(
                    reqData.dimensionName,
                    reqData.groupName
                )
            ]);
    };

    loadMembers = lockData => {
        const {selectedDimension, selectedGroup} = this.state;
        if (parseInt(lockData.approvalStatus, 10) === bouncedBackStatus) {
            this.props.getOriginMembersList({
                dimensionName: selectedDimension.label,
                groupId: selectedGroup.value
            });
        } else {
            this.props.originMembers({
                data: [],
                err: null
            });
        }
        return this.props.getMembersList({
            dimensionName: selectedDimension.label,
            groupId: selectedGroup.value,
            approvalId: lockData.approvalId || null
        });
    };

    refreshHierarchy = event => {
        event.preventDefault();
        this.onFormChanged({isLoading: true}, () => {
            this.loadHierarchy()
                .then(this.onFormChanged.bind(this, {isLoading: false}, undefined));
        });
    };

    showEditor = (show) => {
        const {isLocked, isLockedByCurrentUser} = this.state;
        const enableEdit = show === null ? !this.state.enableEdit : !!show;
        const nextState = {
            enableEdit,
            enableMembers: true,
            enablePushedMembers: false,
            enableSearch: false,
            displaySearchInput: true,
            enableCalculations: enableEdit ? false : this.state.enableCalculations,
            showFooter: enableEdit
        };

        if (isLocked && !isLockedByCurrentUser) {
            return;
        }

        if (!isLocked) {
            this.setLock(true, isLocked => {
                isLocked && this.onFormChanged(nextState);
            });
            return;
        }

        this.onFormChanged(nextState);
    };

    cancelUnLock = event => {
        event.preventDefault();
        this.discardChanges(() => {
            this.showEditor(false);
            if (this.state.approvalId) {
                this.cancelApproval();
            } else {
                this.setLock(false);
            }
        });
    };

    cancelApproval = () => {
        const {selectedDimension, selectedGroup, approvalId} = this.state;
        this.onFormChanged({isLoading: true});
        this.props.cancelApproval({
            approvalId,
            dimensionName: selectedDimension.label,
            groupId: selectedGroup.value
        }).then(() => {
            this.props.getLock({
                    dimensionName: selectedDimension.label,
                    groupId: selectedGroup.value
                })
                .then(({data, err}) => this.loadMembers(data))
                .then(() => this.onFormChanged({isLoading: false}));
        }).catch(err => {
            this.props.notify({
                content: err,
                type: 'server-error'
            });
            this.onFormChanged({isLoading: false});
        });
    };

    onCalculationsClick = () => {
        const {isLocked, isLockedByCurrentUser} = this.state;
        const {messages} = this.props;

        if (isLocked && !isLockedByCurrentUser) {
            this.onFormChanged({
                notification: {show: true, message: messages.unableToEditCalculations, title: 'Edit Calculations'}
            });
            return;
        }

        if (!isLocked) {
            this.setLock(true, isLocked => {
                isLocked && this.toggleCalculations();
            });
            return;
        }

        this.toggleCalculations();
    };

    toggleCalculations = () => {
        const enableCalculations = !this.state.enableCalculations;
        this.memberRef.clearSelected(this.onFormChanged({
            enableCalculations,
            enableMembers: !enableCalculations,
            enablePushedMembers: false,
            displaySearchInput: true,
            enableEdit: enableCalculations ? false : this.state.enableEdit,
            enableSearch: false
        }));
    };

    resetTreeSearchState = () => {
        this.onFormChanged({searchMembers: []});
        this.memberRef.resetTreeSearch();
    };

    onTreeSearch = (filteredData) => {
        this.onFormChanged({searchMembers: filteredData});
        this.memberRef.applySearchHighlight(filteredData, false);
    };

    onSearchClick = () => {
        const enableSearch = !this.state.enableSearch;
        const enableSearchInput = !this.state.displaySearchInput;

        let nextState = {
            enableSearch,
            displaySearchInput: enableSearchInput,
            enableMembers: !enableSearch,
            enablePushedMembers: false,
            enableCalculations: false
        };

        this.onFormChanged(nextState, () => {
            this.editPanelRef.resetSearchAttributes();
            this.memberRef.resetAllSearchState();
        });
    };

    saveNewMember = (data) => {
        return this.props.createUnused(data);
    };

    saveNewAttribute = (data) => {
        const reqData = {
            ...data,
            dimensionName: this.state.selectedDimension.label,
            groupName: this.state.selectedGroup.label
        };
        return this.props.addNewAttribute(reqData);
    };

    onAttributesUpdate = (data, isUnused) => {
        const {updateUnusedAttributes, updateHierarchyAttributes} = this.props;
        let reqData = {};

        if (isUnused) {
            reqData.dimensionMembers = data
        } else {
            reqData = {...data};
        }

        reqData = {
            ...reqData,
            dimensionName: this.state.selectedDimension.label,
            groupId: this.state.selectedGroup.value
        };

        const resultPromise = isUnused ? updateUnusedAttributes(reqData) : updateHierarchyAttributes(reqData);
        return resultPromise.then(this.onAfterAttributesUpdate);
    };

    onAfterAttributesUpdate = (res) => {
        const {err, isValid} = res;
        const isValidFormat = isValid !== undefined ? isValid : true;
        if (err || !isValidFormat) {
            return res;
        }

        this.getFocusedSource().srcAffected.clearSelected();
        this.props.notify({
            content: 'Attribute values were successfully updated.',
            type: 'success'
        });

        return res;
    };

    saveModifiedAttributes = (data) => {
        const reqData = {
            ...data,
            dimensionName: this.state.selectedDimension.label,
            groupName: this.state.selectedGroup.label
        };

        return this.props.saveModifiedAttributes(reqData).then(err => {
            !err && this.updateMembersModifiedAttrs(reqData);
            return err;
        });
    };

    updateMembersModifiedAttrs = (data) => {
        const {oldAttributes, newAttributes} = data;
        const members = this.props.members;
        let hierarchy = [];
        let attributeMappings = _.keyBy(newAttributes, item => item.id);

        _.each(oldAttributes, value => {
            if (attributeMappings[value.id]) {
                const currentAttributeMapping = attributeMappings[value.id];
                attributeMappings[value.id] = {
                    ...currentAttributeMapping,
                    oldName: value.name
                }
            }
        });

        attributeMappings = _.values(attributeMappings);

        for (let i = 0, len = members.data.length; i < len; i++) {
            const currentMember = members.data[i];
            const member = {
                ...currentMember,
                attributeValues: [...currentMember.attributeValues]
            };

            member.attributeValues.forEach(attribute => {
                let {attributeName} = attribute;
                const isUpdated = _.find(attributeMappings, item => item.oldName === attributeName);

                if (isUpdated) {
                    attribute.attributeName = isUpdated.name;
                }
            });

            hierarchy.push(member);
        }

        this.props.updateHierarchyModifiedAttributes({
            data: hierarchy,
            err: null
        });
    };

    setLock = (isLocked, callback) => {
        this.onFormChanged({isLoading: true});

        this.props
            .setLock({
                dimensionName: this.state.selectedDimension.label,
                groupId: this.state.selectedGroup.value,
                sendMail: true,
                isLocked,
                lockedBy: this.props.userInfo.domainUserName
            })
            .then((err) => {

                if (err) {
                    this.props.notify({
                        content: err,
                        type: 'server-error'
                    });
                    callback && callback(false);
                    this.onFormChanged({isLoading: false});
                    return;
                }

                this.defineLocked({
                    groupId: this.state.selectedGroup.value,
                    dimensionName: this.state.selectedDimension.label
                }).then(({data}) => {
                    callback && callback(data && data.isLocked);
                    this.onFormChanged({isLoading: false});
                });
            });
    };

    toggleMembersGrid = (event) => {
        event.preventDefault();
        const enablePushedMembers = !this.state.enablePushedMembers;
        const membersGrid = enablePushedMembers ? this.unusedRef : this.pushedRef;
        const nextState = {
            enablePushedMembers,
            enableMembers: !enablePushedMembers,
            enableCalculations: false,
            enableSearch: false,
            displaySearchInput: true
        };
        return membersGrid ? membersGrid.clearSelected(this.onFormChanged.bind(this, nextState)) : this.onFormChanged(nextState);
    };

    validateMergeMembers = (data) => {
        const reqData = {
            ...data,
            dimensionName: this.state.selectedDimension.label,
            groupId: this.state.selectedGroup.value
        };

        return this.props
            .validateMergeMembers(reqData)
            .then((res) => this.onMergeRequest(res, reqData));
    };

    onMergeRequest = (res, reqData) => {

        if (!res.isValid){
            return res;
        }

        let membersToDelete = [];

        _.each(reqData.mergedMember.sourceIds, (sourceId) => {
            const oldHierarchyEntry = reqData.oldHierarchy[sourceId];

            if (oldHierarchyEntry) {
                membersToDelete.push(oldHierarchyEntry);
                const childs = oldHierarchyEntry.childs;
                childs && childs.length && this.getChildForDeletion(childs, membersToDelete, reqData.oldHierarchy);
            }

        });

        const withoutDeleted = this.withoutBy(reqData.oldHierarchy, membersToDelete, 'id');

        this.memberRef.clearSelected(this.onFormChanged.bind(this, {
            merged: this.state.merged.concat(reqData.mergedMember),
            hasChanged: true,
            members: withoutDeleted
        }));

        this.props.notify({
            content: 'Successfully merged.',
            type: 'success'
        });

        return res;
    };

    getChildForDeletion = (childs, list, source) => {

        _.each(childs, (id) => {
            const oldHierarchyEntry = source[id];

            if (oldHierarchyEntry) {
                list.push(oldHierarchyEntry);
                const childs = oldHierarchyEntry.childs;
                childs && childs.length && this.getChildForDeletion(childs, list, source);
            }
        });

    };

    transferTreeMembers = (srcItem, dstItem) => {
        let members = [...this.state.members];
        members = this.withoutBy(members, [dstItem], 'id');
        members.push({
            ...dstItem,
            parentId: srcItem.id
        });

        this.onFormChanged({
            members,
            hasChanged: true
        }, () => {
            this.memberRef.highlightItems([dstItem], 'moved');
        });
    };

    moveDroppedMembers = (srcData, dstData) => {
        const {sourceName, item} = dstData;
        if (sourceName === 'regular') {
            return this.transferTreeMembers(srcData, item);
        }
        const newMember = item;
        let members = [...this.state.members];
        let unusedMembers = [...this.state.unusedMembers];

        members.push({
            ...newMember,
            parentId: srcData.id
        });

        this.onFormChanged({
            members,
            unusedMembers: this.withoutBy(unusedMembers, [newMember], 'id'),
            hasChanged: true
        }, () => {
            this.memberRef.highlightItems([newMember], 'inserted');
        });
    };

    moveSelectedMembers = (direction, part, command) => {
        if (!this.state.isLocked) {
            this.onFormChanged({showConfirmAndLock: true});
            return;
        }

        /* define src data */
        const gridSrc = this.state.enablePushedMembers ? this.pushedRef : this.unusedRef;
        const treeSrc = this.memberRef;

        const gridSrcItems = {
            "selected": gridSrc.getSelectedState(),
            "all": gridSrc.getTableData()
        }[part];

        const treeSrcItems = {
            "selected": _.values(treeSrc.getSelectedState()),
            "all": _.values(treeSrc.getSelectedDescendants())
        }[part];

        const srcItems = {
            "left": gridSrcItems,
            "right": treeSrcItems
        }[direction];

        const affectedSrc = {
            "left": treeSrc,
            "right": gridSrc
        }[direction];

        /* define dst data */
        let gridPropName = this.state.enablePushedMembers ? 'pushedMembers' : 'unusedMembers';
        let gridDst = [...this.state[gridPropName]];
        let treeDst = [...this.state.members];

        let removeFrom = {
            "left-remove": gridDst,
            "left-cut": gridDst,
            "right-copy": []
        }[`${direction}-${command}`];

        let addTo = {
            "left-remove": [],
            "left-cut": treeDst,
            "right-copy": gridDst
        }[`${direction}-${command}`];

        /* remove "srcItems" from "removeFrom" and add them into "addTo" */

        /*add*/
        let inserted = [];
        if (command !== 'remove') {
            _.each(srcItems, item => {
                let parent = _.first(treeSrcItems);
                inserted.push({
                    ...item,
                    parentName: parent.name,
                    parentCode: parent.code
                });
                addTo.push({
                    ...item,
                    parentId: parent && parent.id
                });
            });
        }

        /* remove */
        _.pullAllBy(removeFrom, srcItems, 'id');

        /* define state object */
        let nextState = {
            hasChanged: true,
            [gridPropName]: _.uniqBy(gridDst, 'id'),
            members: _.uniqBy(treeDst, 'id'),
            inserted: _.uniqBy(_.concat(inserted, this.state.inserted), 'id')
        };

        /* clear selected and set props */
        async.parallel([
            gridSrc.clearSelected.bind(gridSrc),
            treeSrc.clearSelected.bind(treeSrc)
        ], this.onFormChanged.bind(this, nextState, () => {
            command !== 'remove' && affectedSrc.highlightItems(srcItems, 'inserted');
        }));
    };

    withoutBy = (items, withoutItems, by) => {
        return _.filter(items, item => !_.find(withoutItems, {[by]: item[by]}));
    };

    onCut = event => {
        event.preventDefault();
        const {srcAffected, srcItems} = this.getFocusedSource();
        const {enablePushedMembers, focusedOn} = this.state;

        async.waterfall([
            srcAffected.clearSelected.bind(srcAffected),
            srcAffected.highlightItems.bind(srcAffected, srcItems, 'cutted'),
            this.onFormChanged.bind(this, {
                cutted: _.uniqBy(_.concat(this.state.cutted, srcItems), 'id'),
                pasteActionName: (enablePushedMembers && focusedOn === 'grid') || focusedOn === 'tree' ? 'moved' : 'inserted'
            })
        ]);
    };

    onUndoCut = event => {
        event.preventDefault();
        const {srcAffected} = this.getFocusedSource();

        async.waterfall([
            srcAffected.highlightItems.bind(srcAffected, this.state.cutted, 'none'),
            this.onFormChanged.bind(this, {cutted: [], pasteActionName: null})
        ]);
    };

    onPaste = type => {
        const {srcAffected, treeMembers, gridPropName} = this.getFocusedSource();
        const parent = _.first(treeMembers);
        const {cutted, inserted, moved, members, pasteActionName} = this.state;
        const treeData = this.memberRef.getTreeDataState();
        const actionLog = {inserted, moved}[pasteActionName];
        const parentId = {
            "sibling": parent && parent.parentId,
            "child": parent && parent.id
        }[type];
        const newParent = treeData[parentId];
        let pasted = [];

        _.each(cutted, item => {
            const oldParent = treeData[item.id];
            pasted.push({
                ...item,
                parentName: newParent && newParent.name,
                parentCode: newParent && newParent.code,
                oldParentName: oldParent && oldParent.name,
                oldParentCode: oldParent && oldParent.code,
                parentId
            });
        });

        const nextState = {
            hasChanged: true,
            [pasteActionName]: _.uniqBy(_.concat(actionLog, pasted), 'id'),
            cutted: [],
            pasteActionName: null,
            members: _.uniqBy(_.concat(pasted, members), 'id'),
            [gridPropName]: this.withoutBy(this.state[gridPropName], cutted, 'id')
        };

        async.waterfall([
            this.memberRef.clearSelected.bind(this.memberRef),
            this.onFormChanged.bind(this, nextState),
            srcAffected.highlightItems.bind(srcAffected, pasted, pasteActionName)
        ]);
    };

    onRemove = () => {
        const {srcItems, srcAffected} = this.getFocusedSource();
        const {members, pushedMembers, unusedMembers, deleted, enableSearch, searchMembers} = this.state;
        const treeData = this.memberRef.getTreeDataState();
        let toRemove = [];

        _.each(srcItems, item => {
            const parent = treeData[item.parentId];
            toRemove.push({
                ...item,
                oldParentName: parent && parent.name,
                oldParentCode: parent && parent.code
            });
            _.each(this.memberRef.getChild(item), child => {
                const parent = treeData[child.parentId];
                toRemove.push({
                    ...child,
                    oldParentName: parent && parent.name,
                    oldParentCode: parent && parent.code
                });
            });
        });

        srcAffected.clearSelected();
        this.onFormChanged({
            hasChanged: true,
            members: this.withoutBy(members, toRemove, 'id'),
            unusedMembers: _.uniqBy(_.concat(toRemove, unusedMembers), 'id'),
            pushedMembers: this.withoutBy(pushedMembers, toRemove, 'id'),
            searchMembers: enableSearch ? this.withoutBy(searchMembers, toRemove, 'id') : [],
            deleted: _.uniqBy(_.concat(toRemove, deleted), 'id')
        }, () => {
            this.unusedRef && this.unusedRef.highlightItems(toRemove, 'inserted');
            enableSearch && this.memberRef.applySearchHighlight(this.state.searchMembers, false);
        });
    };

    onRename = newNames => {
        const {enablePushedMembers, focusedOn, renamed, enableSearch} = this.state;
        const shouldRenamePushedGridAndTree = (enablePushedMembers && focusedOn === 'grid') || focusedOn === 'tree';
        const membersData = {
            members: [...this.state.members],
            pushedMembers: [...this.state.pushedMembers],
            unusedMembers: [...this.state.unusedMembers],
            searchMembers: [...this.state.searchMembers]
        };

        let sources = {
            unusedMembers: membersData.unusedMembers
        };

        if (shouldRenamePushedGridAndTree || enableSearch) {
            sources = {
                members: membersData.members,
                pushedMembers: membersData.pushedMembers,
                searchMembers: membersData.searchMembers
            };
        }

        let toRename = [];
        let toRenameUnused = [];
        let nextState = {hasChanged: true};

        _.each(sources, (src, srcName) => {
            const member = membersData[srcName];
            _.each(newNames, newName => {
                const index = _.findIndex(src, {id: parseInt(newName.id, 10)});
                const memberItem = member[index];
                if (memberItem) {
                    const renamedMember = {
                        ...memberItem,
                        name: newName.name
                    };
                    member[index] = renamedMember;
                    toRenameUnused.push(renamedMember);
                }
                if ((shouldRenamePushedGridAndTree || enableSearch) && memberItem) {
                    toRename.push({
                        ...memberItem,
                        name: newName.name,
                        code: memberItem.code,
                        oldName: memberItem.name,
                        oldCode: memberItem.code
                    });
                }
            });
            nextState[srcName]= member;
        });

        nextState.renamed = _.uniqBy(_.concat(toRename, renamed), 'id');

        if (shouldRenamePushedGridAndTree) {
            async.waterfall([
                this.memberRef.clearSelected.bind(this.memberRef),
                this.pushedRef ? this.pushedRef.clearSelected.bind(this.pushedRef) : done => done(),
                this.memberRef.highlightItems.bind(this.memberRef, toRename, 'renamed'),
                this.pushedRef ? this.pushedRef.highlightItems.bind(this.pushedRef, toRename, 'renamed') : done => done(),
                this.onFormChanged.bind(this, nextState)
            ]);
        } else if (enableSearch) {
            async.waterfall([
                this.memberRef.clearSelected.bind(this.memberRef),
                this.memberRef.highlightItems.bind(this.memberRef, toRename, 'renamed'),
                this.searchRef ? this.searchRef.highlightItems.bind(this.searchRef, toRename, 'renamed') : done => done(),
                this.onFormChanged.bind(this, nextState)
            ]);
        } else {
            this.onFormChanged({isLoading: true});
            let toRequest = _.first(toRenameUnused);
            this.props
                .updateUnused({
                    "dimensionName": this.state.selectedDimension.label,
                    "name": toRequest.name,
                    "id": toRequest.id,
                    "groupId": this.state.selectedGroup.value
                })
                .then(() => {
                    async.waterfall([
                        this.unusedRef.clearSelected.bind(this.unusedRef),
                        this.unusedRef.highlightItems.bind(this.unusedRef, toRenameUnused, 'renamed'),
                        this.onFormChanged.bind(this, {...nextState, isLoading: false})
                    ]);
                })
                .catch(err => {
                    this.onFormChanged({isLoading: false});
                    this.props.notify({
                        content: err,
                        type: 'server-error'
                    });
                });
        }
    };

    getChanges = () => {
        return this.props.getChanges({
            oldHierarchy: this.state.approvalStatus === bouncedBackStatus ? this.props.originMembersList.data : this.props.members.data,
            newHierarchy: this.state.members,
            mergedMembers: this.state.merged,
            groupId: this.state.selectedGroup.value,
            dimensionName: this.state.selectedDimension.label
        });
    };

    onApprove = reviewComment => {

        const comment = reviewComment || (this.commentsRef ? this.commentsRef.getNewComments() : null);

        if (this.state.approvalId && !comment) {
            return this.onFormChanged({isValidComment: false});
        }

        this.onFormChanged({
            isLoading: true,
            isValidComment: true
        });
        this.props.approve({
            oldHierarchy: this.state.approvalStatus === bouncedBackStatus ? this.props.originMembersList.data : this.props.members.data,
            newHierarchy: this.state.members,
            mergedMembers: this.state.merged,
            dimensionName: this.state.selectedDimension.label,
            groupId: this.state.selectedGroup.value,
            approvalId: this.state.approvalId,
            isValidationIgnored: false,
            comment
        }).then(({data}) => {
            if (data.isValid) {
                this.sentForApprovalSuccessfully();
            } else {
                this.onFormChanged({
                    validationError: data.validationError,
                    showValidationError: true,
                    isLoading: false
                }, () => {
                    let invalids = [];
                    _.each(data.invalidMemberIds || [], id => invalids.push({id}));
                    this.memberRef.highlightItems(invalids, 'invalid');
                });
            }
        }).catch(err => {
            this.onFormChanged({isLoading: false});
            this.props.notify({
                content: err,
                type: 'server-error'
            });
        });
    };

    sentForApprovalSuccessfully = () => {
        Promise
            .all([
                this.props.getLock({
                    groupId: this.state.selectedGroup.value,
                    dimensionName: this.state.selectedDimension.label
                }),
                this.props.getPendingApprovals()
            ])
            .then(() => {
                this.onFormChanged({
                    enableEdit: false,
                    hasChanged: false,
                    enableMembers: true,
                    enablePushedMembers: false,
                    enableCalculations: false,
                    enableSearch: false,
                    isLoading: false
                });
                this.props.notify({
                    content: this.props.messages.sentForApproval,
                    type: 'success'
                });
            });
    };

    moveSelectedMembersIntoCalculation = event => {
        event.preventDefault();
        const selectedMembers = _.values(this.memberRef.getSelectedState());
        this.calculationRef.addMemberToFormula(_.first(selectedMembers), 'regular');
    };

    render() {
        this.renderCountTimes = this.renderCountTimes || 0;
        this.renderCountTimes += 1;
        console.info(`"Hierarchy edit page" rendered ${this.renderCountTimes} times`);

        const {dimensionEditor, groups, userInfo, enableDragPreview, originMembersList} = this.props;
        const {
            members, unusedMembers, pushedMembers, searchMembers,
            hasChanged,enableEdit, enableMembers, enablePushedMembers, enableCalculations, enableSearch,
            selectedDimension, selectedGroup, filteredViews, isLockedByCurrentUser, isLocked, lockedBy,
            approvalStatusName, approvalStatus,
            moveRightSingle, moveRightAll, moveLeftSingle, moveLeftAll, mergeMembers, editAttributes,
            validationError, moveToCalculations, isLoading
            } = this.state;
        /* edit props */
        const {cut, undoCut, paste, remove, rename, notification, hasEditPermissions} = this.state;

        const showButtons = hasEditPermissions && selectedDimension && selectedGroup && (!isLocked || isLockedByCurrentUser);
        const enabledDnD = hasEditPermissions && selectedDimension && selectedGroup && isLockedByCurrentUser;
        const showCalculations = hasEditPermissions && selectedDimension && selectedGroup && (!isLocked || isLockedByCurrentUser) && selectedDimension.label.toLowerCase() === 'account';

        const isBouncedBack = approvalStatus === bouncedBackStatus;
        const isNotEmptyOriginMembers = originMembersList && !_.isEmpty(originMembersList.data);
        const enableReviewChanges = (isBouncedBack && isNotEmptyOriginMembers) || hasChanged;
        const enableApprove = (isBouncedBack && isNotEmptyOriginMembers) || hasChanged;
        const enableDiscardChanges = (isBouncedBack && isNotEmptyOriginMembers) || hasChanged;

        return (
            <div className="hierarchy-editor">
                <Loading show={isLoading || !dimensionEditor}/>
                <div className={cx("hierarchy-editor-wrapper", {
                    "has-footer": this.state.showFooter
                })}>
                    {/* popups */}
                    <ConfirmAndLock
                        show={this.state.showConfirmAndLock}
                        onConfirm={() => this.setLock(true)}
                        onHide={() => this.onFormChanged({showConfirmAndLock: false})}
                    />
                    <ValidationErrorOccurred show={this.state.showValidationError}
                                             onHide={() => this.onFormChanged({showValidationError: false})}
                                             validationError={validationError}
                    />
                    <ConfirmDiscardChanges show={this.state.showDiscardChanges}
                                           onHide={() => this.onFormChanged({showDiscardChanges: false})}
                                           onConfirm={this.onDiscardConfirmHandler}
                    />
                    <NotificationPopup show={notification.show}
                                       message={notification.message}
                                       title={notification.title}
                                       onHide={() => this.onFormChanged({notification: {show: false, message: null}})}
                    />
                    <h3>Load Hierarchy</h3>
                    <Button className="refresh btn-dark btn-icon btn-round"
                            disabled={!selectedGroup}
                            onClick={this.refreshHierarchy}
                    >
                        <span className="icon-round"/>
                    </Button>
                    {isLocked && <span className="locked-info-lbl">
                                    <span className="icon-lock"/>
                        {`The hierarchy is locked by ${lockedBy}.`}
                        {approvalStatusName && ` Approval status: "${approvalStatusName}".`}
                    </span>}
                    <div className="container-row">
                        <div className="container-blue">
                            <div className="container-column">
                                <FormGroup
                                    controlId="dimensionHierarchyName">
                                    <ControlLabel>Dimension</ControlLabel>
                                    <Select name="dimensionHierarchyName"
                                            value={this.state.selectedDimension.value}
                                            placeholder="Select Dimension"
                                            options={dimensionEditor && dimensionEditor.data.length ? dimensionEditor.data.map(option => ({
                                                value: option.id,
                                                label: option.name
                                            })) : []}
                                            onChange={this.onDimensionEditorNameChange}
                                    />
                                </FormGroup>

                                <FormGroup
                                    controlId="groupHierarchy">
                                    <ControlLabel>Group</ControlLabel>
                                    <Select name="groupHierarchy"
                                            placeholder="Select Group"
                                            value={this.state.selectedGroup.value}
                                            options={groups && groups.data.length ? groups.data.map(option => ({
                                                value: option.id,
                                                label: option.name
                                            })) : []}
                                            onChange={this.onGroupNameChange}
                                    />
                                </FormGroup>
                            </div>

                            <div className="container-column">
                                <label className="control-label">Affected Views</label>
                                <TagList tags={filteredViews}
                                         labelKey="viewName"/>
                            </div>
                        </div>

                        <div className="container-blue">
                            <div className="container-btns-flex">
                                <Button className={cx("btn-white-huge btn-icon", {"is-active": enableEdit})}
                                        onClick={() => this.showEditor(null)}
                                        disabled={!showButtons}>
                                    <span className="icon-edit-big icon"/>
                                    <span className="btn-text">Edit Hierarchy</span>
                                </Button>
                                <Button disabled={!showCalculations}
                                        onClick={this.onCalculationsClick}
                                        className={cx("btn-white-huge btn-icon", {"is-active": enableCalculations})}>
                                    <span className="icon-check-big icon"/>
                                    <span className="btn-text">Calculations</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Edit block  TODO: apply own tree selected*/}
                    {enableEdit &&
                    <Edit visibility={{cut, undoCut, paste, remove, rename, mergeMembers, editAttributes}}
                          ref={edit => this.editPanelRef = edit}
                          notify={this.props.notify}
                          members={this.state.members}
                          getFocusedSource={this.getFocusedSource}
                          onSearchClick={this.onSearchClick}
                          selectedDimension={this.state.selectedDimension}
                          selectedGroup={this.state.selectedGroup}
                          hierarchyAttributes={this.state.hierarchyAttributes}
                          onTreeSearch={this.onTreeSearch}
                          resetTreeSearchState={this.resetTreeSearchState}
                          validateMergeMembers={this.validateMergeMembers}
                          saveNewAttribute={this.saveNewAttribute}
                          onAttributesUpdate={this.onAttributesUpdate}
                          saveModifiedAttributes={this.saveModifiedAttributes}
                          onCut={this.onCut}
                          onUndoCut={this.onUndoCut}
                          onPaste={this.onPaste}
                          onRemove={this.onRemove}
                          onRename={this.onRename}
                          getTreeRef={() => this.memberRef || null}/>}

                    <div className="container-flex">
                        {enableDragPreview && <DragLayer />}

                        <div className="container-flex-item container-flex-column-left">
                            <h3>Dimension Member Tree</h3>
                            <div className="container-flex-tree">

                                {/* Members */}
                                <Tree data={members}
                                      sourceName="regular"
                                      enableDragPreview={enableDragPreview}
                                      draggable={enabledDnD}
                                      droppable={enabledDnD}
                                      useCheckboxes={!enableCalculations} //false - use; true - not use
                                      onDrop={this.moveDroppedMembers}
                                      onSelect={() => this.onFormChanged({focusedOn: "tree"})}
                                      onDeselect={this.onFormChanged}
                                      displaySearchInput={this.state.displaySearchInput}
                                      ref={tree => this.memberRef = tree}
                                      dataTitleKey={(entry) => (`${entry.name} [${entry.code}]`)}
                                      componentDomId="editor-member-tree"
                                      searchType="compact"/>
                            </div>
                        </div>

                        <div className="container-flex-item container-flex-column-middle">
                            {(enablePushedMembers) &&
                            <Tooltip placement="top" text="Push Selected Members" active={moveRightSingle}>
                                <Button className="btn-white btn-icon"
                                        disabled={!moveRightSingle}
                                        onClick={(event) => {
                                        event.preventDefault();
                                        this.moveSelectedMembers('right', 'selected', 'copy');
                                    }}>
                                    <span className="icon-arrow-next"/>
                                </Button>
                            </Tooltip>}

                            {enableCalculations &&
                            <Tooltip placement="top" text="Use Member code in formula" active={moveToCalculations}>
                                <Button className="btn-white btn-icon"
                                        disabled={!moveToCalculations}
                                        onClick={this.moveSelectedMembersIntoCalculation}
                                ><span className="icon-arrow-next"/></Button>
                            </Tooltip>}

                            {(enablePushedMembers) &&
                            <Tooltip text="Push Selected Members With Children"
                                     active={moveRightAll}
                                     placement="top">
                                <Button className="btn-white btn-icon"
                                        disabled={!moveRightAll}
                                        onClick={(event) => {
                                        event.preventDefault();
                                        this.moveSelectedMembers('right', 'all', 'copy');
                                    }}>
                                    <span className="icon-arrow-next-twice"/>
                                </Button>
                            </Tooltip>}

                            {(enableMembers || enablePushedMembers) &&
                            <Tooltip text={enablePushedMembers ? 'Clear Selected Members' : 'Insert Selected Members'}
                                     active={moveLeftSingle}>
                                <Button className="btn-white btn-icon"
                                        disabled={!moveLeftSingle}
                                        onClick={(event) => {
                                        event.preventDefault();
                                        this.moveSelectedMembers('left', 'selected', enablePushedMembers ? 'remove' : 'cut');
                                    }}>
                                    <span className="icon-arrow-prev"/>
                                </Button>
                            </Tooltip>}

                            {(enablePushedMembers) &&
                            <Tooltip placement="top" text="Clear All Members" active={moveLeftAll}>
                                <Button className="btn-white btn-icon"
                                        disabled={!moveLeftAll}
                                        onClick={(event) => {
                                        event.preventDefault();
                                        this.moveSelectedMembers('left', 'all', 'remove');
                                    }}>
                                    <span className="icon-arrow-prev-twice"/>
                                </Button>
                            </Tooltip>}

                        </div>

                        <div className="container-flex-item container-flex-column-right container-editor">

                            {/* Calculations block  */}
                            {enableCalculations && <Calculations ref={node => this.calculationRef = node}
                                                                 dimensionName={selectedDimension && selectedDimension.label}
                                                                 groupId={selectedGroup && selectedGroup.value}
                                                                 getCalculatedMembersList={this.props.getCalculatedMembersList}
                                                                 updateCalculated={this.props.updateCalculated}
                                                                 createCalculated={this.props.createCalculated}
                                                                 deleteCalculated={this.props.deleteCalculated}
                                                                 calculatedMembers={this.props.calculatedMembers}
                                                                 notify={this.props.notify}
                            />}

                            {/* Unused members */}
                            {enableMembers && <MembersGrid refLink={ref => this.unusedRef = ref}
                                                           title={"Unused Dimension Members"}
                                                           data={unusedMembers}
                                                           isLocked={this.state.isLocked}
                                                           onConfirm={() => this.setLock(true, false)}
                                                           onSave={this.saveNewMember}
                                                           notify={this.props.notify}
                                                           draggable={enabledDnD}
                                                           enableDragPreview={enableDragPreview}
                                                           disabled={!showButtons}
                                                           dimensionName={selectedDimension}
                                                           enablePushedMembers={enablePushedMembers}
                                                           toggleMembersGrid={this.toggleMembersGrid}
                                                           onSelect={() => this.onFormChanged({focusedOn: "grid"})}
                                                           onDeselect={this.onFormChanged}
                            />}

                            {/* Pushed members */}
                            {enablePushedMembers && <MembersGrid refLink={ref => this.pushedRef = ref}
                                                                 title={"Pushed Dimension Members"}
                                                                 data={pushedMembers}
                                                                 isLocked={this.state.isLocked}
                                                                 onConfirm={() => this.setLock(true, false)}
                                                                 onSave={this.saveNewMember}
                                                                 notify={this.props.notify}
                                                                 disabled={!showButtons}
                                                                 dimensionName={selectedDimension}
                                                                 enablePushedMembers={enablePushedMembers}
                                                                 toggleMembersGrid={this.toggleMembersGrid}
                                                                 onSelect={() => this.onFormChanged({focusedOn: "grid"})}
                                                                 onDeselect={this.onFormChanged}

                            />}

                            {/* Search members */}
                            {enableSearch && <SearchGrid refLink={ref => this.searchRef = ref}
                                                         title={"Dimension Members"}
                                                         hierarchyAttributes={this.state.hierarchyAttributes}
                                                         data={searchMembers}
                                                         members={this.state.members}
                                                         onSelect={() => this.onFormChanged({focusedOn: "grid"})}

                            />}


                        </div>

                        {
                            this.state.isCommentsAvailable &&
                            <div className="container-flex-item container-flex-column-comments">
                                <h3>Comments</h3>
                                <Comments messages={this.state.approvalComments}
                                          ref={comments => this.commentsRef = comments}
                                          isValidComment={this.state.isValidComment}
                                          userInfo={userInfo}
                                          scheme={{
                                          from: "from",
                                          time: "date",
                                          text: "content"
                                      }}/>
                            </div>
                        }
                    </div>
                </div>

                <ActionFooter show={this.state.showFooter}>
                    <Button onClick={this.cancelUnLock}>Cancel &amp; Unlock</Button>
                    <Button disabled={!enableDiscardChanges}
                            onClick={event => {
                                event.preventDefault();
                                this.discardChanges();
                            }}>Discard Changes</Button>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <ReviewChanges getChanges={this.getChanges}
                                   disabled={!enableReviewChanges}
                                   approvalId={this.state.approvalId}
                                   approvalComments={this.state.approvalComments}
                                   changes={this.props.changes}
                                   userInfo={userInfo}
                                   onConfirm={(comment) => this.onApprove(comment)}
                    />
                    <Button bsStyle="primary"
                            disabled={!enableApprove}
                            onClick={() => this.onApprove()}
                    >Send for Approval</Button>
                </ActionFooter>
            </div>
        );
    };
}

export default DragDropContext(HTML5Backend)(Editor);