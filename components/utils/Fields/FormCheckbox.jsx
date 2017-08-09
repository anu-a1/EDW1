import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';

const Checkbox = ({
    name,
    labelValue,
    defaultChecked,
    defaultValue,
    id,
    isBold,
    onChange
}) => {
    const elemId = id || shortid.generate();
    const inputName = name || '';
    const decoratedLabel = isBold ? <strong>{labelValue}</strong> : labelValue;
    return (

        <div className="checkbox">
            {
                onChange ?
                    <input type="checkbox" id={elemId} onChange={onChange} checked={!!defaultValue} name={inputName}/>
                    :
                    <input type="checkbox" id={elemId} defaultValue={defaultValue} name={inputName} defaultChecked={defaultChecked}/>
            }
            <label className="control-label" htmlFor={elemId}>{decoratedLabel || ''}</label>
        </div>
    );
};

Checkbox.propTypes = {
    name: PropTypes.string,
    id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    labelValue: PropTypes.string,
    defaultValue: PropTypes.bool,
    defaultChecked: PropTypes.bool
};

export default Checkbox;