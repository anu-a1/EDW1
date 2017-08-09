import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';

const dropActiveStyles = {
    background: "#edf3f7"
};

const regularStyles = {
    background: ""
};

const Equation  = ({canDrop, isOver, connectDropTarget, children, style}) => {
    const isActive = canDrop && isOver;
    const dropStyles = isActive ? dropActiveStyles : regularStyles;
    return connectDropTarget(<div style={{...style, ...dropStyles}}>{children}</div>);
};

Equation.propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    onDrop: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired
};

const spec = {
    drop(props, monitor) {
        props.onDrop(monitor.getItem());
    }
};

const collect = (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
});

export default DropTarget('TreeLeaf', spec, collect)(Equation);