import React from 'react';
import {Creatable} from 'react-select';
import {FormGroup, ControlLabel} from "react-bootstrap";
import _ from 'lodash';

import selectDefaultProps from './_defaultProps';

const LabelComponent = ({label, isLockedForImport, isGeneric}) => (
    <div>
        {label}&nbsp;
        {isGeneric ? "[GC]" : "[MY]"}&nbsp;&nbsp;
        {isLockedForImport && <span className="icon-lock" />}
    </div>
);

export default ({name, label, disableLocked, dismissLocked, casePeriod, ...selectProps}) => {
    let options = [];
    let option;
    for (let i = 0, len = selectProps.options.length; i < len; i += 1) {
        option = {
            value: selectProps.options[i].id,
            label: selectProps.options[i].name || '',
            isGeneric: selectProps.options[i].isGeneric,
            isLockedForImport: selectProps.options[i].isLockedForImport,
            disabled: disableLocked && !!selectProps.options[i].isLockedForImport,
            dismiss: dismissLocked && !!selectProps.options[i].isLockedForImport
        };
        if (!option.dismiss) {
            options.push(option);
        }
    }

    const props = {
        ...selectDefaultProps,
        ...selectProps,
        options: _.sortBy(options, 'label'),
        optionRenderer: LabelComponent,
        valueRenderer: LabelComponent
    };
    return <FormGroup controlId={name}>
        <ControlLabel>{label}</ControlLabel>
        <Creatable {...props} />
        {casePeriod && <span className="label-period">{casePeriod}</span> }
    </FormGroup>;
};