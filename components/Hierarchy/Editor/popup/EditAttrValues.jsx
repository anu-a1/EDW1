import React from 'react';
import {Modal, Button, FormControl, FormGroup, ControlLabel, Alert} from "react-bootstrap";
import _ from 'lodash';

import PopupButton from './_Button';
import {serverError} from '../../../../utils/errorTransform';

class EditAttrValues extends React.Component {

    static defaultProps = {
        messages: {
            onFormSaveError: '%error%',
            formLoading: 'Loading...',
            onFormSaveSuccess: 'Attribute values were successfully updated.'
        }
    };

    state = {
        summaryAttributeValues: {},
        validationState: {}
    };

    get loadingState() {
        return {
            formState: 'info',
            formHelp: 'Loading...'
        };
    };

    componentDidMount() {
        this.defineModalData();
    };

    defineModalData() {
        const attributesNames = this.props.hierarchyAttributes;
        const focusedSource = this.props.getFocusedSource();
        const sourceSelection = focusedSource.srcItems;

        let summaryAttributeValues = {};

        for (let i = 0, len = sourceSelection.length; i < len; i++) {
            const sourceAttrValues = _.keyBy(sourceSelection[i].attributeValues, item => item.attributeName);

            for (let j = 0, attrLen = attributesNames.length; j < attrLen; j++) {
                const attributeName = attributesNames[j].name;

                if (!sourceAttrValues[attributeName]) {
                    summaryAttributeValues[attributeName] = null;
                    continue;
                }

                if (summaryAttributeValues[attributeName] === undefined) {
                    summaryAttributeValues[attributeName] = sourceAttrValues[attributeName].attributeValue;
                    continue;
                }

                const localValue = summaryAttributeValues[attributeName];
                const isAttributesEqual = localValue === sourceAttrValues[attributeName].attributeValue;

                if (!isAttributesEqual) {
                    summaryAttributeValues[attributeName] = null;
                }
            }
        }

        this.setState({summaryAttributeValues});
    };

    onAttributeNameChange = (key, action) => e => {
        this.setState({
            summaryAttributeValues: {
                ...this.state.summaryAttributeValues,
                [key]: action === 'clear' ? '' : e.target.value
            }
        });
    };

    onSubmit = (event) => {
        event.preventDefault();
        const focusedSource = this.props.getFocusedSource();
        const definedValues = this.state.summaryAttributeValues;
        let sourceSelection = [...focusedSource.srcItems];

        _.each(sourceSelection, (item) => {
            const attrValues = _.keyBy(item.attributeValues, entry => entry.attributeName);

            _.each(definedValues, (value, key) => {
                if (attrValues[key]) {
                    attrValues[key].attributeValue = value || null;
                } else {
                    attrValues[key] = {
                        dimensionId: this.props.selectedDimension.value,
                        dimensionName: this.props.selectedDimension.label,
                        groupId: this.props.selectedGroup.value,
                        attributeName: key,
                        attributeValue: value || null
                    }
                }
            });

            item.attributeValues = _.values(attrValues);
        });

        this.setState({
            validationState: this.loadingState,
            isLoading: true
        });

        const {focusedOn, gridPropName} = focusedSource;
        const isUnused = focusedOn === 'grid' && gridPropName === "unusedMembers";
        const requestBody = isUnused ? sourceSelection : this.updateHierarchyWithAttributes(sourceSelection);
        this.props.onSave && this.props.onSave(requestBody, isUnused).then(this.onFormSaved);
        return false;
    };

    updateHierarchyWithAttributes = (members) => {
        const data = _.values(this.props.getTreeRef().getTreeDataState());
        const updatedMembers = _.keyBy(members, (entry) => entry.id);
        for (let i = 0, len = data.length; i < len; i+=1) {
            const entryId = data[i].id;
            if (updatedMembers[entryId]) {
                data[i] = updatedMembers[entryId];
            }
        }
        return {
            hierarchy: data,
            updatedMembersIds: _.keys(updatedMembers)
        };
    };

    onFormSaved = ({err, isValid, invalidMemberIds, validationError}) => {
        const {messages} = this.props;
        const nextState = {
            isLoading: false,
            validationState: {
                formState: null,
                formHelp: null
            }
        };

        if (err) {
            const message = serverError({
                content: err,
                template: messages.onFormSaveError
            });

            nextState.validationState.formState = 'danger';
            nextState.validationState.formHelp = message.content;
            return this.setState(nextState);
        }

        if (isValid !== undefined && !isValid) {
            nextState.validationState.formHelp = validationError;
            nextState.validationState.formState = 'warning';
            return this.setState(nextState);
        }

        this.setState(nextState, this.props.onHide);
    };

    _renderAttrValue = (attribute) => {
        const attrValue = this.state.summaryAttributeValues[attribute];
        return (
            <FormGroup key={attribute} controlId="attrDirection">
                <ControlLabel>{attribute}</ControlLabel>
                <FormGroup className="form-group-clear">
                    <FormControl type="text"
                                 value={attrValue || ''}
                                 onChange={this.onAttributeNameChange(attribute)}
                                 placeholder="Type value"/>
                    <Button className="btn-clear"
                            onClick={this.onAttributeNameChange(attribute, 'clear')}>
                        {attrValue && <span className="icon-clear"/>}
                    </Button>
                </FormGroup>
            </FormGroup>
        )
    };

    render() {
        const {validationState} = this.state;

        return (
            <Modal show={this.props.show} onHide={this.props.onHide}
                   aria-labelledby="contained-modal-title-lg">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">Edit Attributes Value</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form
                        onSubmit={this.onSubmit}
                        ref={(el) => { this.formRef = el; }}>

                        {/* Form status */}
                        {validationState.formHelp ? <Alert bsStyle={validationState.formState}>
                            <p>{validationState.formHelp}</p>
                        </Alert> : null}

                        {
                            _.map(this.props.hierarchyAttributes, (attributeData, attributeKey) => {
                                return this._renderAttrValue(attributeData.name);
                            })
                        }

                        <div className="modal-buttons">
                            <Button onClick={this.props.onHide}>Cancel</Button>
                            <Button bsStyle="primary" type="submit">Save</Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        );
    };
}

class EditAttrValuesButton extends PopupButton {

    formComponent = EditAttrValues;

    getButton () {
        return (
            <Button onClick={this.onOpen}
                    disabled={this.props.disabled}
                    className="btn-shadow">
                Edit Attributes Value
            </Button>
        );
    };

}

export default EditAttrValuesButton;
