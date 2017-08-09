import React, {Component} from 'react';
import {Button, FormGroup, ControlLabel} from "react-bootstrap";
import _ from "lodash";
import async from 'async';
import cx from 'classnames';

import Tooltip from '../utils/Tooltip';
import Select, {CaseSelect, MultiSelect} from '../utils/Fields/Select';
import Tree from '../utils/Tree';
import ActionFooter from '../ActionFooter';
import Loading from '../Loading';

class CopyCase extends Component {

    static defaultProps = {
        messages: {
            validateSuccessStatus0: 'Case has no activities.',
            validateSuccessStatusElse: 'Case has activities.',
            validateFailure: 'Validation of case activities failed. %error%',

            copySuccess: 'Copy case settings submitted to queue.',
            copyFailure: 'Setting copy case settings failed. %error%',

            clearSuccess: 'Clear case settings submitted to queue.',
            clearFailure: 'Setting clear case settings failed. %error%',

            hierarchyError: '%dimensionName% hierarchies are different in the selected views, please select another set of views.'
        }
    };

    state = {
        sourceCaseId: null,
        sourceCase: null,
        targetCaseId: "",
        targetCase: null,
        viewIds: [],
        selectedViews: [],
        dimensionName: "",
        dimensions: [],
        members: null,
        groupId: null,

        targetTree: null,
        tree: null, // target tree format for server requests
        selectedMembers: [],

        showFooter: false,
        showValidate: false,

        lastMovementAction: [],
        undoAvailable: false,
        moveRightSingle: false,
        moveRightAll: false,
        moveLeftSingle: false,
        moveLeftAll: false,
        isLoading: false
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.dimensions && nextProps.dimensions !== this.props.dimensions) {
            let dimensions = [];
            for (let i = 0, len = nextProps.dimensions.data.length; i < len; i += 1) {
                const dimension = nextProps.dimensions.data[i];
                dimensions.push({
                    id: dimension.id,
                    name: dimension.name
                });
            }
            this.onFormChanged({dimensions, isLoading: false});
        }

        if (nextProps.members && nextProps.members !== this.props.members) {
            this.onFormChanged({
                members: [...nextProps.members.data],
                isLoading: false
            });
        }

        if (nextProps.periodMembers && nextProps.periodMembers !== this.props.periodMembers) {
            this.onFormChanged({
                members: [...nextProps.periodMembers.data],
                isLoading: false
            });
        }
    };

    shouldComponentUpdate(nextProps, nextState) {
        let shouldUpdate = this.state !== nextState;
        _.each(['casesList', 'views', 'dimensions', 'configurableDimensions', 'members', 'userId'], name => {
            shouldUpdate = this.props[name] !== nextProps[name] || shouldUpdate;
        });
        return shouldUpdate;
    };

    onValidate = (event) => {
        event.preventDefault();
        const {userId, validateCase, notify, messages} = this.props;
        const {targetCase, tree} = this.state;

        if (!targetCase || !tree || !userId) {
            return;
        }

        this.onFormChanged({isLoading: true});
        validateCase({targetCase, tree, userId})
            .then(res => {
                notify({
                    content: res.data && parseInt(res.data, 10) > 0 ? messages.validateSuccessStatusElse : messages.validateSuccessStatus0,
                    type: 'success'
                });
                this.onFormChanged({isLoading: false});
            }).catch((err) => {
                notify({
                    template: messages.validateFailure,
                    content: err,
                    type: 'server-error'
                });
                this.onFormChanged({isLoading: false});
            });
    };

    onCopy = (event) => {
        event.preventDefault();
        const {userId, copyCase, notify, messages} = this.props;
        const {sourceCase, targetCase, tree} = this.state;

        if (!sourceCase || !targetCase || !tree || !userId) {
            return;
        }

        this.onFormChanged({isLoading: true});
        copyCase({sourceCase, targetCase, tree, userId})
            .then(res => {
                notify({
                    content: messages.copySuccess,
                    type: 'success'
                });
                this.onFormChanged({isLoading: false, showFooter: false});
            }).catch((err) => {
                notify({
                    template: messages.copyFailure,
                    content: err,
                    type: 'server-error'
                });
                this.onFormChanged({isLoading: false});
            });
    };

    onClear = (event) => {
        event.preventDefault();
        const {userId, clearCase, notify, messages} = this.props;
        const {targetCase, tree} = this.state;

        if (!targetCase || !tree || !userId) {
            return;
        }

        this.onFormChanged({isLoading: true});
        clearCase({targetCase, tree, userId})
            .then(res => {
                notify({
                    content: messages.clearSuccess,
                    type: 'success'
                });
                this.onFormChanged({isLoading: false, showFooter: false});
            }).catch((err) => {
                notify({
                    template: messages.clearFailure,
                    content: err,
                    type: 'server-error'
                });
                this.onFormChanged({isLoading: false});
            });
    };

    onFormChanged = (changedState, callback) => {
        const nextState = {
            ...this.state,
            ...changedState
        };
        const isActionsAvailable = !!(nextState.targetCase && nextState.sourceCase && nextState.dimensionName);
        const targetTree = isActionsAvailable ? this.getTargetTree(nextState) : {
            targetTree: null,
            tree: null
        };
        const movementVisibility = this.getMovementVisibility(nextState, targetTree);

        this.setState({
            ...targetTree,
            showFooter: isActionsAvailable,
            showValidate: isActionsAvailable,
            ...changedState,
            ...movementVisibility
        }, callback);
    };

    getMovementVisibility = (nextState, {targetTree}) => {
        const movable = targetTree && targetTree.length > 0;
        const selectedTreeMembers = this.memberTreeRef && this.memberTreeRef.getSelectedState();
        const selectedTreeTargets = this.targetTreeRef && this.targetTreeRef.getSelectedState();
        return {
            undoAvailable: movable && nextState.lastMovementAction.length > 0,
            moveRightAll: movable,
            moveRightSingle: movable && !_.isEmpty(selectedTreeMembers),
            moveLeftAll: movable && nextState.selectedMembers.length > 0,
            moveLeftSingle: movable && !_.isEmpty(selectedTreeTargets)
        };
    };

    sourceCaseChanged = ({value}) => {
        const sourceCaseId = value;
        this.onFormChanged({
            isLoading: true,
            sourceCaseId,
            sourceCase: sourceCaseId ? _.find(this.props.casesList.data, {id: parseInt(sourceCaseId, 10)}) : null,
            dimensionName: "",
            dimensions: [],
            members: null
        }, () => {
            Promise
                .all([
                    this.props.getViewsList(),
                    this.props.getConfigurableDimensionsList()
                ])
                .then(() => this.onFormChanged({isLoading: false}));
        });

    };

    targetCaseChanged = ({value}) => {
        const targetCaseId = value;
        this.onFormChanged({
            isLoading: true,
            targetCaseId,
            targetCase: targetCaseId ? _.find(this.props.casesList.data, {id: parseInt(targetCaseId, 10)}) : null
        }, () => {
            this.props
                .getDimensionsList()
                .then(() => this.onFormChanged({isLoading: false}));
        });
    };

    getTargetTree = ({targetCase, dimensionName, selectedViews, selectedMembers, dimensions}) => {
        /*
         --0 level <TARGET CASE>
            --1 level <VIEW (ALL or selected views)>
                --2 level <DIMENSION (all dimensions from API (Account, Business....))>
                    --3 level <MEMBER - (
                        [ALL] or selected Members from members tree
                        only leaf members can be selected (with out childrens)
                        )>
         */

        const views = selectedViews.length ? selectedViews : [{
            "viewName": '[ALL]',
            "viewId": 0
        }];
        const bindedMembers = _.groupBy(selectedMembers, member => member.dimensionName || dimensionName.toLowerCase());
        let caseChildren = [];
        let tree = {
            // 0 - TARGET CASE
            "id": targetCase.id,
            "name": targetCase.name,
            "code": targetCase.name,
            "children": caseChildren
        };

        _.each(views, (view) => {
            // 1 - VIEW
            let viewChildren = [];
            caseChildren.push({
                id: view.viewId,
                name: view.viewName,
                code: view.viewName,
                children: viewChildren
            });
            _.each(dimensions, (dimension) => {
                // 2 - DIMENSION
                let dimensionChildren = [];
                viewChildren.push({
                    id: dimension.id,
                    name: dimension.name,
                    code: dimension.code,
                    children: dimensionChildren
                });
                // 3 - MEMBER
                const currentDimensionMembers = bindedMembers[dimension.name.toLowerCase()] || [{
                        id: 0,
                        name: '',
                        code: 'All'
                    }];

                _.each(currentDimensionMembers, member => {
                    dimensionChildren.push({
                        id: member.id,
                        name: member.name,
                        code: member.code,
                        children: []
                    });
                });

            });
        });

        return {tree, targetTree: this.treeToPlain(caseChildren)};
    };

    treeToPlain = (childArray, parentId = null, lvl = 0) => {
        let result = [];
        const level = lvl + 1;
        _.each(childArray, item => {
            const {children, ...options} = item;
            const id = `level-${level}-${parentId}-${options.id}`;
            result.push({
                id, parentId,
                name: level === 3 && options.code ? `${options.name} [${options.code}]` : options.name,
                originId: level === 3 ? options.id : null
            });

            if (!_.isEmpty(children)) {
                result = [
                    ...result,
                    ...this.treeToPlain(children, id, level, options.id)
                ];
            }
        });

        return result;
    };

    viewChanged = selectedOptions => {
        const views = this.props.views.data;
        let selectedViews = [];
        for (let i = 0, len = selectedOptions.length; i < len; i += 1) {
            const option = selectedOptions[i];
            selectedViews.push(_.find(views, {viewId: parseInt(option.value, 10)}));
        }
        if (selectedViews.length === views.length) {
            selectedViews = [];
        }
        const {isLoading, groupId} = this.getMembers(selectedViews, this.state.dimensionName);
        this.onFormChanged({
            isLoading,
            groupId,
            selectedViews,
            viewIds: selectedOptions
        });
    };

    dimensionChanged = (dimensionOption) => {
        const dimensionName = dimensionOption && dimensionOption.value;
        const {isLoading, groupId} = this.getMembers(this.state.selectedViews, dimensionName);
        this.onFormChanged({dimensionName, isLoading, groupId});
    };

    getMembers = (selectedViews, dimensionName) => {
        const {sourceCaseId, groupId} = this.state;
        const views = selectedViews.length ? selectedViews : this.props.views.data;
        if (!views.length || !dimensionName || !sourceCaseId) {
            return {isLoading: false, groupId};
        }

        if (dimensionName.toLowerCase() === 'period') {
            this.props.getPeriodMembersList({caseId: sourceCaseId, dimensionName});
            return {isLoading: true, groupId};
        }

        const newGroupId = this.getGroupId(views, dimensionName);
        if (!newGroupId) {
            return {isLoading: false, groupId};
        }
        this.props.getMembersList({groupId: newGroupId, dimensionName});
        return {isLoading: true, groupId: newGroupId};
    };

    /**
     *
     * @param {Array} views - [{
     *      viewId: 1,
     *      dimensionGroups: [{
     *          "groupId": 1,
     *          "dimensionName": "Business",
     *          "groupName": "Default"
     *      }, ...]
     * }, ...]
     * @param {String} dimensionName
     * @returns {Number|Null} groupId
     */
    getGroupId = (views, dimensionName) => {
        let viewBusinessGroups = [];

        /**
         * filter dimensionGroups by dimensionName
         * viewBusinessGroups = [
         *      [{"groupId": 1}]
         *      [{"groupId": 1}, {"groupId": 2}]
         * ]
         */
        for (let i = 0, len = views.length; i < len; i += 1) {
            const view = views[i];
            const viewDimensionGroups = _.filter(view.dimensionGroups, group => (
                group.dimensionName.toLowerCase() === dimensionName.toLowerCase()
            ));
            viewBusinessGroups.push(viewDimensionGroups || []);
        }

        //get groups intersections by equal
        viewBusinessGroups.push(_.isEqual);
        //group = [{"groupId": 1}]
        const group = _.intersectionBy.apply(_, viewBusinessGroups);

        //should get distinct group
        if (group.length === 1 && group[0].groupId) {
            return group[0].groupId;
        }

        this.props.notify({
            type: 'danger',
            content: this.props.messages.hierarchyError.replace('%dimensionName%', dimensionName)
        });

        return null;
    };

    getParentsLastLeaf = (childs, tree) => {
        let result = [];
        childs.forEach(id => {
            if (_.isEmpty(tree[id].childs)) {
                result.push(this.getExactProps(tree[id]));
            } else {
                result = _.union(result, this.getParentsLastLeaf(tree[id].childs, tree));
            }
        });
        return result;
    };
    
    /**
     * Gets only needed properties from single tree leaf
     * @param {object} entry - tree leaf data
     * @returns {object} Object with id, parentId, code, name properties from entry
     */
    getExactProps = (entry) => {
        return {
            ..._.pick(entry, ['id', 'parentId', 'code', 'name']),
            dimensionName: this.state.dimensionName.toLowerCase()
        };
    };

    moveSelectedMembers = (action, direction, allOrSelected, memberTreeSelected, targetTreeSelected) => {
        const {lastMovementAction, selectedMembers} = this.state;

        if (action === 'undo') {
            const actionsWithoutLast = lastMovementAction.slice(0, lastMovementAction.length - 1);
            const actionToApply = actionsWithoutLast.pop();

            if (actionToApply && actionToApply.length) {
                return this.onFormChanged({
                    lastMovementAction: actionsWithoutLast
                }, () => this.moveSelectedMembers.apply(this, actionToApply));
            }

            return this.onFormChanged({
                lastMovementAction: [],
                selectedMembers: []
            });
        }

        if (memberTreeSelected) {
            this.memberTreeRef.updateState(memberTreeSelected, 'selected');
        }

        if (targetTreeSelected) {
            this.targetTreeRef.updateState(targetTreeSelected, 'selected');
        }

        let currentSelectedMembers = [];
        const targetSelectedState = this.targetTreeRef.getSelectedState();
        const memberSelectedState = this.memberTreeRef.getSelectedState();
        const treeViewData = this.memberTreeRef.getTreeDataState();
        const isAllCommand = allOrSelected === 'all';
        const isDirectionLeft = direction === 'left';
        
        if (!isAllCommand) {
            if (isDirectionLeft) {
                const targetTreeSelectedKeys = _.map(targetSelectedState, item => item.originId);
                currentSelectedMembers = selectedMembers.filter((item) => (
                    targetTreeSelectedKeys.indexOf(item.id) === -1
                ));
            } else {
                const isParentSelected = _.find(memberSelectedState, item => item.childs.length);
                if (isParentSelected) {
                    _.each(memberSelectedState, entry => {
                        if (entry.childs.length) {
                            currentSelectedMembers = _.union(
                                currentSelectedMembers,
                                this.getParentsLastLeaf(entry.childs, treeViewData)
                            );
                        } else {
                            currentSelectedMembers.push(this.getExactProps(entry));
                        }
                    });
                } else {
                    currentSelectedMembers = _.union(selectedMembers, _.map(memberSelectedState, entry => this.getExactProps(entry)));
                }
            }
        } else {
            currentSelectedMembers = isDirectionLeft ?
                [] : _.filter(treeViewData, entry => !entry.childs.length && this.getExactProps(entry));
        }

        const currentMovementAction = [
            ...lastMovementAction,
            [
                action,
                direction,
                allOrSelected,
                memberTreeSelected = _.extend({}, memberSelectedState),
                targetTreeSelected = _.extend({}, targetSelectedState)
            ]
        ];

        async.parallel([
            this.targetTreeRef.clearSelected.bind(this.targetTreeRef),
            this.memberTreeRef.clearSelected.bind(this.memberTreeRef)
        ], this.onFormChanged.bind(this, {
            lastMovementAction: currentMovementAction,
            selectedMembers: _.uniqBy(currentSelectedMembers, 'id')
        }));
    };

    render() {
        const {casesList, views, configurableDimensions} = this.props;
        const {members, targetTree, undoAvailable, moveRightSingle, moveRightAll, moveLeftSingle, moveLeftAll, isLoading} = this.state;

        return (
            <div className="copy-case-content">
                <Loading show={isLoading|| !casesList}/>
                <div className={cx("copy-case-wrapper container-flex", {
                    "has-footer": this.state.showFooter
                })}>
                    <Button
                        className={cx("btn-validate", {
                            "btn-dark": true,
                            "hidden": !this.state.showValidate
                        })}
                        onClick={this.onValidate}>
                        Validate
                    </Button>
                    <div className="container-flex-item container-flex-column-left">
                        <h3>Source Case</h3>

                        <div className="container-column">
                            <div className="container-blue">

                                {/* Source Case */}
                                <CaseSelect name="sourceCaseId"
                                            label="Source Case"
                                            value={this.state.sourceCaseId}
                                            placeholder="Select Source Case"
                                            options={casesList  ? casesList.data : []}
                                            onChange={this.sourceCaseChanged}
                                    />

                                <div className="form-group-row">

                                    {/* View */}
                                    <MultiSelect name="viewIds"
                                                 label="View"
                                                 placeholder="Select View"
                                                 value={this.state.viewIds}
                                                 options={views && this.state.sourceCaseId ? _.map(views.data, view => ({
                                                    value: view.viewId,
                                                    label: view.viewName
                                                 })) : []}
                                                 onChange={this.viewChanged}
                                        />

                                    {/* Dimension */}
                                    <FormGroup
                                        controlId="dimensionName">
                                        <ControlLabel>Dimension</ControlLabel>
                                        <Select name="dimensionName"
                                                value={this.state.dimensionName}
                                                placeholder="Select Dimension"
                                                options={configurableDimensions && this.state.sourceCaseId ? _.map(configurableDimensions.data, option => ({
                                                    value: option.name,
                                                    label: option.name
                                                })) : []}
                                                onChange={this.dimensionChanged}
                                            />
                                    </FormGroup>

                                </div>
                            </div>

                            <div className="block-placeholder">
                                <span>Select Source Case, View and Dimension</span>
                            </div>

                            {
                                members &&
                                    <Tree data={members}
                                          ref={tree => this.memberTreeRef = tree}
                                          componentDomId="copycase-member-tree"
                                          onSelect={(selectedItems) => {
                                            this.onFormChanged({moveRightSingle: selectedItems.length > 0});
                                          }}
                                          dataTitleKey={(entry) => (`${entry.name} [${entry.code}]`)}/>
                            }

                        </div>
                    </div>

                <div className="container-flex-item container-flex-column-middle">
                    <Tooltip placement="top" text="Add Selected Members" active={moveRightSingle}>
                        <Button className="btn-white btn-icon"
                                disabled={!moveRightSingle}
                                onClick={(event) => {
                                    event.preventDefault();
                                    this.moveSelectedMembers('move', 'right', 'selected');
                                }}>
                            <span className="icon-arrow-next"/>
                        </Button>
                    </Tooltip>
                    <Tooltip placement="top" text="Add All Members" active={moveRightAll}>
                        <Button className="btn-white btn-icon"
                                disabled={!moveRightAll}
                                onClick={(event) => {
                                    event.preventDefault();
                                    this.moveSelectedMembers('move', 'right', 'all');
                                }}>
                            <span className="icon-arrow-next-twice"/>
                        </Button>
                    </Tooltip>
                    <Tooltip placement="top" text="Delete Selected Members" active={moveLeftSingle}>
                        <Button className="btn-white btn-icon"
                                disabled={!moveLeftSingle}
                                onClick={(event) => {
                                    event.preventDefault();
                                    this.moveSelectedMembers('move', 'left', 'selected');
                                }}>
                            <span className="icon-arrow-prev"/>
                        </Button>
                    </Tooltip>
                    <Tooltip placement="top" text="Delete All Members" active={moveLeftAll}>
                        <Button className="btn-white btn-icon"
                                disabled={!moveLeftAll}
                                onClick={(event) => {
                                    event.preventDefault();
                                    this.moveSelectedMembers('move', 'left', 'all');
                                }}>
                            <span className="icon-arrow-prev-twice"/>
                        </Button>
                    </Tooltip>
                    <Tooltip placement="top" text="Undo Operation" active={undoAvailable}>
                        <Button className="btn-white btn-icon"
                                disabled={!undoAvailable}
                                onClick={(event) => {
                                    event.preventDefault();
                                    this.moveSelectedMembers('undo');
                                }}>
                            <span className="icon-arrow-undo"/>
                        </Button>
                    </Tooltip>
                </div>

                    <div className="container-flex-item container-flex-column-right">
                        <h3>Target Case</h3>

                        <div className="container-column">
                            <div className="container-blue">

                                {/* Target Case */}
                                <CaseSelect name="targetCaseId"
                                            label="Target Case"
                                            placeholder="Select Target Case"
                                            dismissLocked={true}
                                            value={this.state.targetCaseId}
                                            options={casesList  ? casesList.data : []}
                                            onChange={this.targetCaseChanged}
                                    />

                            </div>

                            <div className="block-placeholder">
                                <span>Select Target Case</span>
                            </div>

                            {targetTree && <Tree data={targetTree}
                                                 ref={tree => this.targetTreeRef = tree}
                                                 clickable={false}
                                                 componentDomId="copycase-target-tree"
                                                 onSelect={(selectedItems) => {
                                                    this.onFormChanged({moveLeftSingle: selectedItems.length > 0});
                                                 }}
                                                 dataTitleKey="name"/>}
                        </div>
                    </div>
                </div>

                <ActionFooter show={this.state.showFooter}>
                    <Button onClick={this.onClear}>Clear</Button>
                    <Button bsStyle="primary" onClick={this.onCopy}>Copy</Button>
                </ActionFooter>

            </div>
        );
    };
}

export default CopyCase;