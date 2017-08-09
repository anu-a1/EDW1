import React, {Component} from 'react';
import {connect} from "react-redux";
import {Button} from "react-bootstrap";

import {createNewCase, getTypesList, getYearsList} from '../../actions/cases';
import notify from '../../actions/notifier';
import CreateNewCaseContent from '../../components/CaseConfiguration/CreateNewCase';

const mapStateToProps = ({cases}) => ({
    types: cases.types,
    years: cases.years,
    newCase: cases.newCase
});

const mapDispatchToProps = (dispatch) => ({
    notify: (notifierProps) => dispatch(notify(notifierProps)),
    createNewCase: (data) => dispatch(createNewCase(data)),
    getTypesAndYears: () => {
        dispatch(getTypesList());
        dispatch(getYearsList());
    }
});

class CreateNewCase extends Component {
    state = {
        showCreateCase: false
    };

    createCaseClose = () => this.setState({showCreateCase: false});

    createCaseOpen = () => {
        this.props.getTypesAndYears();
        this.setState({showCreateCase: true});
    };
        
    render() {
        return (
            <div className="wrapper-create-btn">
                <Button bsStyle="success" onClick={this.createCaseOpen}>
                    <span className="icon-calc-plus-btns"/>
                    Create new case
                </Button>
                {this.state.showCreateCase && <CreateNewCaseContent
                    show={this.state.showCreateCase}
                    onHide={this.createCaseClose}
                    notify={this.props.notify}
                    createNewCase={this.props.createNewCase}
                    newCase={this.props.newCase}
                    types={this.props.types}
                    years={this.props.years}
                    />}
            </div>
        );
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateNewCase);