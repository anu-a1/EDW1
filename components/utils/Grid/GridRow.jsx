import React, {Component} from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {DragSource} from 'react-dnd';

const draggingStyles = {
    opacity: 0.4
};

const regularStyles = {
    opacity: 1
};

class DraggableRow extends Component {
    static propTypes = {
        connectDragSource: PropTypes.func,
        isDragging: PropTypes.bool
    };

    render() {
        const {connectDragSource, children, item, sourceName, style, isDragging, ...props} = this.props;
        const dragStyle = isDragging ? draggingStyles : regularStyles;
        return connectDragSource(<tr style={{...style, ...dragStyle}} {...props}>{children}</tr>);
    };
}

export const RegularRow = ({children, item, sourceName, ...props}) => (<tr {...props}>{children}</tr>);

export default DragSource('TableRow', {
    beginDrag(props) {
        return {
            item: props.item,
            sourceName: props.sourceName
        };
    }
}, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))(DraggableRow);
