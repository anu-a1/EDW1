import React from 'react';
import {connect} from "react-redux";
import {Tabs, Tab, Button} from "react-bootstrap";

import {
    getCasesList, createNewCase, addNewCase, getTypesList, getYearsList, updateCasesList,
    getViewsList, getDimensionsList, getConfigurableDimensionsList, getMembersList, copyCase, clearCase, validateCase, getPeriodMembersList,
    getDatesList, getBalanceSequences, getCaseViews, deleteTargetCaseBegBalance, saveBeginningBalance, getSourceCasesList
} from '../actions/cases';
import notify from '../actions/notifier';
import BeginningBalanceSettings from '../components/CaseConfiguration/BeginningBalanceSettings';
import ConfigureCase from '../components/CaseConfiguration/ConfigureCase';
import CopyCase from '../components/CaseConfiguration/CopyCase';
import CreateNewCase from '../components/CaseConfiguration/CreateNewCase';

const mapStateToProps = (store) => {
    const {cases, user} = store;
    return {
        ...cases,
        user: user.data
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        /* all */
        notify: (notifierProps) => {
            dispatch(notify(notifierProps));
        },
        getCasesList: () => {
            dispatch(getCasesList());
        },
        /* create new case */
        createNewCase: (data) => {
            dispatch(createNewCase(data));
        },
        addNewCase: (data) => {
            dispatch(addNewCase(data));
        },
        getTypesAndYears: () => {
            dispatch(getTypesList());
            dispatch(getYearsList());
        },
        /* configure case */
        updateCasesList: (data) => {
            return dispatch(updateCasesList(data));
        },
        /* copy case */
        getViewsList: () => {
            dispatch(getViewsList());
        },
        getDimensionsList: () => {
            dispatch(getDimensionsList());
        },
        getConfigurableDimensionsList: () => {
            dispatch(getConfigurableDimensionsList());
        },
        getMembersList: (options) => {
            dispatch(getMembersList(options));
        },
        getPeriodMembersList: (options) => {
            dispatch(getPeriodMembersList(options));
        },
        copyCase: (options) => (
            dispatch(copyCase(options))
        ),
        clearCase: (options) => (
            dispatch(clearCase(options))
        ),
        validateCase: (options) => (
            dispatch(validateCase(options))
        ),
        /* beg balance */
        getDatesList: () => (
            dispatch(getDatesList())
        ),
        getBalanceSequences: (options) => (
            dispatch(getBalanceSequences(options))
        ),
        getCaseViews: (options) => (
            dispatch(getCaseViews(options))
        ),
        getSourceCasesList: (options) => (
            dispatch(getSourceCasesList(options))
        ),
        deleteTargetCaseBegBalance: (options) => (
            dispatch(deleteTargetCaseBegBalance(options))
        ),
        saveBeginningBalance: (options) => (
            dispatch(saveBeginningBalance(options))
        )
    };
};

class CaseConfiguration extends React.Component {

    state = {
        showCreateCase: false
    };

    componentDidMount() {
        this.props.getCasesList();
    };

    createCaseClose = () => this.setState({showCreateCase: false});

    createCaseOpen = () => {
        this.props.getTypesAndYears();
        this.setState({showCreateCase: true});
    };

    onSaveNewCase = (caseData) => {
        this.createCaseClose();
        this.props.addNewCase(caseData);
    };

    render() {
        return (
            <div>
                <Button bsStyle="success" className="pull-right" onClick={this.createCaseOpen}>
                    <span className="icon-calc-plus-btns"></span>
                    Create new case
                </Button>
                {this.state.showCreateCase && <CreateNewCase
                    show={this.state.showCreateCase}
                    onHide={this.createCaseClose}
                    notify={this.props.notify}
                    onSave={this.onSaveNewCase}
                    createNewCase={this.props.createNewCase}
                    newCase={this.props.newCase}
                    types={this.props.types}
                    years={this.props.years}
                    />}

                <Tabs defaultActiveKey={1} id="uncontrolled-tab-example" className="tabs-widget">
                    <Tab eventKey={1} title="Configure Case">
                        <ConfigureCase list={this.props.list}
                                       notify={this.props.notify}
                                       updateCasesList={this.props.updateCasesList}/>
                    </Tab>
                    <Tab eventKey={2} title="Copy Case">
                        <CopyCase casesList={this.props.list}
                                  views={this.props.views}
                                  dimensions={this.props.dimensions}
                                  configurableDimensions={this.props.configurableDimensions}
                                  members={this.props.members}
                                  periodMembers={this.props.periodMembers}
                                  userId={this.props.user.id}

                                  notify={this.props.notify}
                                  getViewsList={this.props.getViewsList}
                                  getDimensionsList={this.props.getDimensionsList}
                                  getConfigurableDimensionsList={this.props.getConfigurableDimensionsList}
                                  getMembersList={this.props.getMembersList}
                                  getPeriodMembersList={this.props.getPeriodMembersList}
                                  copyCase={this.props.copyCase}
                                  clearCase={this.props.clearCase}
                                  validateCase={this.props.validateCase}
                            />
                    </Tab>
                    <Tab eventKey={3} title="Beginning Balance Settings">
                        <BeginningBalanceSettings casesList={this.props.list}
                                                  dates={this.props.dates}
                                                  sequences={this.props.sequences}
                                                  caseViews={this.props.caseViews}
                                                  sourceCases={this.props.sourceCases}

                                                  notify={this.props.notify}
                                                  getSourceCasesList={this.props.getSourceCasesList}
                                                  getDatesList={this.props.getDatesList}
                                                  getBalanceSequences={this.props.getBalanceSequences}
                                                  getCaseViews={this.props.getCaseViews}
                                                  deleteTargetCaseBegBalance={this.props.deleteTargetCaseBegBalance}
                                                  saveBeginningBalance={this.props.saveBeginningBalance}
                            />
                    </Tab>
                </Tabs>
            </div>
        );
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CaseConfiguration);