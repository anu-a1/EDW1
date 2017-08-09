import React from 'react';
import {Modal, Button, FormControl, FormGroup, ControlLabel, HelpBlock, Alert} from "react-bootstrap";

import {serverError} from '../../../../utils/errorTransform';
import Checkbox from '../../../utils/Fields/FormCheckbox';
import PopupButton from './_Button';

class AddNewAttr extends React.Component {

    static defaultProps = {
        messages: {
            onFormSaveError: '%error%',
            requiredFieldsError: '',
            requiredFieldItemError: 'Fill this required field',
            formLoading: 'Loading...',
            onFormSaveSuccess: 'New attribute "%name%" was successfully created.'
        }
    };

    state = {
        isLoading: false
    };

    componentWillMount() {
        this.setState({
            validationState: this.validState
        });
    }

    get validState() {
        return {
            nameState: null,
            nameHelp: null,

            formState: null, //one of: "success", "warning", "danger", "info"
            formHelp: null
        };
    };

    onSubmit = (event) => {
        event.preventDefault();

        const data = this.getFormData();
        const requiredFieldsError = this.requiredFieldsValidation(data);

        if (requiredFieldsError) {
            this.setState({validationState: requiredFieldsError});
            return false;
        }
        const validState = this.validState;

        this.setState({
            validationState: {
                ...validState,
                formState: 'info',
                formHelp: 'Loading...'
            },
            isLoading: true
        });

        this.props.onSave(data).then(this.onFormSaved);

        return false;
    };

    onFormSaved = ({err, newAttribute}) => {
        const validState = this.validState;
        const {messages} = this.props;
        const formHelp = err ? serverError({
            content: err,
            template: messages.onFormSaveError
        }) : null;

        this.setState({
            validationState: {
                ...validState,
                formState: err ? 'danger' : null,
                formHelp: err ? formHelp.content : null
            },
            isLoading: false
        });

        if (!err) {
            this.props.onHide();
            this.props.notify({
                content: messages.onFormSaveSuccess.replace('%name%', newAttribute.name),
                type: 'success'
            });
        }
    };

    getFormData = () => {
        const elements = this.formRef.elements;

        return {
            attributeName: elements.attrName.value,
            isCommonAcrossViews: elements.attrCommon.checked
        };
    };

    requiredFieldsValidation = (data) => {
        const error = data.attributeName.length < 3;
        const validState = this.validState;
        const messages = this.props.messages;
        return error ? {
            ...validState,
            nameState: error ? 'error' : null,
            nameHelp: error ? messages.requiredFieldItemError : null
        } : null;
    };

    resetErrors = () => {
        this.setState({validationState: this.validState});
    };

    render() {
        const {validationState, isLoading} = this.state;
        return (
            <Modal show={this.props.show} onHide={this.props.onHide}
                   aria-labelledby="contained-modal-title-lg">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">Add New Attribute</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form
                        onSubmit={this.onSubmit}
                        ref={(el) => { this.formRef = el; }}>

                        {/* Form status */}
                        {validationState.formHelp ? <Alert bsStyle={validationState.formState} onDismiss={this.resetErrors}>
                            <p>{validationState.formHelp}</p>
                        </Alert> : null}

                        {/* New Attr name */}
                        <FormGroup controlId="attrName" validationState={validationState.nameState}>
                            <ControlLabel>New Attribute Name</ControlLabel>
                            <FormControl
                                type="text"
                                placeholder="Type attribute name" />
                            <HelpBlock>{validationState.nameHelp}</HelpBlock>
                        </FormGroup>

                        <div className="form-checkbox">
                            <Checkbox
                                labelValue="Common across views"
                                name="attrCommon"/>
                        </div>

                        <div className="modal-buttons">
                            <Button onClick={this.props.onHide}>Cancel</Button>
                            <Button bsStyle="primary"
                                    disabled={isLoading}
                                    type="submit">Add</Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        );
    };
}

class AddNewAttrButton extends PopupButton {

    formComponent = AddNewAttr;

    getButton () {
        return (<Button onClick={this.onOpen} className="btn-shadow">Add New</Button>);
    };

}

export default AddNewAttrButton;
