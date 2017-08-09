import React from 'react';
import PropTypes from 'prop-types';

const Radio = ({name, labelValue, defaultChecked, defaultValue, id}) => {
    return (
        <div className="radio">
            <input type="radio" id={id} defaultValue={defaultValue} name={name} defaultChecked={defaultChecked}/>
            <label className="control-label" htmlFor={id}>{labelValue}</label>
        </div>
    );
};

Radio.propTypes = {
    name: PropTypes.string.isRequired,
    labelValue: PropTypes.string,
    defaultValue: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.string,
        PropTypes.number
    ]),
    defaultChecked: PropTypes.bool
};

export default Radio;