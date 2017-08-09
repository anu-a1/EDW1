import React from 'react';
import {Modal, Button, FormControl, FormGroup, ControlLabel, HelpBlock, Alert} from "react-bootstrap";
import _ from 'lodash';

import Radio from '../utils/Fields/FormRadio';
import FieldGroup from '../utils/FieldGroup';
import {StateFullSelectView} from '../utils/Fields/Select';
import Calendar from '../utils/Calendar';
import {serverError} from '../../utils/errorTransform';

class CreateNewCase extends React.Component {

    static defaultProps = {
        maxNameLength: 20,
        messages: {
            onFormSaveError: 'Server error has occurred. Details: %error%',
            requiredFieldsError: '',
            requiredFieldItemError: 'Fill this required field',
            nameLengthFormError: '',
            removeRedundantCharsError: 'Remove %count% excess characters',
            formLoading: 'Loading...',
            onFormSaveSuccess: 'New Case "%name%" was successfully created.'
        }
    };

    state = {
        calendarOpened: false,
        yearValue: {
            format: 'YYYY',
            value: ''
        },
        validationState: this.validState
    };

    get validState() {
        return {
            financeTypeState: null,
            financeTypeHelp: null,

            yearState: null,
            yearHelp: null,

            versionState: null,
            versionHelp: null,

            formState: null, //one of: "success", "warning", "danger", "info"
            formHelp: null
        };
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.newCase !== this.props.newCase) {
            this.caseSaved(nextProps.newCase);
        }
    };

    shouldComponentUpdate(nextProps, nextState) {
        let shouldUpdate = this.state !== nextState;
        _.each(['show', 'newCase', 'types', 'years'], name => {
            shouldUpdate = this.props[name] !== nextProps[name] || shouldUpdate;
        });
        return shouldUpdate;
    };

    caseSaved = (newCase) => {
        const error = newCase && newCase.err;
        const validState = this.validState;
        const formHelp = error ? serverError({
            content: error,
            template: this.props.messages.onFormSaveError
        }) : null;

        this.setState({
            validationState: {
                ...validState,
                formState: error ? 'danger' : 'success',
                formHelp: error ? formHelp.content : null
            }
        }, () => {
            if (newCase.data) {
                this.props.onHide();
            }
            if (!error) {
                this.props.notify({
                    content: this.props.messages.onFormSaveSuccess.replace('%name%', newCase.data.name),
                    type: 'success'
                });
            }
        });
    };

    openCalendar = () => {
        this.setState({
            calendarOpened: true
        });
    };

    calendarChangeHandler = (date) => {
        this.setState({
            calendarOpened: false,
            yearValue: date
        });
    };

    validateOnTheFly = (event) => {
        event && event.preventDefault();
        const data = this.getFormData();

        const requiredFieldsError = this.requiredFieldsValidation(data);
        if (requiredFieldsError) {
            return false;
        }

        const nameLengthError = this.nameLengthValidation(data);
        if (nameLengthError) {
            this.setState({validationState: nameLengthError});
            return false;
        }

        this.setState({validationState: this.validState});

        return false;
    };

    requiredFieldsValidation = (data) => {
        const error = !data.caseType || !data.year || !data.version;
        const validState = this.validState;
        const messages = this.props.messages;
        return error ? {
            ...validState,
            financeTypeState: data.caseType ? null : 'error',
            financeTypeHelp: data.caseType ? null : messages.requiredFieldItemError,
            yearState: data.year ? null : 'error',
            yearHelp: data.year ? null : messages.requiredFieldItemError,
            versionState: data.version ? null : 'error',
            versionHelp: data.version ? null : messages.requiredFieldItemError,
            formState: 'danger',
            formHelp: messages.requiredFieldsError
        } : null;
    };

    nameLengthValidation = (data) => {
        const financeType = this.financeType.selectedOption;
        const financeTypeLabel = financeType ? financeType.label : '';
        const {year, version} = data;
        const validState = this.validState;

        const redundantChars = (financeTypeLabel.length + (year.toString()).length + version.length) - this.props.maxNameLength;
        return redundantChars > 0 ? {
            ...validState,
            versionState: 'error',
            versionHelp: this.props.messages.removeRedundantCharsError.replace('%count%', redundantChars),
            formState: 'danger',
            formHelp: this.props.messages.nameLengthFormError.replace('%length%', this.props.maxNameLength.toString())
        } : null;
    };

    getFormData = () => {
        const elements = this.formRef.elements;
        return {
            isGeneric: elements.isGeneric.value === 'true',
            caseType: this.financeType && this.financeType.value,
            year: this.state.yearValue.value,
            version: elements.version.value,
            description: elements.description.value
        };
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

        const nameLengthError = this.nameLengthValidation(data);
        if (nameLengthError) {
            this.setState({validationState: nameLengthError});
            return false;
        }

        this.setState({validationState: {
            ...validState,
            formHelp: this.props.messages.formLoading,
            formState: 'info'
        }});
        this.props.createNewCase(data);

        return false;
    };

    resetErrors = () => {
        this.setState({validationState: this.validState});
    };

    render() {
        const {types} = this.props;
        const {validationState} = this.state;

        return (
            <Modal show={this.props.show} onHide={this.props.onHide}
                   aria-labelledby="contained-modal-title-lg">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">Create New Case</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form
                        onSubmit={this.onSubmit}
                        ref={(el) => { this.formRef = el; }}>

                        {/* Form status */}
                        {validationState.formHelp ? <Alert bsStyle={validationState.formState} onDismiss={this.resetErrors}>
                            <p>{validationState.formHelp}</p>
                        </Alert> : null}

                        {/* Case Type */}
                        <FormGroup controlId="isGeneric">
                            <ControlLabel>Case Type</ControlLabel>
                            <div className="form-group-radio-btn">
                                <Radio name="isGeneric" labelValue="Generic" defaultValue={true} defaultChecked={true} id="generic-radio"/>
                                <Radio name="isGeneric" labelValue="Multiyear" defaultValue={false} defaultChecked={false} id="multi-year-radio"/>
                            </div>
                        </FormGroup>

                        {/* Finance Type */}
                        <StateFullSelectView name="financeType"
                                             ref={(el) => { this.financeType = el; }}
                                             label="Finance Type"
                                             help={validationState.financeTypeHelp}
                                             placeholder="Select Finance Type"
                                             options={types ? _.map(types.data, option => ({
                                                value: option.id,
                                                label: option.name
                                             })) : []}
                                             onChange={this.validateOnTheFly}
                                             validationState={validationState.financeTypeState}
                            />

                        {/* Year */}
                            <Calendar 
                                show={this.props.years}
                                dates={this.props.years}
                                views="year"
                                validationState={validationState.yearState}
                                validationText={validationState.yearHelp}
                                labelText="Year"
                                onChange={(date) => {
                                    this.validateOnTheFly();
                                    this.calendarChangeHandler(date);
                                }} />

                        {/* Version */}
                        <FormGroup controlId="version" validationState={validationState.versionState}>
                            <ControlLabel>Version</ControlLabel>
                            <FormControl
                                type="text"
                                onKeyUp={this.validateOnTheFly}
                                placeholder="Type Version" />
                            <HelpBlock>{validationState.versionHelp}</HelpBlock>
                        </FormGroup>

                        {/* Description */}
                        <div className="wrapper-form-group">
                            <FieldGroup id="description"
                                        type="text"
                                        label="Description"
                                        placeholder="Type Description"
                                />
                            <span className="label-option">Optional</span>
                        </div>

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

export default CreateNewCase;
