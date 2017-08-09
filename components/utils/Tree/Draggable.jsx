import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragSource} from 'react-dnd';
import {getEmptyImage} from 'react-dnd-html5-backend';

const draggingStyles = {
    opacity: 0.4
};

const regularStyles = {
    opacity: 1
};

class DraggableLeaf extends Component {
    static propTypes = {
        connectDragSource: PropTypes.func,
        connectDragPreview: PropTypes.func,
        isDragging: PropTypes.bool,
        enableDragPreview: PropTypes.bool
    };

    componentDidMount() {
        if (this.props.enableDragPreview) {
            // Use empty image as a drag preview so browsers don't draw it
            // and we can draw whatever we want on the custom drag layer instead.
            this.props.connectDragPreview(getEmptyImage(), {
                // IE fallback: specify that we'd rather screenshot the node
                // when it already knows it's being dragged so we can hide it with CSS.
                captureDraggingState: true
            });
        }
    }

    render() {
        const {connectDragSource, style, isDragging, children} = this.props;
        const dragStyle = isDragging ? draggingStyles : regularStyles;

        return connectDragSource(<span style={{...style, ...dragStyle}}>{children}</span>)
    };
}

const spec = {
    beginDrag(props) {
        return {
            item: props.item,
            sourceName: props.sourceName
        };
    }
};

const collect = (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
});

export default DragSource('TreeLeaf', spec, collect)(DraggableLeaf);
