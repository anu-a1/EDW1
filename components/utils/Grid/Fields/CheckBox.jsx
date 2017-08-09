import React from 'react';
import Tooltip from '../../Tooltip';
import FormCheckbox from '../../Fields/FormCheckbox';

const CheckBox = ({tooltip, onChange, value, id}) => {

    const handleChange = (e) => {
        onChange(e.target.checked);
    };

    const InputField = <FormCheckbox id={id} onChange={handleChange} defaultValue={value}/>;

    return (
        tooltip ?
            <Tooltip tooltipProps={tooltip}>
                <div className="tooltip-wrap">
                    {InputField}
                </div>
            </Tooltip>
            :
            <span>
                {InputField}
            </span>
    );
};

export default CheckBox;