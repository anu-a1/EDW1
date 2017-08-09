import React from 'react';
import {Creatable} from 'react-select';
import {FormGroup, ControlLabel, HelpBlock} from "react-bootstrap";

import selectDefaultProps from './_defaultProps';

export default class StateFullSelectView extends React.Component {

    static defaultProps = {
        ...selectDefaultProps
    };

    state = {
        option: null
    };

    get value() {
        const {option} = this.state;
        return option && option[this.props.valueKey];
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