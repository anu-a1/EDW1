import React, {Component} from 'react';
import {Button} from "react-bootstrap";

class PopupButton extends Component {
    state = {
        show: false
    };

    onClose = () => this.setState({show: false});

    onOpen = () => this.setState({show: true});

    getFormComponent () {
        return null;
    };

    onConfirm = (data) => {
        this.props.onConfirm && this.props.onConfirm(data);
    };

    getButton () {
        return <Button onClick={this.onOpen}>Default Button</Button>
    };

    render() {
        const FormComponent = this.formComponent || this.getFormComponent();
        const {className, ...props} = this.props;
        return (
            <div className={`${className || ''} popup-button-wrapper`}>
                {this.getButton()}
                {this.state.show && <FormComponent {...props}
                    onConfirm={this.onConfirm}
                    show={this.state.show}
                    onHide={this.onClose}
                    />}
            </div>
        );
    };
}

export default PopupButton;