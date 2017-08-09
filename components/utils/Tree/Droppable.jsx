import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';


const dropActiveStyles = {
    color: '#ffffff',
    background: '#58C557'
};

const regularStyles = {
    background: ""
};


const DroppableLeaf  = ({canDrop, isOver, connectDropTarget, children, style}) => {
    const isActive = canDrop && isOver;
    const dropStyles = isActive ? dropActiveStyles : regularStyles;
    return connectDropTarget(<span style={{...style, ...dropStyles}}>{children}</span>)
};

DroppableLeaf.propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    onDrop: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired
};

const spec = {
    drop(props, monitor) {
        props.onDrop(props.children.props.item, monitor.getItem());
    },
    canDrop(props, monitor) {
        const {item, sourceName} = monitor.getItem();
        const dropDst = props.children.props.item;

        if (sourceName === 'calculated') {
            return false;
        }

        if (dropDst.id === item.id) {
            return false;
        }

        //TODO: clarify if we need this
        //if ((item.childs || []).indexOf(dropDst.id) >= 0) {
        //    return false;
        //}

        return true;
    }
};

const collect = (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
});

export default DropTarget(['TableRow', 'TreeLeaf'], spec, collect)(DroppableLeaf);