import React, {Component} from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import {connect} from 'react-redux';

import {getUserInfo} from '../actions/authentication';
import Header from '../components/Header';
import NoMatch from './NoMatchPage';
import NotificationContainer from './Notifier';
import Home from './Home';
import Hierarchy from './Hierarchy/index';
import CaseConfiguration from './CaseConfiguration/index';
import Security from './Security';
import Login from '../components/Login';
import Loading from '../components/Loading';

class App extends Component {

    componentWillMount() {
        this.props.getUserInfo();
    }

    static menuItems = [
        {
            path: 'home',
            title: 'Home'
        }, {
            path: 'hierarchy',
            title: 'Hierarchy',
            isDefault: true
        }, {
            path: 'caseConfiguration',
            title: 'Case configuration'
        }, {
            path: 'security',
            title: 'Security'
        }
    ];

    render() {
        const {userInfo, err} = this.props.auth;

        if (err) {
            return <p>{err.toString()}</p>;
        }

        if (userInfo === null) {
            return <Loading show={true} immediately={true}/>;
        }

        return (
            <Router>
                {
                    !userInfo.userID ?
                        <Route path="/" component={Login}/>
                        :
                        <div className="app">
                            <div className="app__header">
                                <Header menuItems={this.constructor.menuItems}/>
                            </div>
                            <div className="app__content container-fluid">
                                <NotificationContainer />
                                <Switch>
                                    <Route exact path="/" component={Hierarchy}/>
                                    <Route path="/home" component={Home}/>
                                    <Route path="/hierarchy" component={Hierarchy}/>
                                    <Route path="/caseConfiguration" component={CaseConfiguration}/>
                                    <Route path="/security" component={Security}/>
                                    <Route component={NoMatch}/>
                                </Switch>
                            </div>
                        </div>
                }
            </Router>
        );
    };
}

export default connect(
    (store) => ({auth: store.auth}),
    {getUserInfo}
)(App);
