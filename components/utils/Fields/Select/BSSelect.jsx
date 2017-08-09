import React, {PureComponent} from 'react';
import {DropdownButton, MenuItem} from 'react-bootstrap';
import PropTypes from 'prop-types';
import _ from 'lodash';

class BSSelect extends PureComponent {

    static defaultProps = {
        valueKey: 'value',
        labelKey: 'label'
    };

    static propTypes = {
        options: PropTypes.array.isRequired,
        valueKey: PropTypes.string.isRequired,
        labelKey: PropTypes.string.isRequired
    };

    onItemClick = (item, index) => e => {
        this.props.onChange && this.props.onChange(item);
    };

    render() {
        const {options, valueKey, labelKey, value, placeholder} = this.props;
        const itemToDisplay = _.find(options, option => option[valueKey] === value);

        return (
            <div className="bs-select-wrap">
                <DropdownButton
                    className="bs-select"
                    dropup={true}
                    bsStyle="default"
                    title={itemToDisplay ? itemToDisplay[labelKey] : placeholder}
                    id="bs-select-dropdown">
                    {
                        options.map((item, index) => (
                            <MenuItem
                                eventKey={index}
                                key={index}
                                active={itemToDisplay && itemToDisplay[valueKey] === item[valueKey]}
                                onClick={this.onItemClick(item, index)}>
                                {item[labelKey]}
                            </MenuItem>
                        ))
                    }
                </DropdownButton>
            </div>
        );
    }
}

export default BSSelect;