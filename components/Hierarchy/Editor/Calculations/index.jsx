import React, {Component} from 'react';
import {Button, FormGroup, ControlLabel, FormControl, HelpBlock} from "react-bootstrap";

import Tree from '../../../utils/Tree';
import Droppable from './Droppable';
import Loading from '../../../../components/Loading';

class Calculations extends Component {

    static defaultProps = {
        messages: {
            'updatedSuccess': 'Calculated member %name%[%code%] was successfully updated.',
            'deletedSuccess': 'Calculated member %name%[%code%] was successfully deleted.',
            'createdSuccess': 'Calculated member %name%[%code%] was successfully created.'
        }
    };

    state = {
        isLoading: false,
        isEditAction: false,
        isAddAction: true,
        enableToSave: false,
        enableToUpdate: false,
        enableHelpButtons: false,
        enableUndo: false,
        enableRedo: false,
        actions: [],
        canceledActions: [],
        memberToEdit: {}
    };

    componentWillMount() {
        const {getCalculatedMembersList, dimensionName, groupId} = this.props;
        getCalculatedMembersList({dimensionName, groupId});
    };

    updateState = (changedState, callback) => {
        this.setState({...changedState}, callback);
    };

    onAdd = () => {
        this.updateState({
            isEditAction: false,
            isAddAction: true,
            enableToSave: false,
            memberToEdit: {}
        });
    };

    onSave = () => {
        const {createCalculated, groupId, dimensionName, notify, messages} = this.props;
        const {code, memberDisplayName, equation} = this.state.memberToEdit;
        this.updateState({isLoading: true});
        createCalculated({code, memberDisplayName, equation, groupId, dimensionName})
            .then(({err, newMember}) => {
                if (err) {
                    notify({
                        content: err,
                        type: 'server-error'
                    });
                    this.updateState({isLoading: false});
                    return;
                }
                notify({
                    content: messages.createdSuccess
                        .replace('%name%', memberDisplayName)
                        .replace('%code%', code),
                    type: 'success'
                });
                this.onCancel();
            });
    };

    onEdit = member => {
        this.updateState({
            isEditAction: true,
            isAddAction: false,
            memberToEdit: {...member}
        });
    };

    onUpdate = () => {
        const {updateCalculated, groupId, dimensionName, notify, messages} = this.props;
        const {accountId, code, memberDisplayName, equation} = this.state.memberToEdit;
        this.updateState({isLoading: true});
        updateCalculated({accountId, code, memberDisplayName, equation, groupId, dimensionName})
            .then(err => {
                if (err) {
                    notify({
                        content: err,
                        type: 'server-error'
                    });
                    this.updateState({isLoading: false});
                    return;
                }
                notify({
                    content: messages.updatedSuccess
                        .replace('%name%', memberDisplayName)
                        .replace('%code%', code),
                    type: 'success'
                });
                this.onCancel();
            });
    };

    onDelete = member => {
        const {deleteCalculated, notify, messages} = this.props;
        this.updateState({isLoading: true});
        deleteCalculated(member.accountId)
            .then(err => {
                if (err) {
                    notify({
                        content: err,
                        type: 'server-error'
                    });
                    this.updateState({isLoading: false});
                    return;
                }
                notify({
                    content: messages.deletedSuccess
                        .replace('%name%', member.memberDisplayName)
                        .replace('%code%', member.code),
                    type: 'success'
                });
                this.onCancel();
            })
    };

    onCancel = () => {
        this.updateState({
            isLoading: false,
            isEditAction: false,
            isAddAction: true,
            enableToSave: false,
            enableToUpdate: false,
            memberToEdit: {}
        });
    };

    onFieldChanged = (event, name) => {
        const val = event.target.value;
        const {memberToEdit, isEditAction, isAddAction} = this.state;
        const nextState = {
            memberToEdit: {
                ...memberToEdit,
                [name]: val
            }
        };
        const isAllFilled = !!nextState.memberToEdit.code && !!nextState.memberToEdit.memberDisplayName && !!nextState.memberToEdit.equation;

        this.updateState({
            ...nextState,
            enableToSave: isAddAction && isAllFilled,
            enableToUpdate: isEditAction && isAllFilled
        });
    };

    insertFormulaSign = sign => {
        const {memberToEdit, isEditAction, isAddAction} = this.state;
        const isAllFilled = !!memberToEdit.code && !!memberToEdit.memberDisplayName && sign;
        const equationRef = this.formRef.equation;
        const value = equationRef.value || '';
        const len = value.length;
        const start = equationRef.selectionStart;
        const end = equationRef.selectionEnd;
        const wrappedSign = ` ${sign} `;

        let actions = [...this.state.actions];
        actions.push(value);

        let resultStr = value.slice(0, start);
        resultStr += wrappedSign;
        resultStr += value.slice(end, len);

        this.updateState({
            memberToEdit: {
                ...memberToEdit,
                equation: resultStr
            },
            actions,
            enableUndo: true,
            enableToSave: isAddAction && isAllFilled,
            enableToUpdate: isEditAction && isAllFilled
        }, () => {
            equationRef.focus();
            equationRef.selectionStart = start;
            equationRef.selectionEnd = start + wrappedSign.length;
        });
    };

    addMemberToFormula = (member, type) => {
        if (!member || !member.code) {
            return;
        }
        const formulaFn = {
            "regular": "R(\"%code%\")",
            "calculated": "C(\"%code%\")",
            "error": "UndefinedSourceType(\"%code%\")"
        };
        const sign = (formulaFn[type] || formulaFn.error).replace('%code%', member.code);

        this.insertFormulaSign(sign);
    };

    undo = event => {
        event.preventDefault();
        const {memberToEdit, isAddAction, isEditAction} = this.state;
        const actions = [...this.state.actions];
        const canceledActions = [...this.state.canceledActions];
        const prevFormula = actions.pop();
        const isAllFilled = !!memberToEdit.code && !!memberToEdit.memberDisplayName && prevFormula;

        canceledActions.push(memberToEdit.equation);
        this.updateState({
            memberToEdit: {
                ...memberToEdit,
                equation: prevFormula
            },
            actions, canceledActions,
            enableUndo: actions.length > 0,
            enableRedo: true,
            enableToSave: isAddAction && isAllFilled,
            enableToUpdate: isEditAction && isAllFilled
        }, () => {
            this.formRef.equation.focus();
        });
    };

    redo = event => {
        event.preventDefault();
        const {memberToEdit, isAddAction, isEditAction} = this.state;
        const actions = [...this.state.actions];
        const canceledActions = [...this.state.canceledActions];
        const prevFormula = canceledActions.pop();
        const isAllFilled = !!memberToEdit.code && !!memberToEdit.memberDisplayName && prevFormula;

        this.updateState({
            memberToEdit: {
                ...memberToEdit,
                equation: prevFormula
            },
            actions, canceledActions,
            enableUndo: actions.length > 0,
            enableRedo: canceledActions.length > 0,
            enableToSave: isAddAction && isAllFilled,
            enableToUpdate: isEditAction && isAllFilled
        }, () => {
            this.formRef.equation.focus();
        });
    };

    render() {
        const {calculatedMembers} = this.props;
        const {
            isEditAction, isAddAction, enableToSave, enableToUpdate, enableHelpButtons,
            enableUndo, enableRedo, isLoading,
            memberToEdit
            } = this.state;
        return (
            <div className="editor-calculation-content">
                <h3>Calculation Panel</h3>
                <Loading show={isLoading}/>
                <div className="btns-block">
                    <Button className="btn-dark"
                            onClick={this.onAdd}>
                        <span className="icon-calc-plus-btns"/>
                        New Calculated Member
                    </Button>
                </div>

                <div className="calculation-panel-wrapper container-flex">
                    <div className="calculation-panel-content container-flex-item container-flex-column-left">
                        <form ref={node => this.formRef = node}>
                            <div className="calculation-panel-row calculation-panel-code">
                                {/* Code */}
                                <FormGroup controlId="code" validationState={null}>
                                    <ControlLabel>Code</ControlLabel>
                                    <FormControl
                                        readOnly={isEditAction}
                                        type="text"
                                        value={memberToEdit.code || ''}
                                        onChange={event => this.onFieldChanged(event, 'code')}
                                        onFocus={event => this.updateState({enableHelpButtons: false})}
                                        placeholder="Type Code" />
                                    <HelpBlock>{null}</HelpBlock>
                                </FormGroup>

                                {/* memberDisplayName */}
                                <FormGroup controlId="memberDisplayName" validationState={null}>
                                    <ControlLabel>Description</ControlLabel>
                                    <FormControl
                                        type="text"
                                        value={memberToEdit.memberDisplayName || ''}
                                        onChange={event => this.onFieldChanged(event, 'memberDisplayName')}
                                        onFocus={event => this.updateState({enableHelpButtons: false})}
                                        placeholder="Type Description" />
                                    <HelpBlock>{null}</HelpBlock>
                                </FormGroup>
                            </div>

                            <div className="calculation-panel-row calculation-panel-btns">
                                <div className="pull-right">
                                    <Button className="btn-dark btn-icon btn-small "
                                            disabled={!enableUndo}
                                            onClick={this.undo}
                                        >
                                        <span className="icon-arrow-undo"/>
                                    </Button>
                                    <Button className="btn-dark btn-icon btn-small "
                                            disabled={!enableRedo}
                                            onClick={this.redo}
                                        >
                                        <span className="icon-arrow-forward"/>
                                    </Button>
                                </div>
                                <Button className="btn-shadow btn-icon btn-small "
                                        disabled={!enableHelpButtons}
                                        onClick={event => this.insertFormulaSign('+')}
                                    >
                                    <span className="icon-calc-plus"/>
                                </Button>
                                <Button className="btn-shadow btn-icon btn-small "
                                        disabled={!enableHelpButtons}
                                        onClick={event => this.insertFormulaSign('-')}
                                    >
                                    <span className="icon-calc-minus"/>
                                </Button>
                                <Button className="btn-shadow btn-icon btn-small "
                                        disabled={!enableHelpButtons}
                                        onClick={event => this.insertFormulaSign('*')}
                                    >
                                    <span className="icon-calc-multiply"/>
                                </Button>
                                <Button className="btn-shadow btn-icon btn-small "
                                        disabled={!enableHelpButtons}
                                        onClick={event => this.insertFormulaSign('/')}
                                    >
                                    <span className="icon-calc-divide"/>
                                </Button>
                                <div className="border"></div>
                                <Button className="btn-shadow btn-icon btn-small "
                                        disabled={!enableHelpButtons}
                                        onClick={event => this.insertFormulaSign('^')}
                                    >
                                    <span className="icon-arrow-up"/>
                                </Button>
                                <Button className="btn-shadow btn-icon btn-small "
                                        disabled={!enableHelpButtons}
                                        onClick={event => this.insertFormulaSign('%')}
                                    >
                                    <span className="icon-calc-percentage"/>
                                </Button>
                            </div>

                            {/* equation */}
                            <Droppable onDrop={data => this.addMemberToFormula(data.item, data.sourceName)}>
                                <div className="calculation-panel-row calculation-panel-formula">
                                    <ControlLabel>Enter Formula / Expression</ControlLabel>
                                    <FormControl componentClass="textarea"
                                                 name="equation"
                                                 placeholder="Type Expression"
                                                 value={memberToEdit.equation || ''}
                                                 onChange={event => this.onFieldChanged(event, 'equation')}
                                                 onFocus={event => this.updateState({enableHelpButtons: true})}/>
                                </div>
                            </Droppable>

                            <div className="calculation-panel-row calculation-panel-controls-btn">
                                <Button onClick={this.onCancel}>Cancel</Button>
                                {isAddAction && <Button bsStyle="primary"
                                                        disabled={!enableToSave}
                                                        onClick={this.onSave}
                                    >Add</Button>}
                                {isEditAction && <Button bsStyle="primary"
                                                         disabled={!enableToUpdate}
                                                         onClick={this.onUpdate}
                                    >Update</Button>}
                            </div>
                        </form>
                    </div>

                    <div className="calculation-panel-result container-flex-item container-flex-column-right">
                        <div className="container-flex-tree">
                            <b>Calculated Account</b>
                            {/* Calculated Members */}
                            <Tree data={calculatedMembers ? calculatedMembers.data : []}
                                  idAttr="accountId"
                                  dataTitleKey={entry => (`${entry.memberDisplayName} [${entry.code}]`)}
                                  draggable={true}
                                  sourceName="calculated"
                                  includeSearch={false}
                                  useCheckboxes={false}
                                  useEditIcon={true}
                                  useDeleteIcon={true}
                                  onEdit={this.onEdit}
                                  onDelete={this.onDelete}
                                />
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}

export default Calculations;