import React, {Component} from 'react';
import {connect} from "react-redux";

import {copyCase, clearCase, validateCase} from '../../actions/cases';
import {getViewsList, resetViews} from '../../actions/viewGroup';
import {getDimensionsList, getConfigurableDimensionsList, resetDimensions} from '../../actions/dimension';
import {getMembersList, getPeriodMembersList, resetDimensionMembers} from '../../actions/dimensionMember';

import notify from '../../actions/notifier';
import CopyCaseContent from '../../components/CaseConfiguration/CopyCase';

const mapStateToProps = ({cases, auth, dimension, dimensionMember, viewGroup}) => ({
    list: cases.list,
    views: viewGroup.views,
    dimensions: dimension.dimensions,
    configurableDimensions: dimension.configurableDimensions,
    members: dimensionMember.members,
    periodMembers: dimensionMember.periodMembers,
    userInfo: auth.userInfo
});

const mapDispatchToProps = (dispatch) => ({
    notify: (notifierProps) => dispatch(notify(notifierProps)),
    getViewsList: () => dispatch(getViewsList()),
    getDimensionsList: () => dispatch(getDimensionsList()),
    getConfigurableDimensionsList: () => dispatch(getConfigurableDimensionsList()),
    getMembersList: (options) => dispatch(getMembersList(options)),
    getPeriodMembersList: (options) => dispatch(getPeriodMembersList(options)),
    copyCase: (options) => dispatch(copyCase(options)),
    clearCase: (options) => dispatch(clearCase(options)),
    validateCase: (options) => dispatch(validateCase(options)),

    resetViews: () => dispatch(resetViews()),
    resetDimensions: () => dispatch(resetDimensions()),
    resetDimensionMembers: () => dispatch(resetDimensionMembers())
});

class CopyCase extends Component {

    componentWillUnmount() {
        this.props.resetViews();
        this.props.resetDimensions();
        this.props.resetDimensionMembers();
    };

    render() {
        return (
            <CopyCaseContent
                casesList={this.props.list}
                views={this.props.views}
                dimensions={this.props.dimensions}
                configurableDimensions={this.props.configurableDimensions}
                members={this.props.members}
                periodMembers={this.props.periodMembers}
                userId={this.props.userInfo.userID}

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
        );
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CopyCase);