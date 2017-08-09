import React from 'react';
import {Modal, Button, FormGroup, ControlLabel, Alert} from "react-bootstrap";

import {serverError} from '../../../../utils/errorTransform';
import Select from '../../../../components/utils/Fields/Select';
import PopupButton from './_Button';
import Grid from '../../../../components/utils/Grid';
import _ from 'lodash';

class MergeNodes extends React.Component {

    static defaultProps = {
        messages: {
            onFormSaveError: '%error%',
            formLoading: 'Loading...',
            onFormSaveSuccess: 'Successfully merged.'
        }
    };

    state = {
        isLoading: false,
        validationState: {},
        treeSelected: {},
        selectedTarget: '',
        targetList: []
    };

    componentWillMount() {
        const treeSelected = this.props.getTreeRef().getSelectedState();
        const targetList = this.getTargetsList(treeSelected);
        this.setState({targetList, treeSelected});
    }

    get loadingState() {
        return {
            formState: 'info',
            formHelp: 'Loading...'
        };
    };

    onSubmit = (event) => {
        event.preventDefault();
        const treeData = this.props.getTreeRef().getTreeDataState();
        const data = {
            oldHierarchy: treeData,
            mergedMember: {
                sourceIds: _.keys(this.state.treeSelected).map(Number),
                targetId: this.state.selectedTarget
            }
        };

        this.setState({
            isLoading: true,
            validationState: this.loadingState
        });

        this.props.onSave && this.props.onSave(data).then(this.onFormSaved);
        return false;
    };

    onFormSaved = ({err, isValid, validationError}) => {
        const {messages} = this.props;
        const nextState = {
            isLoading: false,
            validationState: {}
        };

        if (err) {
            const formHelp = serverError({
                content: err,
                template: messages.onFormSaveError
            });

            nextState.validationState.formHelp = formHelp.content;
            nextState.validationState.formState = 'danger';

            return this.setState(nextState);
        }

        if (!isValid) {
            nextState.validationState.formHelp = validationError;
            nextState.validationState.formState = 'danger';
            return this.setState(nextState);
        }

        this.setState(nextState, this.props.onHide);
    };

    onDestinationSelect = (selected) => {
        this.setState({
            selectedTarget: selected.value
        });
    };

    getTargetsList = (treeSelected) => {
        const editorTree = this.props.getTreeRef().getTreeDataState();

        if (_.isEmpty(treeSelected)) {
            return [];
        }

        return _
            .chain(editorTree)
            .values()
            .filter((item) => !treeSelected[item.id])
            .value();
    };

    render() {
        const {treeSelected, targetList, selectedTarget, validationState} = this.state;
        return (
            <Modal show={this.props.show} onHide={this.props.onHide}
                   aria-labelledby="contained-modal-title-lg" className="modal-middle">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">Merge Nodes</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-merge-node">
                    {/* Form status */}
                    {validationState.formHelp ? <Alert bsStyle={validationState.formState}>
                        <p>{validationState.formHelp}</p>
                    </Alert> : null}

                    <form
                        onSubmit={this.onSubmit}
                        ref={(el) => { this.formRef = el; }}>
                        <Grid
                            wrapperClassName={'merge-table'}
                            data={_.values(treeSelected)}
                            bodyScheme={[{
                                key: 'code'
                            }, {
                                key: 'name'
                            }]}
                            headerScheme={[{
                                title: 'Code',
                                key: 'code',
                                subHeader: {
                                    component: 'Filter'
                                }
                            }, {
                                title: 'Name',
                                key: 'name',
                                subHeader: {
                                    component: 'Filter'
                                }
                            }]}
                        />

                        {/* Destination of Merge */}
                        <FormGroup
                            controlId="destinationofMerge">
                            <ControlLabel>Select Destination of Merge</ControlLabel>
                            <Select name="destinationofMerge"
                                    value={this.state.selectedTarget}
                                    placeholder="Select destination"
                                    options={targetList.map(option => ({
                                        value: option.id,
                                        label: `${option.name} [${option.code}]`
                                    }))}
                                    onChange={this.onDestinationSelect}
                            />
                        </FormGroup>

                        <div className="modal-buttons">
                            <Button onClick={this.props.onHide}>Cancel</Button>
                            <Button bsStyle="primary"
                                    disabled={!selectedTarget}
                                    type="submit">
                                Merge
                            </Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        );
    };
}

class MergeNodesButton extends PopupButton {

    formComponent = MergeNodes;

    getButton() {
        return (
            <Button onClick={this.onOpen}
                    disabled={this.props.disabled}
                    className="btn-shadow">Merge</Button>
        );
    };

}

export default MergeNodesButton;
