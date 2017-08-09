import React from 'react';
import PropTypes from 'prop-types';
import {Tooltip as BsTooltip, OverlayTrigger} from 'react-bootstrap';

const defaultText = (component) => ({
    'sub-Checkbox': 'Select All'
}[component]);

const Tooltip = ({tooltipProps, text, children, placement='bottom', active=true}) => {

    const tooltipOverlay = <BsTooltip id="tooltip">{
        text ? text : defaultText(tooltipProps.component)
    }</BsTooltip>;

    return active ? (
        <OverlayTrigger overlay={tooltipOverlay} placement={placement}>
            {children}
        </OverlayTrigger>
    ) : (
        <div className="disabled-tooltip">{children}</div>
    );
};

Tooltip.propTypes = {
    children: PropTypes.element.isRequired,
    tooltipProps: PropTypes.object,
    text: PropTypes.string,
    placement: PropTypes.string
};

export default Tooltip;