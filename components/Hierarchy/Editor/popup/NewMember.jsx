import React from 'react';
import _ from 'lodash';
import {Modal, Button, FormControl, FormGroup, ControlLabel, HelpBlock, Alert} from "react-bootstrap";

import ConfirmAndLock from './ConfirmAndLock';
import Radio from '../../../utils/Fields/FormRadio';
import PopupButton from './_Button';
import {serverError} from '../../../../utils/errorTransform';


class NewMember extends React.Component {

    static defaultProps = {
        typeOptions: [{
            value: 0,
            label: "None",
            isDefault: true,
            includedDimensions: ['all'],
            excludedDimensions: ['account']
        }, {
            value: 1,
            label: "Numeric",
            includedDimensions: ['account'],
            excludedDimensions: []
        }, {
            value: 2,
            label: "Calculated",
            includedDimensions: [],
            excludedDimensions: []
        }, {
            value: 3,
            label: "Textual",
            includedDimensions: ['account'],
            excludedDimensions: []
        }],
        messages: {
            onFormSaveError: '%error%',
            requiredFieldsError: '',
            requiredFieldItemError: 'Fill this required field',
            formLoading: 'Loading...',
            onFormSaveSuccess: 'New member "%name%" was successfully created.'
        }
    };

    state = {
        typeOptions: []
    };

    get validState() {
        return {
            codeState: null,
            codeHelp: null,

            nameState: null,
            nameHelp: null,

            typeState: null,
            typeHelp: null,

            formState: null, //one of: "success", "warning", "danger", "info"
            formHelp: null
        };
    };

    componentWillMount() {
        const types = this.getTypes();
        this.setState({
            ...types,
            validationState: this.validState
        });
    };

    getTypes = () => {
        const dimensionName = this.props.dimensionName.label;
        const typeOptions = _.filter(this.props.typeOptions, item => {
            const included = _.intersection(item.includedDimensions, [dimensionName.toLowerCase(), 'all']);
            const excluded = _.intersection(item.excludedDimensions, [dimensionName.toLowerCase()]);

            return included.length > 0 && excluded.length === 0;
        });
        return {dimensionName, typeOptions};
    };

    getFormData = () => {
        const elements = this.formRef.elements;
        return {
            code: elements.code.value,
            dimensionName: this.state.dimensionName,
            name: elements.name.value,
            type: parseInt(elements.type.value, 10)
        };
    };

    requiredFieldsValidation = (data) => {
        const error = !(data.type >= 0) || !data.name || !data.code;
        const validState = this.validState;
        const messages = this.props.messages;
        return error ? {
            ...validState,
            typeState: !(data.type >= 0) ? null : 'error',
            typeHelp: !(data.type >= 0) ? null : messages.requiredFieldItemError,
            nameState: data.name ? null : 'error',
            nameHelp: data.name ? null : messages.requiredFieldItemError,
            codeState: data.code ? null : 'error',
            codeHelp: data.code ? null : messages.requiredFieldItemError,
            formState: 'danger',
            formHelp: messages.requiredFieldsError
        } : null;
    };

    onSubmit = (event) => {
        event.preventDefault();
        const data = this.getFormData();
        const validState = this.validState;

        const requiredFieldsError = this.requiredFieldsValidation(data);
        if (requiredFieldsError) {
            this.setState({validationState: requiredFieldsError});
            return false;
        }

        this.setState({
            validationState: {
                ...validState,
                formHelp: this.props.messages.formLoading,
                formState: 'info'
            }
        });

        this.props.onSave(data).then(this.onFormSaved);

        return false;
    };

    onFormSaved = ({err, newMember}) => {
        const validState = this.validState;
        const {messages} = this.props;
        const formHelp = err ? serverError({
            content: err,
            template: messages.onFormSaveError
        }) : null;

        this.setState({
            validationState: {
                ...validState,
                formState: err ? 'danger' : 'success',
                formHelp: err ? formHelp.content : null
            }
        });
        if (!err) {
            this.props.onHide();
            this.props.notify({
                content: messages.onFormSaveSuccess.replace('%name%', newMember.name),
                type: 'success'
            });
        }
    };

    resetErrors = () => {
        this.setState({validationState: this.validState});
    };

    render() {
        const {validationState, typeOptions} = this.state;

        return (
            <Modal show={this.props.show} onHide={this.props.onHide}
                   aria-labelledby="contained-modal-title-lg">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">Create Unused Dimension Member</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form
                        onSubmit={this.onSubmit}
                        ref={(el) => { this.formRef = el; }}>

                        {/* Form status */}
                        {validationState.formHelp ? <Alert bsStyle={validationState.formState} onDismiss={this.resetErrors}>
                            <p>{validationState.formHelp}</p>
                        </Alert> : null}

                        {/* Code */}
                        <FormGroup controlId="code" validationState={validationState.codeState}>
                            <ControlLabel>New Member Code</ControlLabel>
                            <FormControl
                                type="text"
                                placeholder="Type member code" />
                            <HelpBlock>{validationState.codeHelp}</HelpBlock>
                        </FormGroup>

                        {/* Name */}
                        <FormGroup controlId="name" validationState={validationState.nameState}>
                            <ControlLabel>New Member Name</ControlLabel>
                            <FormControl
                                type="text"
                                placeholder="Type member name" />
                            <HelpBlock>{validationState.nameHelp}</HelpBlock>
                        </FormGroup>

                        {/* Type */}
                        <FormGroup controlId="type"
                                   className={typeOptions.length > 1 ? '' : 'hidden'}
                            >
                            <ControlLabel>Type</ControlLabel>
                            <div className="form-group-radio-btn">
                                {_.map(typeOptions, (option, index) => {
                                    return <Radio name="type"
                                                  id={`radio-${option.value}-${index}`}
                                                  key={`${option.value}-${index}`}
                                                  labelValue={option.label}
                                                  defaultValue={option.value}
                                                  defaultChecked={index === 0}
                                                  />
                                })}
                            </div>
                        </FormGroup>

                        <div className="modal-buttons">
                            <Button onClick={this.props.onHide}>Cancel</Button>
                            <Button bsStyle="primary" type="submit">Create</Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        );
    };
}

class NewMemberButton extends PopupButton {

    componentWillMount() {
        this.setState({
            isLocked: this.props.isLocked,
            confirmed: false
        });
    };

    componentWillReceiveProps (nextProps) {
        if (nextProps.isLocked !== this.state.isLocked) {
            this.setState({
                confirmed: false,
                show: nextProps.isLocked && this.state.confirmed,
                isLocked: nextProps.isLocked
            });
        }
    };

    getFormComponent() {
        return this.state.isLocked ? NewMember : ConfirmAndLock;
    };

    onConfirm = () => {
        this.props.onConfirm && this.props.onConfirm();
        this.setState({confirmed: true});
    };

    getButton() {
        return (<Button disabled={this.props.disabled}
                        className="btn-dark"
                        onClick={this.onOpen}>
            <span className="icon-calc-plus-btns"/>
            Create New Member
        </Button>);
    };

}

export default NewMemberButton;
