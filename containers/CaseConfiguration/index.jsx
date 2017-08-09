import React from 'react';
import {connect} from 'react-redux';
import {Tabs, Tab} from "react-bootstrap";

import {getCasesList, resetCases} from '../../actions/cases';
import BeginningBalanceSettings from './BBSettings';
import ConfigureCase from './ConfigureCase';
import CopyCase from './CopyCase';
import CreateNewCase from './CreateNewCase';

const mapDispatchToProps = (dispatch) => ({
    getCasesList: () => dispatch(getCasesList()),
    resetCases: () => dispatch(resetCases())
});

class CaseConfiguration extends React.Component {
    componentDidMount() {
        this.props.getCasesList();
    };

    componentWillUnmount() {
        this.props.resetCases();
    };

    render() {
        return (
            <div>
                <CreateNewCase/>
                <Tabs defaultActiveKey={1} id="case-configuration-tabs" className="tabs-widget">
                    <Tab eventKey={1} title="Configure Case">
                        <ConfigureCase/>
                    </Tab>
                    <Tab eventKey={2} title="Copy Case">
                        <CopyCase/>
                    </Tab>
                    <Tab eventKey={3} title="Beginning Balance Settings">
                        <BeginningBalanceSettings/>
                    </Tab>
                </Tabs>
            </div>
        );
    };
}

export default connect(null, mapDispatchToProps)(CaseConfiguration);