import React from 'react';
import {FormControl} from 'react-bootstrap';
import _ from 'lodash';

class TextInput extends React.Component {

    constructor() {
        super();
        this.handleChange = this.handleChange.bind(this);
    }

    delayedCallback = _.debounce((e) => {
        this.props.onChange(e.target.value.toLowerCase());
    }, 200);

    handleChange(e) {
        e.persist();
        this.delayedCallback(e);
    }

    render() {
        const {value} = this.props;
        return (
            <FormControl className="TextInputField"
                         type="text"
                         onChange={this.handleChange}
                         value={value}
            />
        );
    }
}

export default TextInput;