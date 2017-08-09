import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import {Modal, Button, FormControl, FormGroup, ControlLabel, HelpBlock, Alert} from "react-bootstrap";

import Radio from '../../../utils/Fields/FormRadio';
import PopupButton from './_Button';
import {StateFullSelectView} from '../../../../components/utils/Fields/Select';
import Loading from '../../../../components/Loading';

import {serverError} from '../../../../utils/errorTransform';
import {getEditorList} from '../../../../actions/dimension';
import {getNewHerarchyGroupsList, addNewGroup, saveCreatedGroup} from '../../../../actions/group';
import notify from '../../../../actions/notifier';

class CreateNewHierarchy extends React.Component {

    static defaultProps = {
        messages: {
            onFormSaveError: 'Server error has occurred. Details: %error%',
            requiredFieldsError: '',
            requiredFieldItemError: 'Fill this required field',
            formLoading: 'Loading...',
            onFormSaveSuccess: 'New Hierarchy "%name%" was successfully created.'
        }
    };

    state = {
        isLoading: false,
        showExistingHierarchy: false,
        validationState: this.validState
    };

    get validState() {
        return {
            dimensionState: null,
            dimensionHelp: null,

            nameState: null,
            nameHelp: null,

            typeState: null,
            typeHelp: null,

            existingHierarchyState: null,
            existingHierarchyHelp: null,

            formState: null, //one of: "success", "warning", "danger", "info"
            formHelp: null
        };
    };

    componentDidMount() {
        this.setState({isLoading: true});
        this.props.getEditorList()
            .then(() => this.setState({isLoading: false}));
    };

    shouldComponentUpdate(nextProps, nextState) {
        let shouldUpdate = this.state !== nextState;
        _.each(['dimensions', 'groups'], name => {
            shouldUpdate = this.props[name] !== nextProps[name] || shouldUpdate;
        });
        return shouldUpdate;
    };

    resetErrors = () => {
        this.setState({validationState: this.validState});
    };

    requiredFieldsValidation = data => {
        const existingHierarchyEror = data.type === 'existing' && !data.existingHierarchy;
        const error = existingHierarchyEror || !data.dimension || !data.name;
        const messages = this.props.messages;
        return error ? {
            ...this.validState,
            dimensionState: data.dimension ? null : 'error',
            dimensionHelp: data.dimension ? null : messages.requiredFieldItemError,
            nameState: data.name ? null : 'error',
            nameHelp: data.name ? null : messages.requiredFieldItemError,
            existingHierarchyState: existingHierarchyEror ? 'error' : null,
            existingHierarchyHelp: existingHierarchyEror ? messages.requiredFieldItemError : null,
            formState: 'danger',
            formHelp: messages.requiredFieldsError
        } : null;
    };

    onTypeChange = () => {
        const data = this.getFormData();
        let isLoading = false;
        let showExistingHierarchy = false;
        
        if (data.type === 'existing') {
            showExistingHierarchy = true;
            isLoading = !!data.dimension;
            isLoading && this.loadExistingHierarchy(data.dimension);
        }

        this.setState({showExistingHierarchy, isLoading});
    };

    onDimensionChange = () => {
        const data = this.getFormData();
        let isLoading = false;

        if (data.type === 'existing') {
            isLoading = !!data.dimension;
            isLoading && this.loadExistingHierarchy(data.dimension);
        }

        this.setState({isLoading});
    };
    
    loadExistingHierarchy = dimensionName => {
        this.props.getNewHerarchyGroupsList({dimensionName, returnType: 0})
            .then(() => this.setState({isLoading: false}));
    };

    getFormData = () => {
        const elements = this.formRef.elements;
        return {
            type: elements.hierarchyType.value,
            dimension: this.dimensionRef && this.dimensionRef.selectedOption && this.dimensionRef.selectedOption.name,
            existingHierarchy: this.existingHierarchyRef && this.existingHierarchyRef.selectedOption,
            name: elements.name.value
        };
    };

    onSubmit = event => {
        event.preventDefault();
        const data = this.getFormData();
        const {messages, addNewGroup, onHide, notify} = this.props;

        const requiredFieldsError = this.requiredFieldsValidation(data);
        if (requiredFieldsError) {
            this.setState({validationState: requiredFieldsError});
            return false;
        }

        this.setState({
            validationState: {
                ...this.validState,
                formHelp: messages.formLoading,
                formState: 'info'
            },
            isLoading: true
        });
        addNewGroup({
            dimensionName: data.dimension,
            groupName: data.name,
            sourceGroupId: data.type === 'existing' ? data.existingHierarchy.id : null
        })
            .then(res => {
                this.props.saveCreatedGroup({
                    dimensionName: data.dimension.toLowerCase(),
                    data: res.data
                });
                this.setState({
                    validationState: this.validState,
                    isLoading: false
                }, onHide);
                notify({
                    content: this.props.messages.onFormSaveSuccess.replace('%name%', res.data.name),
                    type: 'success'
                })
            })
            .catch(err => {
                const formHelp = serverError({
                    content: err,
                    template: messages.onFormSaveError
                });
                this.setState({
                    validationState: {
                        ...this.validState,
                        formState: 'danger',
                        formHelp: formHelp.content
                    },
                    isLoading: false
                });
            });

        return false;
    };

    render() {
        const {isLoading, validationState, showExistingHierarchy} = this.state;
        const {show, onHide, dimensions, groups} = this.props;

        return (
            <Modal show={show} onHide={onHide}
                   aria-labelledby="contained-modal-title-lg">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">Create New Hierarchy</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Loading show={isLoading}/>
                    <form onSubmit={this.onSubmit}
                          ref={el => this.formRef = el}
                    >

                        {/* Form status */}
                        {validationState.formHelp ? <Alert bsStyle={validationState.formState} onDismiss={this.resetErrors}>
                            <p>{validationState.formHelp}</p>
                        </Alert> : null}

                        {/* Select Dimension */}
                        <StateFullSelectView name="dimension"
                                             onChange={this.onDimensionChange}
                                             label="Select Dimension"
                                             placeholder="Select Dimension"
                                             ref={el => this.dimensionRef = el}
                                             help={validationState.dimensionHelp}
                                             validationState={validationState.dimensionState}
                                             searchable={false}
                                             labelKey="name"
                                             valueKey="id"
                                             options={dimensions ? dimensions.data : []}
                        />

                        {/* New Hierarchy Name */}
                        <FormGroup controlId="name" validationState={validationState.nameState}>
                            <ControlLabel>New Hierarchy Name</ControlLabel>
                            <FormControl type="text"
                                         placeholder="Type Hierarchy Name" />
                            <HelpBlock>{validationState.nameHelp}</HelpBlock>
                        </FormGroup>

                        {/* Type */}
                        <FormGroup onChange={this.onTypeChange}>
                            <ControlLabel>Type</ControlLabel>
                            <div className="form-group-radio-btn">
                                <Radio name="hierarchyType" labelValue="From scratch" defaultValue="scratch" defaultChecked={true} id="scratch-radio"/>
                                <Radio name="hierarchyType" labelValue="From existing" defaultValue="existing" defaultChecked={false} id="existing-radio"/>
                            </div>
                        </FormGroup>


                        {/* Select Existing Hierarchy */}
                        <StateFullSelectView name="existingHierarchy"
                                             disabled={!showExistingHierarchy}
                                             ref={el => this.existingHierarchyRef = el}
                                             help={validationState.existingHierarchyHelp}
                                             validationState={validationState.existingHierarchyState}
                                             label="Select Existing Hierarchy"
                                             placeholder="Select Existing Hierarchy"
                                             labelKey="name"
                                             valueKey="id"
                                             searchable={false}
                                             options={groups ? groups.data : []}
                        />


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

const mapStateToProps = ({dimension, group}) => ({
    dimensions: dimension.editor,
    groups: group.newHierarchyList
});

const mapDispatchToProps = {getEditorList, getNewHerarchyGroupsList, addNewGroup, saveCreatedGroup, notify};

const CreateNewHierarchyComponent = connect(mapStateToProps, mapDispatchToProps)(CreateNewHierarchy);


class CreateNewHierarchyButton extends PopupButton {

    formComponent = CreateNewHierarchyComponent;

    getButton() {
        return (
            <Button className="btn-dark"
                    onClick={this.onOpen}>
                <span className="icon-calc-plus-btns"/>
                Create New Hierarchy
            </Button>);
    };

}

export default CreateNewHierarchyButton;