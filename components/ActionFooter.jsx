import React from 'react';
import PropTypes from 'prop-types';

const ActionFooter = ({show, children}) => {
    return (
        show &&
        <div className="action-footer-wrapper">
            <div className='action-footer'>
                <div className="action-footer-buttons">
                    {children}
                </div>
            </div>
        </div>
    );
};

ActionFooter.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.element
    ]).isRequired,
    show: PropTypes.bool.isRequired
};

export default ActionFooter;