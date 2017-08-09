import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {FormGroup, ControlLabel, FormControl, HelpBlock} from 'react-bootstrap';

/**
 * TODO: get rid of this component
 * @deprecated
 */
const FieldGroup = ({ id, label, help, options, validationState, ...props }) => {
    return (
        <FormGroup controlId={id} validationState={validationState}>
            <ControlLabel>{label}</ControlLabel>
            {props.componentClass === 'select' ? (
                <FormControl {...props} >
                    {options && (<option key={-1} value={null}>{props.placeholder}</option>)}
                    {options && _.map(options, (option, index) => {
                        return (<option key={index} value={option}>{option}</option>);
                    })}
                </FormControl>
            ) : (<FormControl {...props} />)}
            {help && <HelpBlock>{help}</HelpBlock>}
        </FormGroup>
    );
};

FieldGroup.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    help: PropTypes.string,
    options: PropTypes.array
};

export default FieldGroup;
