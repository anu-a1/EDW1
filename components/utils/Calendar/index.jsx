import React, {Component} from 'react';
import _ from 'lodash';
import {Tabs, Tab, FormGroup, ControlLabel, FormControl, HelpBlock} from "react-bootstrap";

import ClickOutside from '../ClickOutside';
import date from './picker/Date';
import month from './picker/Month';
import year from './picker/Year';

export default class Calendar extends Component {

    state = {
        value: '',
        pickerState: 'hidden'
    };

    static defaultProps = {
        show: true,
        placeholderText: "Select Year"
    };

    onChange = (dateObj, originOnChange) => {
        this.setState({
            value: dateObj.value,
            pickerState: 'hidden'
        }, () => {
            originOnChange && originOnChange(dateObj);
        });
    };

    pickerFactory = (pickerName) => {
        const Component = {date, month, year}[pickerName] || function() { return <p>Invalid Picker</p> };
        const props = this.props;
        const {onChange} = props;
        const componentProps = {
            ...props,
            onChange: value => (this.onChange(value, onChange))
        };
        return <Component {...componentProps}/>
    };

    showPicker = () => {
        this.setState({pickerState: ''});
    };

    hidePicker = () => {
        this.setState({pickerState: 'hidden'});
    };

    render() {
        const {
            defaultActive, views, show, labelText, pickerWidth, 
            validationState, validationText, placeholderText
        } = this.props;
        const isMultiPicker = _.isArray(views);
        return (
            show ?
                <div className="picker-wrap">
                        <FormGroup className="picker-input-group"
                                   controlId="year"
                                   validationState={validationState}>
                            <ControlLabel>{labelText}</ControlLabel>
                            <ClickOutside className="click-inside-area"
                                          onClickOutside={this.hidePicker}>
                                <FormControl
                                    readOnly
                                    value={this.state.value}
                                    onFocus={this.showPicker}
                                    placeholder={placeholderText}/>

                                <span className="input-block-addon icon-calendar"
                                      onClick={this.state.pickerState ? this.showPicker : this.hidePicker}/>

                                <div className={`picker ${this.state.pickerState}`}
                                     style={{width: pickerWidth}}>
                                    {
                                        isMultiPicker ?

                                            <Tabs defaultActiveKey={defaultActive}
                                                  id="picker-switch" className="picker-tabs">
                                                {_.map(views, (name, index) => {
                                                    return (
                                                        <Tab key={index} eventKey={name} title={_.upperFirst(name)}>
                                                            {this.pickerFactory(name)}
                                                        </Tab>
                                                    );
                                                })}
                                            </Tabs>
                                            :
                                            this.pickerFactory(views)
                                    }
                                </div>
                            </ClickOutside>
                            {validationText && <HelpBlock>{validationText}</HelpBlock>}
                        </FormGroup>
                </div>
                :
                null
        );
    };
}