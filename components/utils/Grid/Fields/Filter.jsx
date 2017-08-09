import React from 'react';
import {FormControl, InputGroup, DropdownButton, MenuItem} from 'react-bootstrap';
import DayPicker, {DateUtils} from 'react-day-picker';
import _ from 'lodash';
import moment from 'moment';
import cx from 'classnames';

import ClickOutside from '../../ClickOutside';

class FilterInput extends React.Component {

    static filterTypes = {
        contains: {
            title: "Contains",
            icon: <span className="icon-filter-contains"/>
        },
        startsWith: {
            title: "Starts with",
            icon: <span className="icon-filter-a-big-a"/>
        },
        equal: {
            title: "Equals",
            icon: <span className="icon-filter-equal"/>
        },
        endsWith: {
            title: "Ends with",
            icon: <span className="icon-filter-a-a-big"/>
        },
        notContains: {
            title: "Does not contain",
            icon: <span className="icon-filter-contains-none"/>
        },
        notStartsWith: {
            title: "Does not start with",
            icon: <span className="icon-filter-a-big-a-line"/>
        },
        notEqual: {
            title: "Not equals",
            icon: <span className="icon-filter-equal-none"/>
        },
        notEndWith: {
            title: "Does not end with",
            icon: <span className="icon-filter-a-a-big-line"/>
        }
    };

    state = {
        inputValue: this.props.value || '',
        type: 'startsWith',
        showPicker: false,
        from: null,
        to: null
    };

    setFilterType = (type) => (e) => {
        this.setState({
            type: type
        });
        this.props.onChange({
            value: this.state.inputValue,
            type: type
        });
    };

    delayedCallback = _.debounce((e) => {
        this.setState({
            inputValue: e.target.value.toLowerCase()
        });
        this.props.onChange({
            value: this.state.inputValue,
            type: this.state.type,
        });
    }, 200);

    handleChange = (e) => {
        e.persist();
        this.delayedCallback(e);
    };

    handleDayClick = day => {
        const {from, to} = DateUtils.addDayToRange(day, this.state);
        const fromFormat = from && moment(from).format('MM/DD/YYYY');
        const toFormat = to && moment(to).format('MM/DD/YYYY');

        this.setState({
            inputValue: `${fromFormat || ''} - ${toFormat || ''}`,
            from,
            to
        });

        if (from && to) {
            this.props.onChange({
                value: {from: fromFormat, to: toFormat},
                type: 'date'
            });
        }
    };

    onDateIconClick = () => {
        if (this.state.inputValue && !this.state.showPicker) {
            this.setState({inputValue: '', from: null, to: null});
            return this.props.onChange({
                value: {},
                type: this.state.type,
            });
        }
        this.togglePicker(!this.state.showPicker)();
    };

    togglePicker = show => e => {
        this.setState({
            showPicker: show
        });
    };

    render() {

        const { from, to, showPicker } = this.state;

        return (
            <InputGroup className={cx("filter-input", {
                'has-dropdown': this.props.fieldType !== 'date',
                'has-datepicker': this.props.fieldType === 'date'
            })}>
                {
                    this.props.fieldType !== 'date' &&
                    <DropdownButton
                        componentClass={InputGroup.Button}
                        id="filterInput-dropdown-addon"
                        className='filter-types'
                        title={this.constructor.filterTypes[this.state.type].icon}>

                        {_.map(this.constructor.filterTypes, (value, key) => (
                            <MenuItem onClick={this.setFilterType(key)} key={key}>
                                {value.icon} {value.title}
                            </MenuItem>
                        ))}
                    </DropdownButton>
                }
                {
                    this.props.fieldType !== 'date' ?
                        <FormControl type="text"
                                     onChange={this.handleChange}
                                     defaultValue={this.state.inputValue}/>
                        :
                        <ClickOutside onClickOutside={this.togglePicker(false)}>
                            <FormControl type="text"
                                         onFocus={this.togglePicker(true)}
                                         value={this.state.inputValue}/>
                            <div className={cx('filter-range-picker', {'hidden': !showPicker})}>
                                <DayPicker
                                    numberOfMonths={2}
                                    selectedDays={[from, {from, to}]}
                                    onDayClick={this.handleDayClick}
                                />
                            </div>
                            {
                                this.props.fieldType === 'date' ?
                                    <span onClick={this.onDateIconClick}
                                          className={cx("input-block-addon", {
                                              "icon-calendar": !this.state.inputValue || showPicker,
                                              "icon-clear": this.state.inputValue && !showPicker
                                          })}/>
                                    :
                                    null
                            }
                        </ClickOutside>
                }
            </InputGroup>
        );
    }
}

export default FilterInput;