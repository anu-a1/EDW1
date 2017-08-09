import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class ClickOutside extends Component {

    static propTypes = {
        onClickOutside: PropTypes.func.isRequired
    };

    componentDidMount() {
        document.addEventListener('click', this.handle, true);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handle, true);
    }

    getContainer = ref => this.container = ref;

    handle = e => {
        const {onClickOutside} = this.props;
        const el = this.container;
        !el.contains(e.target) && onClickOutside(e);
    };

    render() {
        const { children, onClickOutside, ...props } = this.props;
        return <div {...props} ref={this.getContainer}>{children}</div>
    };
}