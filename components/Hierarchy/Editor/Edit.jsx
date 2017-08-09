import React, {Component} from 'react';
import {Button, DropdownButton, MenuItem} from "react-bootstrap";
import _ from 'lodash';
import cx from 'classnames';
import MergeNodes from './popup/MergeNodes';
import RemoveNodes from './popup/RemoveNodes';
import RenameNodes from './popup/RenameNodes';
import AddNewAttr from './popup/AddNewAttr';
import EditAttrValues from './popup/EditAttrValues';
import ManageAttrs from './popup/ManageAttrs';
import shortid from 'shortid';

import AttributeRow from './AttributeRow';

class Edit extends Component {

    state = {
        enableSearch: false,
        searchAttrs: {
            0: {
                attributeId: '',
                attributeName: '',
                query: ''
            }
        },
        addRowPos: 0
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.hierarchyAttributes !== this.props.hierarchyAttributes) {
            this.mergeNewAttributes(nextProps.hierarchyAttributes);
        }

        if (nextProps.members !== this.props.members) {
            this.state.enableSearch && this.performAttrSearch(nextProps.members);
        }
    };

    resetSearchAttributes = () => {
        this.setState({
            searchAttrs: {
                0: {
                    attributeId: '',
                    attributeName: '',
                    query: ''
                }
            }
        });
    };

    onSearchClick = () => {
        this.setState({
            enableSearch: !this.state.enableSearch
        });
        this.props.onSearchClick && this.props.onSearchClick();
    };

    onRowAdd = e => {
        e.preventDefault();
        const id = shortid.generate();
        const emptyItem = {
            attributeId: '',
            attributeName: '',
            query: ''
        };
        const stateSearchAttributes = this.state.searchAttrs;

        this.setState({
            searchAttrs: {
                ...stateSearchAttributes,
                [id]: emptyItem
            },
            addRowPos: id
        });
    };

    onRowDelete = item => e => {
        const withoutDeleted = _.omit(this.state.searchAttrs, [item]);
        const attrsIds = _.keys(withoutDeleted);

        const nextState = {
            searchAttrs: withoutDeleted,
            addRowPos: _.last(attrsIds)
        };

        this.setState(nextState, this.performAttrSearch);
    };

    onAttrSelect = id => selected => {
        const searchAttrs = this.state.searchAttrs;
        const currentAttr = searchAttrs[id];
        const nextState = {
            ...searchAttrs,
            [id]: {
                ...currentAttr,
                attributeId: selected.value,
                attributeName: selected.label
            }
        };
        this.setState({searchAttrs: nextState});
    };

    getAvailableAttrs = (attr) => {
        const rows = _.omit(this.state.searchAttrs, attr);
        let selected = [];

        _.values(rows).forEach((entry) => {
            entry.attributeId && selected.push(entry.attributeId);
        });

        return this.props.hierarchyAttributes.filter((attr) => {
            return selected.indexOf(attr.id) === -1;
        });
    };

    delayedSearch = _.debounce(() => this.performAttrSearch(), 150);

    onSearchQueryChange = id => e => {
        e.persist();
        const query = e.target.value || '';
        const searchAttrs = this.state.searchAttrs;
        const currentAttr = searchAttrs[id];

        this.setState({
            searchAttrs: {
                ...searchAttrs,
                [id]: {...currentAttr, query}
            }
        });

        this.delayedSearch();
    };

    performAttrSearch = (nextMembers) => {
        const {resetTreeSearchState} = this.props;
        const filtersToProceed  = _.values(this.state.searchAttrs).filter((item) => {
            return item.query.length >= 3 && item.attributeId;
        });
        filtersToProceed.length ? this.onTreeSearch(filtersToProceed, nextMembers) : resetTreeSearchState();
    };

    onTreeSearch = (attributes, nextMembers) => {
        let filtered = null;

        attributes.forEach((attribute) => {
            const filterFrom = filtered || nextMembers || this.props.members;
            filtered = filterFrom.filter(value => {
                const query = attribute.query.toLowerCase();

                return _.find(value.attributeValues, (attrVal) => {
                    const attributeValue = attrVal.attributeValue && attrVal.attributeValue.toLowerCase();
                    return attrVal.attributeName === attribute.attributeName &&
                        attributeValue && attributeValue.indexOf(query) >= 0;
                });

            });
        });

        this.props.onTreeSearch && this.props.onTreeSearch(filtered);
    };

    mergeNewAttributes = (attributes) => {
        let mergedAttrs = {};
        attributes.forEach((attr) => {
            const isExist = _.findKey(this.state.searchAttrs, (item) => item.attributeId === attr.id);
            if (isExist) {
                mergedAttrs[isExist] = {
                    ...this.state.searchAttrs[isExist],
                    attributeId: attr.id,
                    attributeName: attr.name
                };
            }
        });

        if (_.isEmpty(mergedAttrs)) {
            mergedAttrs = {
                0: {
                    attributeId: '',
                    attributeName: '',
                    query: ''
                }
            };
        }

        this.setState({
            searchAttrs: mergedAttrs
        });
    };

    render() {
        const {cut, undoCut, paste, remove, rename, mergeMembers, editAttributes} = this.props.visibility;
        const {
            onCut, onUndoCut, onPaste, onRemove, onRename, getFocusedSource
        } = this.props;
        const attributesNames = _.keys(this.state.searchAttrs);
        return (
            <div className="panel-edit-state">
                <div className="panel-edit-state-arrow"></div>
                <div className="panel-edit-state-content">
                    <div className="panel-nodes-content">
                        <p>Nodes</p>
                        <div className="btns-block btn-dropdown-block">
                            <Button className="btn-shadow"
                                    disabled={!cut}
                                    onClick={onCut}
                                >Cut</Button>

                            <a className={cx('undo-link', {hidden: !undoCut})}
                               href="#"
                               onClick={onUndoCut}
                            >Undo Cut</a>

                            <DropdownButton id="cut-options-dropdown"
                                            className="btn-shadow"
                                            title="Paste"
                                            disabled={!paste}
                                            onSelect={onPaste}
                                >
                                <MenuItem eventKey="sibling">Paste as sibling</MenuItem>
                                <MenuItem eventKey="child">Paste as child</MenuItem>
                            </DropdownButton>
                        </div>

                        <div className="btns-block">
                            <RemoveNodes disabled={!remove}
                                         getFocusedSource={getFocusedSource}
                                         onConfirm={onRemove}
                                />
                            <RenameNodes disabled={!rename}
                                         getFocusedSource={getFocusedSource}
                                         onConfirm={onRename}
                                />
                        </div>
                        <div className="btns-block">
                            <MergeNodes disabled={!mergeMembers}
                                        onSave={this.props.validateMergeMembers}
                                        getTreeRef={this.props.getTreeRef}/>
                        </div>

                        <EditAttrValues
                            disabled={!editAttributes}
                            hierarchyAttributes={this.props.hierarchyAttributes}
                            getFocusedSource={getFocusedSource}
                            notify={this.props.notify}
                            selectedDimension={this.props.selectedDimension}
                            selectedGroup={this.props.selectedGroup}
                            getTreeRef={this.props.getTreeRef}
                            onSave={this.props.onAttributesUpdate}/>
                    </div>
                    <div className="panel-attr-content">
                        <p>Attributes</p>
                        <Button className={cx("btn-shadow", {"is-active": this.state.enableSearch})}
                                disabled={!this.props.hierarchyAttributes.length}
                                onClick={this.onSearchClick}>Search</Button>
                        <AddNewAttr
                            notify={this.props.notify}
                            onSave={this.props.saveNewAttribute}/>
                        <ManageAttrs
                            hierarchyAttributes={this.props.hierarchyAttributes}
                            onSave={this.props.saveModifiedAttributes}
                            notify={this.props.notify}
                            disabled={!this.props.hierarchyAttributes.length}/>
                    </div>
                </div>
                {
                    this.state.enableSearch && this.props.hierarchyAttributes &&
                    <div className="panel-edit-search-content">
                        {
                            attributesNames.map((attr) => {
                                return <AttributeRow {...this.state.searchAttrs[attr]}
                                                     key={attr}
                                                     attributesNames={attributesNames}
                                                     attributeRowId={attr}
                                                     isAddHidden={this.state.addRowPos.toString() !== attr}
                                                     options={this.getAvailableAttrs(attr)}
                                                     onRowAdd={this.onRowAdd}
                                                     onRowDelete={this.onRowDelete(attr)}
                                                     onSearchQueryChange={this.onSearchQueryChange(attr)}
                                                     onAttrSelect={this.onAttrSelect(attr)}/>;
                            })
                        }
                    </div>
                }
            </div>
        );
    };
}

export default Edit;