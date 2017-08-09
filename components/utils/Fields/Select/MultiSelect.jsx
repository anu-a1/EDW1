import React from 'react';
import Select from 'react-select';
import {FormGroup, ControlLabel} from "react-bootstrap";
import _ from 'lodash';

import selectDefaultProps from './_defaultProps';
import Checkbox from '../FormCheckbox';

const ALL_ID = '__all__';

class MultiSelectClass extends Select {

    componentWillReceiveProps (nextProps) {
        const {labelKey, valueKey} = nextProps;

        this.setState({
            allChecked: nextProps.value.length === nextProps.options.length
        });

        if (nextProps.options && nextProps.options.length > 1) {
            nextProps.options.unshift({
                [valueKey]: ALL_ID,
                [labelKey]: 'All'
            });
        }
        super.componentWillReceiveProps(nextProps);
    }

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

    getValueLabel = ({id, values, labelKey}) => {
        let visibleValues = [];

        if (this.props.options.length - 1 === values.length) {
            visibleValues.push('All');
        } else {
            for (let i = 0, len = values.length; i < len; i += 1) {
                visibleValues.push(values[i][labelKey]);
            }
        }

        return <div className="Select-custom-value">
            <span className="Select-value-custom-label" role="option" aria-selected="true" id={id}>
                {visibleValues.join(', ')}
			</span>
        </div>;
    };

    getOptionLabel = (option, i) => {
        const {value, valueKey, labelKey} = this.props;
        var valueArray = this.getValueArray(value);
        let checked = _.findIndex(valueArray, val => (val[valueKey] === option[valueKey])) >= 0;
        if (option[valueKey] === ALL_ID && this.state.allChecked) {
            checked = true;
        }
        return <Checkbox name={`Select-options[${i}]`}
                         id={`Select-option-checkbox-${this._instancePrefix}-${i}`}
                         defaultValue={checked}
                         defaultChecked={checked}
                         labelValue={option[labelKey]}
                         isBold={option[valueKey] === ALL_ID}
                         onChange={(e) => {e.preventDefault();}}
            />;
    };

    selectValue = (option) => {
        const {value, valueKey, options} = this.props;
        const isAllClicked = option[valueKey] === ALL_ID;
        const checked = !isAllClicked && _.findIndex(value, val => (val[valueKey] === option[valueKey]));

        if (isAllClicked) {
            const optionsToProceed = this.state.allChecked ? [] : options.filter(item => item[valueKey] !== ALL_ID);
            return this.setState((state) => ({
                allChecked: !state.allChecked
            }), () => this.setValue(optionsToProceed));
        }

        this.setState({
            allChecked: option.length === value.length + 1
        }, () => checked >= 0 ? this.removeValue(option) : this.addValue(option));

    };

    removeValue = (value) => {
        const valueArray = this.getValueArray(this.props.value);
        const withoutSelected = valueArray.filter(i => !_.isEqual(i, value));
        this.setValue(withoutSelected);
    };
}

export default ({name, label, onChange, ...selectProps}) => {
    const changeDecorator = (options) => {
        const decoratedOptions = _.filter(options, item => (item[selectDefaultProps.valueKey] !== ALL_ID));
        onChange(decoratedOptions);
    };
    const props = {
        ...selectProps,
        ...selectDefaultProps,
        multi: true,
        searchable: false,
        backspaceRemoves: false,
        filterOptions: false,
        //inputProps: {className: 'hidden'},
        onChange: changeDecorator//,
        //inputRenderer: (props) => (<div
        //    {...props}
        //    tabIndex={10}
        //    role="combobox"
        //    style={{ border: 0, width: 1, display:'inline-block' }}
        //    ><input type="hidden"/></div>)
    };
    return <FormGroup controlId={name}>
        <ControlLabel>{label}</ControlLabel>
        <MultiSelectClass {...props} />
    </FormGroup>;
};
