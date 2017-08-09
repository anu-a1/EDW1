import React from 'react';
import PropTypes from 'prop-types';
import {DragLayer} from 'react-dnd';
import _ from 'lodash';

import TableRowPreview from '../../utils/Grid/Row/DraggablePreview';
import TreeLeafPreview from '../../utils/Tree/DraggablePreview';

const layerStyle = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%'
};

const getItemStyles = (currentOffset) => {
    if (!currentOffset) {
        return {display: 'none'};
    }
    const {x, y} = currentOffset;
    const transform = `translate(${x}px, ${y}px)`;
    return {transform, WebkitTransform: transform};
};

const getItem = ({item, itemType}) => {
    const data = item && item.item;
    const label = `${data.name} [${data.code}]`;
    return {
            "TableRow": <TableRowPreview>{`${label}`}</TableRowPreview>,
            "TreeLeaf": <TreeLeafPreview>{`${label}`}</TreeLeafPreview>
        }[itemType] || <span>{`${label} ${itemType}`}</span>;
};

const CustomDragLayer = ({isDragging, currentOffset, ...props}) => {
    return isDragging ? <div style={layerStyle}>
        <div style={getItemStyles(currentOffset)}>
                {getItem(props)}
        </div>
    </div> : null;
};

CustomDragLayer.propTypes = {
    item: PropTypes.object,
    itemType: PropTypes.string,
    initialOffset: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
    }),
    currentOffset: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
    }),
    isDragging: PropTypes.bool.isRequired
};

const collect = monitor => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging()
});

export default DragLayer(collect)(CustomDragLayer);