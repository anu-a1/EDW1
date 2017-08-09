import React, {Component} from 'react';
import _ from 'lodash';
import {Tabs, Tab, FormGroup, ControlLabel, FormControl, HelpBlock} from "react-bootstrap";
import ClickOutside from 'react-click-outside';

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
        this.setState({
            pickerState: ''
        });
    };

    hidePicker = () => {
        this.setState({
            pickerState: 'hidden'
        });
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
                    <ClickOutside onClickOutside={this.hidePicker}>
                    <FormGroup className="picker-input-group" controlId="year" validationState={validationState}>
                        <ControlLabel>{labelText}</ControlLabel>
                        <FormControl
                            value={this.state.value}
                            onFocus={this.showPicker}
                            placeholder={placeholderText}/>
                        {validationText && <HelpBlock>{validationText}</HelpBlock>}
                        <FormControl.Feedback>
                            <span className="icon-calendar"/>
                        </FormControl.Feedback>
                    </FormGroup>
                    <div className={`picker ${this.state.pickerState}`} style={{width: pickerWidth}}>
                        
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
                </div>
                :
                null
        );
    };
}