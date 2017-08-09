import React from 'react';
import {Modal, Button, FormControl, FormGroup, HelpBlock, Alert} from "react-bootstrap";
import _ from 'lodash';

import {serverError} from '../../../../utils/errorTransform';
import Tooltip from '../../../../components/utils/Tooltip';
import PopupButton from './_Button';

class ManageAttrs extends React.Component {

    static defaultProps = {
        messages: {
            onFormSaveError: '%error%',
            requiredFieldItemError: 'This field cannot be empty',
            formLoading: 'Loading...',
            onFormSaveSuccess: 'Attributes were successfully updated.'
        }
    };

    state = {
        oldAttributes: _.keyBy(this.props.hierarchyAttributes, 'id'),
        newAttributes: _.keyBy(this.props.hierarchyAttributes, 'id'),
        validationState: {},
        isLoading: false
    };

    onSubmit = (event) => {
        event.preventDefault();

        const errors = this.getFieldsErrors();

        if (!_.isEmpty(errors)) {
            this.setState({
                validationState: errors
            });

            return false;
        }

        const hasFormChanges = this.compareChanges();

        if (!hasFormChanges) {
            this.setState({
                validationState: {
                    formState: 'info',
                    formHelp: 'Contents identical.'
                }
            });

            return false;
        }

        this.setState({
            validationState: {
                formState: 'info',
                formHelp: 'Loading...'
            },
            isLoading: true
        });

        this.props.onSave && this.props.onSave({
            oldAttributes: _.values(this.state.oldAttributes),
            newAttributes: _.values(this.state.newAttributes)
        }).then(this.onFormSaved);

        return false;
    };

    compareChanges = () => {
        let hasChanges = false;
        _.each(this.state.oldAttributes, (item, key) => {
            if (!this.state.newAttributes[key] || item.name !== this.state.newAttributes[key].name) {
                hasChanges = true;
            }
        });

        return hasChanges;
    };

    getFieldsErrors = () => {
        const attributesKeys = _.keys(this.state.newAttributes);
        let formErrors = {};

        attributesKeys.forEach((id) => {
            if (this.state.newAttributes[id].name.length < 3) {
                formErrors[id] = 'error';
            }
        });

        return formErrors;
    };

    resetErrors = () => {
        this.setState({
            validationState: {}
        });
    };

    onFormSaved = (err) => {
        const {messages} = this.props;
        const formHelp = err ? serverError({
            content: err,
            template: messages.onFormSaveError
        }) : null;

        this.setState({
            validationState: {
                formState: err ? 'danger' : null,
                formHelp: err ? formHelp.content : null
            },
            isLoading: false
        });

        if (!err) {
            this.props.onHide();
            this.props.notify({
                content: messages.onFormSaveSuccess,
                type: 'success'
            });
        }
    };

    onAttrDelete = id => e => {
        const withoutDeleted = _.omit(this.state.newAttributes, id);
        this.setState({newAttributes: withoutDeleted});
    };

    onAttrChangeName = (id, isClear) => e => {
        const newAttributes = this.state.newAttributes;
        const currentAttr = this.state.newAttributes[id];
        this.setState({
            newAttributes: {
                ...newAttributes,
                [id]: {
                    ...currentAttr,
                    name: isClear ? '' : e.target.value
                }
            }
        });
    };

    render() {
        const {newAttributes, validationState} = this.state;
        const {messages} = this.props;
        return (
            <Modal show={this.props.show} onHide={this.props.onHide}
                   aria-labelledby="contained-modal-title-lg">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">Manage Attributes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="modal-manage-attr">
                        <form
                            onSubmit={this.onSubmit}
                            ref={(el) => { this.formRef = el; }}>

                            {/* Form status */}
                            {
                                validationState.formHelp ?
                                    <Alert bsStyle={validationState.formState}
                                           onDismiss={this.resetErrors}>
                                        <p>{validationState.formHelp}</p>
                                    </Alert> : null
                            }

                            {
                                _.map(newAttributes, (entry, key) => {
                                    return (
                                        <FormGroup
                                            key={entry.id}
                                            controlId={`attrDirection${key}`}
                                            validationState={validationState[entry.id] || null}>
                                            <FormGroup className="form-group-clear">
                                                <FormControl
                                                    type="text"
                                                    value={entry.name}
                                                    onChange={this.onAttrChangeName(entry.id)}
                                                    placeholder="Type Attribute Name" />
                                                <Button className="btn-clear"
                                                        onClick={this.onAttrChangeName(entry.id, true)}>
                                                    <span className="icon-clear"/>
                                                </Button>
                                            </FormGroup>
                                            {
                                                entry.isInUse ?
                                                    <Tooltip text="This attribute is in use">
                                                        <Button className="btn-delete"
                                                                onClick={this.onAttrDelete(entry.id)}>
                                                            <span className="icon-garbage"/>
                                                        </Button>
                                                    </Tooltip>
                                                    :
                                                    <Button className="btn-delete"
                                                            onClick={this.onAttrDelete(entry.id)}>
                                                        <span className="icon-garbage"/>
                                                    </Button>
                                            }
                                            <HelpBlock>
                                                {validationState[entry.id] && messages.requiredFieldItemError}
                                            </HelpBlock>
                                        </FormGroup>
                                    )
                                })
                            }

                            <div className="modal-buttons">
                                <Button onClick={this.props.onHide}>Cancel</Button>
                                <Button bsStyle="primary" type="submit">Save</Button>
                            </div>
                        </form>
                    </div>
                </Modal.Body>
            </Modal>
        );
    };
}

class ManageAttrsButton extends PopupButton {

    formComponent = ManageAttrs;

    getButton () {
        return (
            <Button
                onClick={this.onOpen}
                disabled={this.props.disabled}
                className="btn-shadow">Manage
            </Button>
        );
    };

}

export default ManageAttrsButton;
