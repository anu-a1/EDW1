import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Tooltip from '../Tooltip';
import cx from 'classnames';
import _ from 'lodash';

import Checkbox from './Fields/CheckBox';
import Text from './Fields/Text';
import Date from './Fields/DateField';

import DraggableRow from './Row/Draggable';
import RegularRow from './Row/Regular';

class Body extends Component {

    static propTypes = {
        data: PropTypes.array.isRequired,
        bodyScheme: PropTypes.array.isRequired,
        onCellChange: PropTypes.func.isRequired,
        onRowSelect: PropTypes.func,
        selectedIndexes: PropTypes.array,
        enumeration: PropTypes.bool,
        isSelectable: PropTypes.bool
    };

    onCellChange = (index, key, value, customAttrs={}) => {
        this.props.onCellChange(index, customAttrs.key || key, value);
    };

    getValue = (data, scheme) => {
        const {aliases, key} = scheme;
        const value = data[key];
        if (aliases) {
            return aliases[value] || value;
        }
        return value;
    };

    render() {
        const {
            justCreatedItemName, data, enumeration, bodyScheme,
            selectedIndexes, onRowSelect, isSelectable, highlighted, emptyGridHeight,
            draggable, enableDragPreview
        } = this.props;
        const tooltipText = justCreatedItemName ? justCreatedItemName.toLowerCase() : 'item';
        const pointerStyle = isSelectable ? {cursor: 'pointer'} : null;
        const Row = draggable ? DraggableRow : RegularRow;

        return (
            <tbody>
            {data && data.length ?
                data.map((item, index) => {
                    return (
                        <Row key={item.id || item.index}
                             enableDragPreview={enableDragPreview}
                             item={item}
                             style={{...pointerStyle, color: highlighted[item.id] || ''}}
                             className={cx({
                                'is-selected': isSelectable && selectedIndexes.indexOf(item.id) >= 0
                            })}
                             onClick={() => isSelectable && onRowSelect(item)}>

                            {enumeration ? <td>{item.index + 1}</td> : null}

                            {
                                bodyScheme.map((col, idx) => {
                                    const Component = _.isFunction(col.component) ?
                                        col.component : {Checkbox, Date}[col.component] || Text;

                                    return (
                                        <td key={idx}>
                                            {
                                                item.isNew && idx === 0 &&
                                                <Tooltip text={`Just created ${tooltipText}`}>
                                                    <span className="just-created"/>
                                                </Tooltip>
                                            }
                                            <Component
                                                {...col.componentProps}
                                                value={this.getValue(item, col)}
                                                rowData={item}
                                                id={`${col.key}${index}`}
                                                onChange={this.onCellChange.bind(null, item.index, col.key)}/>
                                        </td>
                                    );
                                })
                            }
                        </Row>
                    );
                })
                :
                <tr className="empty-grid">{
                    bodyScheme.map((col, idx) => {
                            return <td key={`${col.key}-${idx}`} style={{height: emptyGridHeight || ''}}/>
                        }
                    )}
                </tr>
            }
            </tbody>
        );
    }
}

export default Body;