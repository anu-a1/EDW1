import React, {Component} from 'react';
import _ from 'lodash';
import cx from 'classnames';
import PropTypes from 'prop-types';

import Draggable from './Draggable';
import Droppable from './Droppable';
import Checkbox from '../Fields/FormCheckbox';

class TreeLeaf extends Component {
    static propTypes = {
        connectDragSource: PropTypes.func,
        isDragging: PropTypes.bool,
        data: PropTypes.object.isRequired,
        foundedList: PropTypes.object.isRequired,
        selectedList: PropTypes.object.isRequired,
        onLeafToggle: PropTypes.func.isRequired,
        onTreeLeafSelect: PropTypes.func.isRequired
    };

    toggleLeaf = id => e => {
        this.props.onLeafToggle(id);
    };

    isNested = () => {
        const {item, data, childrenAttr} = this.props;
        const child = item[childrenAttr] || [];
        let isNested = false;
        child.forEach(id => {
            const subChild = data[id] && data[id][childrenAttr];
            isNested = subChild && subChild.length ? true : isNested;
        });
        return isNested;
    };

    renderChild = () => {
        const {item, data, childrenAttr, parentAttr, ...props} = this.props;
        const {toggled} = item;
        const child = item[childrenAttr];
        const isNotEmptyChild = !_.isEmpty(child);

        return isNotEmptyChild ? <ul className={cx({
                                            'tree-sub': true,
                                            'hidden': !toggled,
                                            'nested': this.isNested()
                                        })}>
            {_.map(child, (id, index) => {
                const children = data[id];
                props[parentAttr] = children[parentAttr];
                return children ? <TreeLeaf key={id}
                                            {...props}
                                            item={_.omit(children, parentAttr)}
                                            isLastLeaf={child.length === index + 1}
                                            childrenAttr={childrenAttr}
                                            parentAttr={parentAttr}
                                            data={data}
                          /> : null;
            })}
        </ul> : null;

    };

    onEdit = event => {
        event.preventDefault();
        const {item, parentAttr, ...props} = this.props;
        this.props.onEdit && this.props.onEdit({
            ...item,
            [parentAttr]: item[parentAttr] || props[parentAttr] || null
        });
    };

    onDelete = event => {
        event.preventDefault();
        const {item, parentAttr, ...props} = this.props;
        this.props.onDelete && this.props.onDelete({
            ...item,
            [parentAttr]: item[parentAttr] || props[parentAttr] || null
        });
    };

    getLabel = () => {
        const {
            item, foundedList, activeHighlighted, highlighted,
            onTreeLeafSelect, selectedList, useCheckboxes
        } = this.props;
        const {id} = item;
        const isInFounded = foundedList[id];

        return <span onClick={onTreeLeafSelect(id)}
                     className={cx("leaf-title", {
                         'active': id && id === activeHighlighted,
                         'leaf-selected': id && !useCheckboxes && selectedList[id]
                     })}
                     style={{color: highlighted[id] || ''}}
            >{ (isInFounded && isInFounded.title) || item.__title}</span>
    };

    render() {
        const {
            item, childrenAttr,
            selectedList, onTreeLeafSelect,
            isLastLeaf, useCheckboxes, useEditIcon, useDeleteIcon,
            draggable, droppable, onDrop
            } = this.props;
        const {id, parentId, toggled} = item;
        const child = item[childrenAttr];
        const isNotEmptyChild = !_.isEmpty(child);

        return (
            (!parentId || parseInt(parentId, 10) <= 0) && id ?
                <li id={`${id}-leaf`}
                    className={cx("tree-leaf", {
                        "last-leaf": !isNotEmptyChild && isLastLeaf,
                        "is-closed": !toggled,
                        "is-open": toggled && isNotEmptyChild
                    })}>
                    <div className="tree-leaf-caption">
                        {
                            isNotEmptyChild &&
                            <span onClick={this.toggleLeaf(id)}
                                  className={cx({
                                      'tree-toggle': true,
                                      'is-toggled': toggled
                                  })}>
                                <span className={cx({
                                    "icon-calc-minus": !!toggled,
                                    "icon-calc-plus-btns": !toggled
                                })}/>
                            </span>
                        }

                        {useCheckboxes && <Checkbox id={id}
                                                    defaultValue={!!selectedList[id]}
                                                    onChange={onTreeLeafSelect(id)}/>}


                        {draggable && droppable && <Droppable onDrop={onDrop}>
                            <Draggable item={this.props.item}
                                       enableDragPreview={this.props.enableDragPreview}
                                       sourceName={this.props.sourceName}>
                                {this.getLabel()}
                            </Draggable>
                        </Droppable>}

                        {draggable && !droppable  && <Draggable item={this.props.item}
                                                                enableDragPreview={this.props.enableDragPreview}
                                                                sourceName={this.props.sourceName}>
                            {this.getLabel()}
                        </Draggable>}

                        {!draggable && droppable && <Droppable onDrop={onDrop}>
                            {this.getLabel()}
                        </Droppable>}

                        {!draggable && !droppable && this.getLabel()}


                        {useDeleteIcon && <span className="icon-tree-functions icon-garbage pull-right"
                                                onClick={this.onDelete}
                            />}

                        {useEditIcon && <span className="icon-tree-functions icon-edit pull-right"
                                              onClick={this.onEdit}
                            />}

                    </div>

                    {this.renderChild()}

                </li> : null
        );
    };
}

export default TreeLeaf;
