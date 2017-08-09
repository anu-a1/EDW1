import React from 'react';
import _ from "lodash";
import cx from 'classnames';
import {Button, FormGroup, ControlLabel} from "react-bootstrap";

import Grid from '../utils/Grid';
import Select, {CaseSelect} from '../utils/Fields/Select';
import ActionFooter from '../ActionFooter';
import Calendar from '../utils/Calendar';
import Loading from '../Loading';

class BeginningBalanceSettings extends React.Component {

    static defaultProps = {
        messages: {
            saveSuccess: 'Beginning balance settings saved.',
            saveFailure: 'Saving beginning balance settings failed. %error%',
            clearSuccess: 'Beginning balance settings cleared.',
            clearFailure: 'Clearing beginning balance settings failed. %error%'
        }
    };

    state = {
        sourceCaseId: "",
        sourceCase: null,
        sourceCasePeriod: null,
        sourceDate: null,
        sourceFormat: null,

        targetCaseId: "",
        targetCase: null,
        targetCasePeriod: null,
        targetDate: null,
        targetFormat: null,

        targetViewId: "",

        showCalendar: false,
        showFooter: false,
        clearEnabled: false,
        saveEnabled: false,
        isLoading: false
    };

    shouldComponentUpdate(nextProps, nextState) {
        let shouldUpdate = this.state !== nextState;
        _.each(['casesList', 'dates', 'sequences', 'assignedViews', 'sourceCases'], name => {
            shouldUpdate = this.props[name] !== nextProps[name] || shouldUpdate;
        });
        return shouldUpdate;
    };

    onClear = (event) => {
        event.preventDefault();
        const {deleteTargetCaseBegBalance, notify, messages} = this.props;
        const {targetViewId, targetCaseId, targetDate, targetFormat} = this.state;

        this.onFormChanged({isLoading: true});
        deleteTargetCaseBegBalance({targetViewId, targetCaseId, targetDate, targetFormat})
            .then(res => {
                notify({
                    content: messages.clearSuccess,
                    type: 'success'
                });
                this.setState({
                    isLoading: false,
                    showFooter: false,
                    clearEnabled: false,
                    saveEnabled: false
                });
            }).catch((err) => {
                notify({
                    template: messages.clearFailure,
                    content: err,
                    type: 'server-error'
                });
                this.setState({isLoading: false});
            });
    };

    onSave = (event) => {
        event.preventDefault();
        const {saveBeginningBalance, notify, messages} = this.props;
        const {sourceCaseId, sourceDate, sourceFormat, targetCaseId, targetViewId, targetDate, targetFormat} = this.state;

        this.onFormChanged({isLoading: true});
        saveBeginningBalance({sourceCaseId, sourceDate, sourceFormat, targetCaseId, targetViewId, targetDate, targetFormat})
            .then(res => {
                notify({
                    content: messages.saveSuccess,
                    type: 'success'
                });
                this.setState({
                    showFooter: false,
                    clearEnabled: false,
                    saveEnabled: false
                });

                this.props
                    .getBalanceSequences({targetCaseId, targetViewId})
                    .then(res => this.setState({isLoading: false}));

            }).catch((err) => {
                notify({
                    template: messages.saveFailure,
                    content: err,
                    type: 'server-error'
                });
                this.setState({isLoading: false});
            });
    };

    onFormChanged = (changedState, callback) => {
        const state = this.state;
        const {sourceCaseId, sourceDate, sourceFormat, targetCaseId, targetViewId, targetDate, targetFormat} = {
            ...state,
            ...changedState
        };
        const targetReady = !!(targetViewId && targetCaseId && targetDate && targetFormat);
        const sourceReady = !!(sourceCaseId && sourceDate && sourceFormat);

        this.setState({
            showFooter: targetReady,
            clearEnabled: targetReady,
            saveEnabled: targetReady && sourceReady,
            ...changedState
        }, callback);
    };

    sourceCaseChanged = (option) => {
        const sourceCaseId = option && option.value;
        const sourceCase = _.find(this.props.sourceCases.data, {id: parseInt(sourceCaseId, 10)});
        const sourceCasePeriod = this.getSourceCasePeriod(sourceCase, this.state.targetCase);

        this.onFormChanged({
            sourceCaseId,
            sourceCase,
            ...sourceCasePeriod
        });
    };

    getSourceCasePeriod = (sourceCase, targetCase) => {
        const sourceCasePeriod = sourceCase && targetCase.isGeneric ? `Dec ${sourceCase.year}` : null;
        const sourceDate =  sourceCasePeriod ? `12/${sourceCase.year}` : null;
        const sourceFormat = sourceCasePeriod ? `MM/YYYY` : null;

        return {sourceCasePeriod, sourceDate, sourceFormat};
    };

    sourceDateChanged = (date) => {
        this.onFormChanged({
            sourceDate: date.value,
            sourceFormat: date.format
        });
    };

    targetDateChanged = (date) => {
        this.onFormChanged({
            targetDate: date.value,
            targetFormat: date.format
        });
    };

    targetCaseChanged = (option) => {
        const targetCaseId = option && option.value;
        const targetCase = _.find(this.props.casesList.data, {id: parseInt(targetCaseId, 10)});
        const targetCasePeriod = targetCaseId && targetCase.isGeneric ? `Jan ${targetCase.year}` : null;
        const targetDate =  targetCasePeriod ? `01/${targetCase.year}` : null;
        const targetFormat = targetCasePeriod ? `MM/YYYY` : null;
        const showCalendar = !targetCasePeriod;

        this.loadSequences(this.state.targetViewId, targetCaseId);
        this.onFormChanged({
            isLoading: true,
            targetCaseId,
            targetCase,
            targetCasePeriod,
            targetDate,
            targetFormat,

            sourceCaseId: "",
            sourceCase: null,
            sourceCasePeriod: null,
            sourceDate: null,
            sourceFormat: null,

            targetViewId: "",
            showCalendar
        }, () => {
            Promise
                .all([
                    this.props.getAssignedViews({caseName: targetCase.name}),
                    this.props.getSourceCasesList({targetCaseId}),
                    this.loadDates(showCalendar)
                ])
                .then(() => this.onFormChanged({isLoading: false}));
        });
    };

    targetViewChanged = (option) => {
        const targetViewId = option && option.value;
        this.loadSequences(targetViewId, this.state.targetCaseId);
        this.onFormChanged({targetViewId});
    };

    loadSequences = (targetViewId, targetCaseId) => {
        if (targetViewId && targetCaseId) {
            this.props.getBalanceSequences({targetViewId, targetCaseId});
        }
    };

    loadDates = (showCalendar) => {
        const {dates, getDatesList} = this.props;
        return !dates && showCalendar ? getDatesList() : null;
    };

    render() {

        this.renderCountTimes = this.renderCountTimes || 0;
        this.renderCountTimes += 1;
        console.info(`"Beg balance page" rendered ${this.renderCountTimes} times`);

        const {casesList, assignedViews, sourceCases, sequences, dates} = this.props;

        return (
            <div className="begining-balance-content">
                <Loading show={this.state.isLoading || !casesList}/>
                <div className={cx("begining-balance-wrapper", {
                    "has-footer": this.state.showFooter
                })}>
                    <div className="container-block">
                        <h3>Destination</h3>
                        <div className="container-blue">

                            {/* Target Case */}
                            <CaseSelect name="targetCaseId"
                                        label="Case"
                                        placeholder="Select Destination Case"
                                        disableLocked={true}
                                        casePeriod={this.state.targetCasePeriod}
                                        value={this.state.targetCaseId}
                                        options={casesList  ? casesList.data : []}
                                        onChange={this.targetCaseChanged}
                                />

                            {/* Case View */}
                            <FormGroup controlId="targetViewId">
                                <ControlLabel>View</ControlLabel>
                                <Select name="targetViewId"
                                        value={this.state.targetViewId}
                                        placeholder="Select View"
                                        options={assignedViews && this.state.targetCaseId ? _.map(assignedViews.data, option => ({
                                                    value: option.id,
                                                    label: option.name
                                                })) : []}
                                        onChange={this.targetViewChanged}
                                    />
                            </FormGroup>

                            {/* Target Date */}
                            <Calendar show={this.state.showCalendar && dates}
                                      labelText="Period"
                                      dates={dates}
                                      pickerWidth="250px"
                                      defaultActive="month"
                                      views={["month", "date"]}
                                      onChange={(date) => this.targetDateChanged(date)}/>
                        </div>
                    </div>

                    <div className="container-block">
                        <h3>Source</h3>
                        <div className="container-blue">

                            {/* Source Case */}
                            <CaseSelect name="sourceCaseId"
                                        label="Case"
                                        value={this.state.sourceCaseId}
                                        placeholder="Select Source Case"
                                        options={sourceCases && this.state.targetCaseId  ? sourceCases.data : []}
                                        onChange={this.sourceCaseChanged}
                                        casePeriod={this.state.sourceCasePeriod}
                                />

                            {/* Source Date */}
                            <Calendar show={this.state.sourceCaseId && this.state.showCalendar && dates}
                                      labelText="Period"
                                      dates={dates}
                                      pickerWidth="240px"
                                      defaultActive="month"
                                      views={["month", "date"]}
                                      onChange={(date) => this.sourceDateChanged(date)}/>
                        </div>
                    </div>

                    <div className="table-beginning-balance">
                        <h3>Destination Case Sequence</h3>

                        <Grid
                            data={sequences ? sequences.data : []}
                            sizesPerPage={[20, 50, 100]}
                            wrapperClassName="table-simple"
                            bodyScheme={[{
                                key: 'period'
                            }, {
                                key: 'name'
                            }]}
                            headerScheme={[{
                                title: 'Period',
                                key: 'period',
                                sortable: true
                            }, {
                                title: 'Source Case',
                                key: 'name',
                                sortable: true
                            }]}
                        />
                    </div>
                </div>

                <ActionFooter show={this.state.showFooter}>
                    <Button disabled={!this.state.clearEnabled} onClick={this.onClear}>Clear</Button>
                    <Button disabled={!this.state.saveEnabled} bsStyle="primary" onClick={this.onSave}>Save</Button>
                </ActionFooter>

            </div>
        );
    };
}

export default BeginningBalanceSettings;
