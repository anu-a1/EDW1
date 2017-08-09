import React from 'react';
import {Modal, Button, FormControl, FormGroup, ControlLabel, HelpBlock, Alert} from "react-bootstrap";
import _ from 'lodash';

import PopupButton from './_Button';

class CreateNewView extends React.Component {

    static defaultProps = {
        messages: {
            uniqueNameError: 'Name should be unique.',
            requiredFieldError: 'Fill this required field.',
            formLoading: 'Loading...',
            onFormSaveSuccess: 'New View "%name%" was successfully created.'
        }
    };

    state = {
        enableClearName: false,
        ...this.validState
    };

    get validState() {
        return {
            nameState: null,
            nameHelp: null,

            formState: null, //one of: "success", "warning", "danger", "info"
            formHelp: null
        };
    };

    requiredFieldsValidation = data => {
        const error = !data.name;
        const messages = this.props.messages;

        return error ? {
            ...this.validState,
            nameState: 'error',
            nameHelp: messages.requiredFieldError
        } : null;
    };

    uniqueNameValidation = data => {
        const {messages, views} = this.props;
        const error = _.findIndex(views, item => data.name.toLowerCase() === (item.viewName || '').toLowerCase()) >= 0;

        return error ? {
            ...this.validState,
            nameState: 'error',
            nameHelp: messages.uniqueNameError
        } : null;
    };

    resetErrors = () => this.setState({...this.validState});

    clearName = event => {
        event.preventDefault();
        let nameElement = this.formRef.elements.name;
        nameElement.value = '';
        nameElement.focus();
        this.setState({enableClearName: false});
    };

    onSubmit = event => {
        event.preventDefault();
        const elements = this.formRef.elements;
        const data = {
            name: elements.name.value
        };

        const requiredFieldsError = this.requiredFieldsValidation(data);
        if (requiredFieldsError) {
            this.setState({...requiredFieldsError});
            return false;
        }

        const uniqueNameError = this.uniqueNameValidation(data);
        if (uniqueNameError) {
            this.setState({...uniqueNameError});
            return false;
        }

        this.setState({...this.validState});
        this.props.createNewView(data);
        this.props.onHide();
        
        return false;
    };

    render() {
        const {show, onHide} = this.props;
        const {nameState, nameHelp, formState, formHelp, enableClearName} = this.state;
        return (
            <Modal show={show} onHide={onHide}
                   aria-labelledby="contained-modal-title-lg">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">Create New View</Modal.Title>
                </Modal.Header>
                <Modal.Body className="new-view-hierarchy-modal">
                    <form onSubmit={this.onSubmit}
                          ref={el => this.formRef = el}>

                        {/* Form status */}
                        {formHelp ? <Alert bsStyle={formState} onDismiss={this.resetErrors}>
                            <p>{formHelp}</p>
                        </Alert> : null}

                        {/* New Hierarchy Name */}
                        <FormGroup controlId="name" className="form-group-clear" validationState={nameState}>
                            <ControlLabel>New View Name</ControlLabel>
                            <FormControl type="text"
                                         onKeyUp={() => this.setState({enableClearName: true})}
                                         placeholder="Type New View"/>
                            <Button className="btn-clear"
                                    disabled={!enableClearName}
                                    onClick={this.clearName}>
                                <span className="icon-clear"/>
                            </Button>
                            <HelpBlock>{nameHelp}</HelpBlock>
                        </FormGroup>

                        <div className="modal-buttons">
                            <Button onClick={onHide}>Cancel</Button>
                            <Button bsStyle="primary" type="submit">Create</Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        );
    };
}

class CreateNewViewButton extends PopupButton {

    formComponent = CreateNewView;

    getButton() {
        return (
            <Button className="btn-dark"
                    onClick={this.onOpen}>
                <span className="icon-calc-plus-btns"/>
                Create New View
            </Button>);
    };

}

export default CreateNewViewButton;