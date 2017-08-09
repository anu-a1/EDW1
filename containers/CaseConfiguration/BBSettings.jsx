import React, {Component} from 'react';
import {connect} from "react-redux";

import {
    getDatesList,
    getBalanceSequences,
    getSourceCasesList,
    deleteTargetCaseBegBalance,
    saveBeginningBalance
} from '../../actions/cases';
import {getAssignedViews, resetViews} from '../../actions/viewGroup';

import notify from '../../actions/notifier';
import BeginningBalanceSettingsContent from '../../components/CaseConfiguration/BeginningBalanceSettings';

const mapStateToProps = ({cases, viewGroup}) => ({
    list: cases.list,
    dates: cases.dates,
    sequences: cases.sequences,
    assignedViews: viewGroup.assignedViews,
    sourceCases: cases.sourceCases
});

const mapDispatchToProps = (dispatch) => ({
    notify: (notifierProps) => dispatch(notify(notifierProps)),
    getDatesList: () => dispatch(getDatesList()),
    getBalanceSequences: (options) => dispatch(getBalanceSequences(options)),
    getAssignedViews: (options) => dispatch(getAssignedViews(options)),
    getSourceCasesList: (options) => dispatch(getSourceCasesList(options)),
    deleteTargetCaseBegBalance: (options) => dispatch(deleteTargetCaseBegBalance(options)),
    saveBeginningBalance: (options) => dispatch(saveBeginningBalance(options)),
    resetViews: () => dispatch(resetViews())
});

class BeginningBalanceSettings extends Component {

    componentWillUnmount() {
        this.props.resetViews();
    };

    render() {
        return (
            <BeginningBalanceSettingsContent
                casesList={this.props.list}
                dates={this.props.dates}
                sequences={this.props.sequences}
                assignedViews={this.props.assignedViews}
                sourceCases={this.props.sourceCases}

                notify={this.props.notify}
                getSourceCasesList={this.props.getSourceCasesList}
                getDatesList={this.props.getDatesList}
                getBalanceSequences={this.props.getBalanceSequences}
                getAssignedViews={this.props.getAssignedViews}
                deleteTargetCaseBegBalance={this.props.deleteTargetCaseBegBalance}
                saveBeginningBalance={this.props.saveBeginningBalance}/>
        );
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(BeginningBalanceSettings);