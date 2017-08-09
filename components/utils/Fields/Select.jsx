import React from 'react';
import Select, {Creatable} from 'react-select';
import Checkbox from './FormCheckbox';
import {FormGroup, ControlLabel, HelpBlock} from "react-bootstrap";
import 'react-select/dist/react-select.css';
import _ from 'lodash';


const selectDefaultProps = {
    clearableValue: false,
    isValidNewOption: () => (false),
    clearable: false,
    searchable: true,
    matchProp: 'label',
    labelKey: 'label',
    valueKey: 'value'
};

export class StateFullSelectView extends React.Component {

    static defaultProps = {
        ...selectDefaultProps
    };

    state = {
        option: null
    };

    get value() {
        const {option} = this.state;
        return option && option.value;
    };

    get selectedOption() {
        return this.state.option;
    };

    onChange = (option, outerOnChange) => {
        this.setState({option}, () => {
            outerOnChange && outerOnChange();
        });
    };

    render () {
        const {onChange, label, validationState, help, ...props} = this.props;
        const selectProps = {
            ...props,
            value: this.state.option,
            onChange: option => (this.onChange(option, onChange))
        };
        return <FormGroup controlId={props.name} validationState={validationState}>
            <ControlLabel>{label}</ControlLabel>
            <Creatable {...selectProps} />
            {help && <HelpBlock>{help}</HelpBlock>}
        </FormGroup>;
    };
}

class MultiSelectClass extends Select {

    renderValue = (valueArray) => {
        if (!valueArray.length) {
            return !this.state.inputValue ? <div className="Select-placeholder">{this.props.placeholder}</div> : null;
        }

        return this.getValueLabel({
            id: this._instancePrefix + '-value',
            valueKey: this.props.valueKey,
            labelKey: this.props.labelKey,
            maxVisibleValuesCount: this.props.maxVisibleValuesCount,
            values: valueArray
        });
    };

    getValueLabel = ({id, values, maxVisibleValuesCount, labelKey}) => {
        let visibleValues = [];
        const dots = values.length > maxVisibleValuesCount ? '...' : '';

        for (let i = 0, len = values.length > maxVisibleValuesCount ? maxVisibleValuesCount : values.length;
             i < len; i += 1
        ) {
            visibleValues.push(values[i][labelKey]);
        }
        return <div className="Select-custom-value">
            <span className="Select-value-custom-label" role="option" aria-selected="true" id={id}>
                {visibleValues.join(', ') + dots}
			</span>
        </div>;
    };

    getOptionLabel = (option, i) => {
        const {value, valueKey, labelKey} = this.props;
        var valueArray = this.getValueArray(value);
        const checked = _.findIndex(valueArray, val => (val[valueKey] === option[valueKey]));
        return <Checkbox name={`Select-options[${i}]`}
                      id={`Select-option-checkbox-${this._instancePrefix}-${i}`}
                      defaultValue={checked >= 0}
                      defaultChecked={checked >= 0}
                      labelValue={option[labelKey]}
                      onChange={(e) => {e.preventDefault();}}
                />;
    };

    selectValue = (option) => {
        const {value, valueKey} = this.props;
        const checked = _.findIndex(value, val => (val[valueKey] === option[valueKey]));
        return checked >= 0 ? this.removeValue(option) : this.addValue(option);
    };

    removeValue = (value) => {
        var valueArray = this.getValueArray(this.props.value);
        this.setValue(valueArray.filter(i => !_.isEqual(i, value)));
    };
}

export const MultiSelect = ({name, label, ...selectProps}) => {
    const props = {
        ...selectProps,
        ...selectDefaultProps,
        multi: true,
        searchable: false,
        backspaceRemoves: false,
        filterOptions: false,
        maxVisibleValuesCount: 3,
        inputProps: {className: 'hidden'}
    };
    return <FormGroup controlId={name}>
        <ControlLabel>{label}</ControlLabel>
        <MultiSelectClass {...props} />
    </FormGroup>;
};

const LabelComponent = ({label, isLockedForImport, isGeneric}) => (
    <div>
        {label}&nbsp;
        {isGeneric ? "[GC]" : "[MY]"}&nbsp;&nbsp;
        {isLockedForImport && <span className="icon-lock" />}
    </div>
);

export const CaseSelect = ({name, label, disableLocked, casePeriod, ...selectProps}) => {
    const props = {
        ...selectDefaultProps,
        ...selectProps,
        options: _.map(selectProps.options || [], option => ({
            value: option.id,
            label: option.name || '',
            isGeneric: option.isGeneric,
            isLockedForImport: option.isLockedForImport,
            disabled: disableLocked && !!option.isLockedForImport
        })),
        optionRenderer: LabelComponent,
        valueRenderer: LabelComponent
    };
    return <FormGroup controlId={name}>
        <ControlLabel>{label}</ControlLabel>
        <Creatable {...props} />
        {casePeriod && <span className="label-period">{casePeriod}</span> }
    </FormGroup>;
};

export default (selectProps) => {
    const props = {
        ...selectProps,
        ...selectDefaultProps
    };
    return <Creatable {...props} />;
};
